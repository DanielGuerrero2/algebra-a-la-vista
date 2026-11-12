const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_ROWS = 20000;
const IDENTIFIER = /^[A-Za-z_][A-Za-z_0-9]*$/;
const RESERVED = new Set(['__proto__', 'constructor', 'prototype']);
const NUMBER = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

function csvRows(text) {
  const rows = [];
  let row = [], field = '', quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else field += char;
    } else if (char === ',' || char === '\n' || char === '\r') {
      row.push(field); field = ''; closed = false;
      if (char !== ',') {
        rows.push(row); row = [];
        if (char === '\r' && text[i + 1] === '\n') i++;
      }
    } else if (char === '"' && !field && !closed) quoted = true;
    else if (char === '"' || closed) throw Error('CSV inválido: revisa las comillas.');
    else field += char;
  }
  if (quoted) throw Error('CSV inválido: falta cerrar una comilla.');
  if (field || row.length || closed) rows.push([...row, field]);
  return rows;
}

function validateRows(rows) {
  if (!Array.isArray(rows)) throw Error('El JSON debe contener un arreglo de filas.');
  if (!rows.length) throw Error('El archivo necesita al menos una fila de datos.');
  if (rows.length > MAX_ROWS) throw Error('El archivo supera el límite de 20 000 filas.');
  if (rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw Error('Cada fila debe ser un objeto con columnas.');
  const columns = Object.keys(rows[0]);
  if (!columns.length || columns.some(column => !IDENTIFIER.test(column) || RESERVED.has(column))) throw Error('Usa nombres de columnas como id, nombre o precio_total.');
  const types = Object.fromEntries(columns.map(column => [column, typeof rows[0][column]]));
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const keys = Object.keys(row);
    if (keys.length !== columns.length || columns.some(column => !Object.hasOwn(row, column))) throw Error(`La fila ${i + 1} no tiene las mismas columnas.`);
    for (const column of columns) {
      const value = row[column];
      if (!['string', 'number'].includes(typeof value) || typeof value === 'number' && !Number.isFinite(value)) throw Error(`Valor inválido en ${column}, fila ${i + 1}: usa texto o números finitos.`);
      if (typeof value !== types[column]) throw Error(`La columna ${column} cambia de tipo en la fila ${i + 1}.`);
    }
  }
  return rows;
}

export function parseTableFile(filename, text) {
  const match = /^(.+)\.(csv|json)$/i.exec(filename);
  if (!match) throw Error('Elige un archivo CSV o JSON.');
  const name = match[1];
  if (!IDENTIFIER.test(name) || RESERVED.has(name)) throw Error('El nombre de tabla debe usar letras, números o guion bajo y comenzar con una letra o guion bajo.');
  if (new Blob([text]).size > MAX_FILE_SIZE) throw Error('El archivo supera 2 MB.');
  let rows;
  if (match[2].toLowerCase() === 'json') {
    try { rows = JSON.parse(text.replace(/^\uFEFF/, '')); }
    catch { throw Error('JSON inválido: revisa la sintaxis del archivo.'); }
  } else {
    const records = csvRows(text.replace(/^\uFEFF/, ''));
    const columns = records.shift();
    if (!columns?.length || columns.some(column => !IDENTIFIER.test(column) || RESERVED.has(column))) throw Error('Usa nombres de columnas como id, nombre o precio_total.');
    if (new Set(columns).size !== columns.length) throw Error('Hay una columna repetida.');
    if (!records.length) throw Error('El archivo necesita al menos una fila de datos.');
    if (records.length > MAX_ROWS) throw Error('El archivo supera el límite de 20 000 filas.');
    for (let i = 0; i < records.length; i++) {
      if (records[i].length !== columns.length) throw Error(`La fila ${i + 2} no tiene ${columns.length} columnas.`);
      if (records[i].some(value => value === '')) throw Error(`La fila ${i + 2} tiene una celda vacía.`);
    }
    const numeric = columns.map((_, index) => records.every(values => NUMBER.test(values[index]) && Number.isFinite(Number(values[index]))));
    rows = records.map(record => Object.fromEntries(columns.map((column, index) => [column, numeric[index] ? Number(record[index]) : record[index]])));
  }
  return { name, rows: validateRows(rows) };
}

function groupFields(line) {
  const fields = [];
  let value = '', quoted = false, closed = false, started = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === "'" && line[i + 1] === "'") { value += "'"; i++; }
      else if (char === "'") { quoted = false; closed = true; }
      else value += char;
    } else if (char === ',') {
      fields.push(value.trim());
      value = ''; closed = false; started = false;
    } else if (char === "'" && !started && !value.trim()) {
      value = ''; quoted = true; started = true;
    } else if (char === "'" || closed && !/\s/.test(char)) {
      throw Error('Comillas inválidas en una fila.');
    } else if (!closed) {
      value += char;
      if (!/\s/.test(char)) started = true;
    }
  }
  if (quoted) throw Error('Falta cerrar una comilla en una fila.');
  fields.push(value.trim());
  return fields;
}

export function parseTableGroup(filename, text) {
  if (!/\.txt$/i.test(filename)) throw Error('El grupo debe ser un archivo TXT.');
  if (new Blob([text]).size > MAX_FILE_SIZE) throw Error('El archivo supera 2 MB.');
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('--'));
  const group = /^group\s*:\s*(.+)$/i.exec(lines.shift() || '');
  if (!group) throw Error('El archivo debe comenzar con group: NOMBRE.');
  const tables = {};
  let position = 0;
  while (position < lines.length) {
    const match = /^([A-Za-z_][A-Za-z_0-9]*)\s*=\s*\{$/.exec(lines[position++]);
    if (!match || RESERVED.has(match[1])) throw Error(`Se esperaba NombreTabla = { cerca de la línea ${position + 1}.`);
    const name = match[1];
    if (Object.hasOwn(tables, name)) throw Error(`Relación repetida: ${name}.`);
    const schema = lines[position++];
    if (!schema) throw Error(`Falta el esquema de ${name}.`);
    const columns = schema.split(',').map(part => part.trim().split(/\s*:\s*/));
    if (columns.some(parts => parts.length !== 2 || !IDENTIFIER.test(parts[0] || '') || RESERVED.has(parts[0]) || !/^(number|string)$/i.test(parts[1] || ''))) {
      throw Error(`Columna o tipo inválido en ${name}. Usa columna:number o columna:string.`);
    }
    if (new Set(columns.map(([column]) => column)).size !== columns.length) throw Error(`Hay una columna repetida en ${name}.`);
    const rows = [];
    while (position < lines.length && lines[position] !== '}') {
      const line = lines[position++];
      let fields;
      try { fields = groupFields(line); }
      catch (error) { throw Error(`${name}, fila ${rows.length + 1}: ${error.message}`); }
      if (fields.length !== columns.length || fields.some(value => value === '')) throw Error(`${name}, fila ${rows.length + 1}: se esperaban ${columns.length} valores no vacíos.`);
      const row = {};
      for (let i = 0; i < columns.length; i++) {
        const [column, type] = columns[i];
        if (type.toLowerCase() === 'number') {
          if (!NUMBER.test(fields[i]) || !Number.isFinite(Number(fields[i]))) throw Error(`${name}, fila ${rows.length + 1}: ${column} debe ser un número.`);
          row[column] = Number(fields[i]);
        } else row[column] = fields[i];
      }
      rows.push(row);
      if (rows.length > MAX_ROWS) throw Error(`${name} supera el límite de 20 000 filas.`);
    }
    if (lines[position++] !== '}') throw Error(`Falta cerrar la relación ${name} con }.`);
    try { tables[name] = validateRows(rows); }
    catch (error) { throw Error(`${name}: ${error.message}`); }
  }
  if (!Object.keys(tables).length) throw Error('El grupo no contiene relaciones.');
  return { title: group[1].trim(), tables };
}
