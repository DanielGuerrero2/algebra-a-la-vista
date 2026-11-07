import * as algebra from './engine.js';

const symbols={sigma:'σ',pi:'π',join:'⋈',union:'∪',intersect:'∩',cross:'×',divide:'÷'};
function symbolize(text){return text.split(/('(?:[^']|'')*(?:'|$))/g).map((part,i)=>i%2?part:part.replace(/\b(sigma|pi|join|union|intersect|cross|divide)\b/g,w=>symbols[w])).join('')}
function value(raw,type){if(raw===null||raw===undefined)throw Error('Escribe un valor para continuar.');if(type==='number'){if(String(raw).trim()===''||!Number.isFinite(Number(raw)))throw Error('Escribe un número válido.');return Number(raw)}return String(raw)}
function quote(v){return typeof v==='number'?String(v):"'"+String(v).replaceAll("'","''")+"'"}
function condition(filters,logic,relation){if(!filters.length)throw Error('Añade al menos una condición.');return filters.map(f=>{if(!relation.cols.includes(f.column))throw Error('La columna '+f.column+' ya no está en la consulta.');return `${f.column} ${f.operator} ${quote(value(f.value,relation.types[f.column]))}`}).join(logic==='or'?' or ':' and ')}
function literal(rows,relation){const schema=relation.cols.map(c=>`${c}:${relation.types[c]==='number'?'number':'string'}`).join(', ');return `{ ${schema}\n${rows.map(r=>'  '+relation.cols.map(c=>quote(r[c])).join(', ')).join('\n')}\n}`}
function suggestJoinTable(relation,tables){const used=new Set();function visit(node){if(!node.children.length&&Object.hasOwn(tables,node.label))used.add(node.label);node.children.forEach(visit)}visit(relation);const names=Object.keys(tables).filter(name=>Object.keys(tables[name][0]||{}).some(column=>relation.cols.includes(column)));return names.find(name=>!used.has(name))||null}
function builderIssue(config, relation) {
  const incomplete = (field, message) => ({ field, kind: 'incomplete', message });
  const invalid = (field, message) => ({ field, kind: 'invalid', message });
  const numberIssue = (raw, field) => String(raw).trim() === '' || !Number.isFinite(Number(raw))
    ? invalid(field, 'Escribe un número válido para continuar.') : null;
  if (['select', 'delete', 'update'].includes(config.op)) {
    for (const [index, filter] of config.filters.entries()) {
      const field = `filter-${index}`;
      if (filter.value == null) return incomplete(field, `Escribe el valor de la condición ${index + 1}.`);
      if (relation.types[filter.column] === 'number') {
        const issue = numberIssue(filter.value, field);
        if (issue) return issue;
      }
    }
  }
  if (config.op === 'project' && !config.columns.length) return incomplete('columns', 'Selecciona al menos una columna.');
  if (config.op === 'join' && !config.table) return incomplete('table', 'Elige la tabla que vas a conectar.');
  if (config.op === 'insert') {
    for (const column of relation.cols) {
      const field = `row-${column}`;
      if (!Object.hasOwn(config.row, column)) return incomplete(field, `Escribe un valor para ${column}.`);
      if (relation.types[column] === 'number') {
        const issue = numberIssue(config.row[column], field);
        if (issue) return issue;
      }
    }
  }
  if (config.op === 'update') {
    if (config.value == null) return incomplete('value', 'Escribe el valor nuevo.');
    if (relation.types[config.field] === 'number') return numberIssue(config.value, 'value');
  }
  if (['union', 'difference', 'intersect', 'divide'].includes(config.op) && !config.other?.trim()) {
    return incomplete('other', 'Elige una tabla o escribe la segunda relación.');
  }
  return null;
}
function build(source,config,db){const n=algebra.run(source,db),s=`(${source})`;const op=config.op;let result;
if(op==='select'||op==='delete'||op==='update'){const where=condition(config.filters,config.logic,n),selected=`σ ${where} (${source})`;if(op==='select')result=selected;else if(op==='delete')result=`${s} − (${selected})`;else{if(!n.cols.includes(config.field))throw Error('Elige una columna para modificar.');if(config.mode==='add'&&n.types[config.field]!=='number')throw Error('Solo puedes sumar a columnas numéricas.');const v=value(config.value,n.types[config.field]);const matches=algebra.run(selected,db).rows;const updated=matches.map(r=>({...r,[config.field]:config.mode==='add'?r[config.field]+v:v}));result=`(${s} − (${selected})) ∪ ${literal(updated,n)}`}}
else if(op==='project'){if(!config.columns.length)throw Error('Elige al menos una columna.');if(config.columns.some(c=>!n.cols.includes(c)))throw Error('Las columnas han cambiado. Vuelve a elegirlas.');result=`π ${config.columns.join(', ')} (${source})`}
else if(op==='join'){if(!Object.hasOwn(db,config.table))throw Error('Elige una tabla para conectar.');result=`${s} ⋈ ${config.table}`}
else if(op==='insert'){const row=Object.fromEntries(n.cols.map(c=>[c,value(config.row[c]??'',n.types[c])]));result=`${s} ∪ ${literal([row],n)}`}
else if(['union','difference','intersect','divide'].includes(op)){if(!config.other?.trim())throw Error('Escribe o elige la segunda relación.');result=`${s} ${op==='union'?'∪':op==='difference'?'−':op==='divide'?'÷':'∩'} (${config.other})`}
else throw Error('Elige una operación.');algebra.run(result,db);return symbolize(result)}
function compare(actual,expected){const missingColumns=expected.cols.filter(c=>!actual.cols.includes(c)),extraColumns=actual.cols.filter(c=>!expected.cols.includes(c));const a=new Set(actual.rows.map(algebra.key)),b=new Set(expected.rows.map(algebra.key));const missing=expected.rows.filter(r=>!a.has(algebra.key(r))),extra=actual.rows.filter(r=>!b.has(algebra.key(r)));return{correct:!missingColumns.length&&!extraColumns.length&&!missing.length&&!extra.length,missingColumns,extraColumns,missing,extra}}
export { symbolize, value, quote, condition, literal, build, compare, suggestJoinTable, builderIssue };


