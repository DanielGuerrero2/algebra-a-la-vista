import { run } from './engine.js';

function delimiterIssue(text) {
  const openings = [];
  let quote = -1;
  for (let index = 0; index < text.length; index++) {
    if (text[index] === "'") {
      if (quote !== -1 && text[index + 1] === "'") { index++; continue; }
      quote = quote === -1 ? index : -1;
    } else if (quote === -1) {
      if (text[index] === '(') openings.push(index);
      if (text[index] === ')') {
        if (!openings.length) return { position: index, hint: 'Este paréntesis de cierre no tiene uno de apertura. Retíralo o añade el paréntesis que falta.' };
        openings.pop();
      }
    }
  }
  if (quote !== -1) return { position: quote, hint: "Falta cerrar esta comilla simple. Escribe el texto completo entre comillas, por ejemplo: 'Chih'." };
  if (openings.length) return { position: openings.at(-1), hint: 'Falta cerrar este paréntesis. Cada ( necesita su ). La relación de entrada debe quedar entre paréntesis.' };
  return null;
}

// The same interpreter validates both the editor and execution; no second grammar.
export function diagnoseExpression(expression, tables) {
  try { run(expression, tables); return null; }
  catch (error) {
    const message = error.message;
    const delimiter = delimiterIssue(expression);
    if (delimiter) return { message, ...delimiter };
    const names = Object.keys(tables);
    const words = expression.split(/\W+/);
    const table = names.find(name => words.includes(name)) || names[0];
    const row = tables[table]?.[0] || {};
    const columns = Object.keys(row);
    const numeric = columns.find(column => typeof row[column] === 'number' && words.includes(column)) || columns.find(column => typeof row[column] === 'number');
    const textual = columns.find(column => typeof row[column] === 'string' && words.includes(column)) || columns.find(column => typeof row[column] === 'string');
    const numberExample = numeric ? `${numeric} > ${row[numeric]}` : 'columnaNumerica > 1000';
    const textExample = textual ? `${textual} = '${row[textual].replaceAll("'", "''")}'` : "columnaDeTexto = 'texto'";
    let hint = 'Revisa el operador, sus argumentos y la tabla de entrada. Abre la Guía para ver la sintaxis con un ejemplo.';
    let position;
    if (message.startsWith('Relación desconocida:')) {
      hint = `Usa una tabla de esta base y respeta sus mayúsculas: ${Object.keys(tables).join(', ')}.`;
      const name = message.slice('Relación desconocida: '.length);
      if (expression.includes(name)) position = expression.lastIndexOf(name);
    } else if (message.startsWith('Columna desconocida:')) {
      hint = `Si es una columna, copia su nombre de la tabla original. Si es un valor de texto, usa comillas simples, por ejemplo: ${textExample}.`;
      position = expression.lastIndexOf(message.slice('Columna desconocida: '.length));
    } else if (message.includes('proyección')) {
      hint = `Después de π, escribe columnas existentes separadas por comas, sin repetirlas, y la relación entre paréntesis. Ejemplo: π ${columns.slice(0, 2).join(', ')} (${table}).`;
    } else if (message.includes('distinto tipo')) {
      hint = `Escribe números sin comillas, por ejemplo: ${numberExample}. El texto lleva comillas simples, como ${textExample}.`;
    } else if (message.includes('Falta el valor')) {
      hint = `Añade un valor después del comparador. Ejemplo: σ ${numberExample} (${table}).`;
    } else if (message.includes('comparador') || message.includes('Condición incompleta')) {
      hint = 'Usa columna, comparador y valor. Comparadores: =, !=, >, <, >=, <=. Une condiciones completas con and u or.';
    } else if (message.includes('Símbolo no reconocido')) {
      position = Number(message.match(/posición (\d+)/)?.[1]) - 1;
      hint = "Usa los botones de símbolos y comillas simples para el texto. Los comparadores permitidos son =, !=, >, <, >= y <=.";
    } else if (message.startsWith('Se esperaba')) {
      hint = 'Selección: σ condición (Tabla). Proyección: π columna, otraColumna (Tabla). Encierra la relación de entrada entre paréntesis.';
    } else if (message.startsWith('El join no puede relacionar')) {
      hint = 'Las columnas que conectan un join deben tener el mismo tipo en ambas relaciones. Elige otra tabla o proyecta columnas compatibles.';
    } else if (message.includes('mismas columnas') || message.includes('Tipos incompatibles')) {
      hint = 'Para ∪, − e ∩, las dos relaciones necesitan las mismas columnas y tipos. Proyecta las mismas columnas en ambos lados si es necesario.';
    } else if (message.startsWith('Texto inesperado')) {
      hint = 'Entre dos relaciones escribe un operador como ⋈, ∪, − o ∩. En las condiciones utiliza and u or en minúsculas.';
    }
    return { message, hint, ...(Number.isInteger(position) && position >= 0 ? { position } : {}) };
  }
}
