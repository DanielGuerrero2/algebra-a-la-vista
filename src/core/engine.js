/* A small, deterministic relational algebra interpreter; never evaluates JavaScript. */

const MAX_ROWS = 20000;
const ROW_LIMIT_ERROR = 'El resultado supera 20 000 filas. Aplica un filtro antes de combinar las tablas.';
const priority = { union: 1, '∪': 1, '-': 1, '−': 1, intersect: 1, '∩': 1, join: 2, '⋈': 2, cross: 2, '×': 2, divide: 2, '÷': 2 };

const key = row => JSON.stringify(Object.entries(row).sort(([a], [b]) => a.localeCompare(b)));
const dedupe = rows => [...new Map(rows.map(row => [key(row), row])).values()];

function tokenize(text) {
  const tokens = [];
  const re = /\s+|'(?:[^']|'')*'|-?\d+(?:\.\d+)?|!=|>=|<=|[A-Za-z_][\w]*|[σπ⋈∪∩×−÷]|[(){}:,=><+*-]/gy;
  let pos = 0;
  while (pos < text.length) {
    re.lastIndex = pos;
    const match = re.exec(text);
    if (!match) throw Error('Símbolo no reconocido en la posición ' + (pos + 1));
    pos = re.lastIndex;
    if (!/^\s+$/.test(match[0])) tokens.push(match[0]);
  }
  return tokens;
}

function literal(token) {
  if (token?.startsWith("'")) return token.slice(1, -1).replaceAll("''", "'");
  if (/^-?\d/.test(token || '')) return Number(token);
  return undefined;
}

function node(label, cols, rows, children = [], declaredTypes = {}) {
  if (rows.length > MAX_ROWS) throw Error(ROW_LIMIT_ERROR);
  const types = Object.fromEntries(cols.map(col => [
    col,
    declaredTypes[col] || (rows.length ? typeof rows[0][col] : children.map(child => child.types?.[col]).find(Boolean)),
  ]));
  return { label, cols, types, rows: dedupe(rows), children };
}

function predicate(tokens, cols, types) {
  let pos = 0;
  function value() {
    const token = tokens[pos++];
    if (token === undefined) throw Error('Falta el valor de la condición. Ejemplo: precio > 1000000.');
    const parsed = literal(token);
    if (parsed !== undefined) return { get: () => parsed, type: typeof parsed };
    if (!cols.includes(token)) throw Error('Columna desconocida: ' + token);
    return { get: row => row[token], type: types[token] };
  }
  function comparison() {
    if (tokens[pos] === '(') {
      pos++;
      const condition = or();
      if (tokens[pos++] !== ')') throw Error('Falta cerrar condición');
      return condition;
    }
    const left = value();
    const operator = tokens[pos++];
    if (!['=', '!=', '>', '<', '>=', '<='].includes(operator)) {
      throw Error('Falta un comparador válido (=, !=, >, <, >=, <=).');
    }
    const right = value();
    if (left.type && right.type && left.type !== right.type) {
      throw Error('Los valores de la condición tienen distinto tipo: compara números con números y texto con texto.');
    }
    return row => {
      const a = left.get(row);
      const b = right.get(row);
      return operator === '=' ? a === b : operator === '!=' ? a !== b
        : operator === '>' ? a > b : operator === '<' ? a < b
          : operator === '>=' ? a >= b : a <= b;
    };
  }
  function and() {
    let condition = comparison();
    while (tokens[pos] === 'and') {
      pos++;
      const next = comparison();
      const previous = condition;
      condition = row => previous(row) && next(row);
    }
    return condition;
  }
  function or() {
    let condition = and();
    while (tokens[pos] === 'or') {
      pos++;
      const next = and();
      const previous = condition;
      condition = row => previous(row) || next(row);
    }
    return condition;
  }
  const condition = or();
  if (pos !== tokens.length) throw Error('Condición incompleta');
  return condition;
}

function combine(left, right, operator) {
  const join = ['join', '⋈'].includes(operator);
  const common = left.cols.filter(col => right.cols.includes(col));
  if (!join && common.length) throw Error('El producto requiere nombres de columnas distintos');
  if (join) {
    for (const col of common) {
      if (left.types[col] && right.types[col] && left.types[col] !== right.types[col]) {
        throw Error('El join no puede relacionar la columna ' + col + ': tipos incompatibles.');
      }
    }
  }
  const cols = [...left.cols, ...right.cols.filter(col => !left.cols.includes(col))];
  const rows = [];
  for (const a of left.rows) {
    for (const b of right.rows) {
      if (join && !common.every(col => a[col] === b[col])) continue;
      if (rows.length === MAX_ROWS) throw Error(ROW_LIMIT_ERROR);
      rows.push({ ...a, ...b });
    }
  }
  return node(join ? '⋈ ' + (common.join(', ') || 'sin columnas comunes') : '×', cols, rows, [left, right]);
}

function setOperation(left, right, operator) {
  if (left.cols.length !== right.cols.length || left.cols.some(col => !right.cols.includes(col))) {
    throw Error('Unión, diferencia e intersección requieren las mismas columnas');
  }
  for (const col of left.cols) {
    if (left.types[col] && right.types[col] && left.types[col] !== right.types[col]) {
      throw Error('Tipos incompatibles en ' + col);
    }
  }
  const keys = new Set(right.rows.map(key));
  const union = ['union', '∪'].includes(operator);
  const intersect = ['intersect', '∩'].includes(operator);
  const rows = union ? [...left.rows, ...right.rows]
    : intersect ? left.rows.filter(row => keys.has(key(row)))
      : left.rows.filter(row => !keys.has(key(row)));
  return node(union ? '∪ Unión' : intersect ? '∩ Intersección' : '− Diferencia', left.cols, rows, [left, right]);
}

function divide(left, right) {
  if (!right.cols.length || right.cols.some(col => !left.cols.includes(col))) {
    throw Error('La división requiere columnas del divisor presentes en la primera relación.');
  }
  for (const col of right.cols) {
    if (left.types[col] && right.types[col] && left.types[col] !== right.types[col]) {
      throw Error('Tipos incompatibles en ' + col);
    }
  }
  const cols = left.cols.filter(col => !right.cols.includes(col));
  if (!cols.length) throw Error('La división requiere al menos una columna fuera del divisor.');
  const candidates = dedupe(left.rows.map(row => Object.fromEntries(cols.map(col => [col, row[col]]))));
  const pairs = new Set(left.rows.map(key));
  const rows = candidates.filter(candidate => right.rows.every(divisor => pairs.has(key({ ...candidate, ...divisor }))));
  return node('÷ División', cols, rows, [left, right]);
}

function run(text, db, schemas = {}) {
  if (!text.trim()) throw Error('Escribe una expresión o elige una tabla inicial para comenzar.');
  if (text.length > 60000) throw Error('La consulta es demasiado larga. Reduce su tamaño.');
  const tokens = tokenize(text);
  let pos = 0;
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];
  function need(token) {
    if (take() !== token) throw Error('Se esperaba ' + token + ' cerca de ' + (peek() || 'el final'));
  }
  function relationLiteral() {
    const cols = [];
    const types = [];
    while (peek() && /^[A-Za-z_]/.test(peek())) {
      cols.push(take());
      need(':');
      const type = take();
      if (!['number', 'string'].includes(type)) throw Error('Tipo desconocido: ' + type);
      types.push(type);
      if (peek() === ',') take();
      else break;
    }
    if (!cols.length) throw Error('La relación necesita columnas y tipos');
    const rows = [];
    while (peek() && peek() !== '}') {
      const row = {};
      for (let index = 0; index < cols.length; index++) {
        const value = literal(take());
        if (value === undefined || typeof value !== types[index]) throw Error('Valor inválido en ' + cols[index]);
        row[cols[index]] = value;
        if (index < cols.length - 1) need(',');
      }
      rows.push(row);
      if (rows.length > MAX_ROWS) throw Error(ROW_LIMIT_ERROR);
    }
    need('}');
    return node('Nuevas filas', cols, rows, [], Object.fromEntries(cols.map((col, index) => [col, types[index]])));
  }
  function unary(operator) {
    const args = [];
    let depth = 0;
    while (peek()) {
      if (peek() === '(' && depth === 0 && args.length && !['and', 'or'].includes(args.at(-1))) break;
      const token = take();
      if (token === '(') depth++;
      if (token === ')') depth--;
      args.push(token);
      if (depth < 0) throw Error('Revisa los paréntesis de la condición.');
    }
    need('(');
    const source = expression();
    need(')');
    if (['pi', 'π'].includes(operator)) {
      const cols = args.filter(token => token !== ',');
      if (!cols.length || cols.some(col => !source.cols.includes(col))) throw Error('Revisa las columnas de la proyección');
      if (new Set(cols).size !== cols.length) throw Error('Hay una columna repetida en la proyección.');
      return node('π ' + cols.join(', '), cols,
        source.rows.map(row => Object.fromEntries(cols.map(col => [col, row[col]]))), [source]);
    }
    const condition = predicate(args, source.cols, source.types);
    return node('σ ' + args.join(' '), source.cols, source.rows.filter(condition), [source]);
  }
  function atom() {
    const token = take();
    if (token === '(') {
      const result = expression();
      need(')');
      return result;
    }
    if (['pi', 'π', 'sigma', 'σ'].includes(token)) return unary(token);
    if (token === '{') return relationLiteral();
    if (!Object.hasOwn(db, token)) throw Error('Relación desconocida: ' + token);
    const rows = db[token];
    const cols = rows.length ? Object.keys(rows[0]) : Object.keys(schemas[token] || {});
    return node(token, cols, rows, [], rows.length ? {} : schemas[token] || {});
  }
  function expression(min = 0) {
    let left = atom();
    while (peek() && Object.hasOwn(priority, peek()) && priority[peek()] >= min) {
      const operator = take();
      const right = expression(priority[operator] + 1);
      left = ['join', '⋈', 'cross', '×'].includes(operator)
        ? combine(left, right, operator) : ['divide', '÷'].includes(operator)
          ? divide(left, right) : setOperation(left, right, operator);
    }
    return left;
  }
  const result = expression();
  if (pos !== tokens.length) throw Error('Texto inesperado: ' + peek());
  return result;
}

export { run, key };
