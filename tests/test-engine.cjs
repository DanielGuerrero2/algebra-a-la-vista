(async()=>{
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {run,key}=await import('../src/core/engine.js');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const datasets=read(path.join(__dirname,'../src/data/datasets.json')),expected=read(path.join(__dirname,'fixtures/expected-results.json'));
const canonical=rows=>rows.map(key).sort();
let count=0;
datasets.forEach((d,i)=>d.exercises.forEach((e,j)=>{
  const actual=run(e.expression,d.relations),target=expected[i].results[j];
  assert.deepEqual(actual.cols.slice().sort(),target.cols.slice().sort(),e.title);
  assert.deepEqual(canonical(actual.rows),canonical(target.rows),e.title);
  count++;
}));
const db=datasets[0].relations;
assert.throws(()=>run('Casa union Vendedor',db),/mismas columnas/);
assert.throws(()=>run('sigma desconocido = 1 (Casa)',db),/desconocida/);
assert.equal(run('sigma precio < 0 (Casa)',db).rows.length,0);
assert.equal(run('Casa union Casa',db).rows.length,7);
assert.equal(run('Casa - Casa',db).rows.length,0);
assert.equal(run('Casa intersect Casa',db).rows.length,7);
assert.equal(run('π ciudad (Casa)',db).rows.length,4);
assert.equal(run('sigma precio >= 1000000 and ciudad != \'Chih\' (Casa)',db).rows.length,2);
assert.deepEqual(canonical(run('Vendedor ⋈ Ventas ⋈ Casa',db).rows),canonical(run('Vendedor join Ventas join Casa',db).rows));
console.log(`${count} resultados completos coinciden con los documentos; 9 casos de operadores y errores verificados.`);

})().catch(error=>{console.error(error);process.exitCode=1});

