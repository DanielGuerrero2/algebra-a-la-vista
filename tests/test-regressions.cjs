(async()=>{
const assert=require('node:assert/strict');
const {run}=await import('../src/core/engine.js');
const db={Items:[{id:1,precio:10,ciudad:'Chih'},{id:2,precio:20,ciudad:'Juarez'}]};
const tests=[
 ['expresión vacía',()=>assert.throws(()=>run('   ',db),/Escribe una expresión/)],
 ['condiciones agrupadas',()=>assert.equal(run("sigma (precio > 10 or ciudad = 'Chih') and id > 0 (Items)",db).rows.length,2)],
 ['números negativos',()=>assert.equal(run('sigma precio > -1 (Items)',db).rows.length,2)],
 ['error de condición incompleta',()=>assert.throws(()=>run('sigma precio > (Items)',db),/Falta el valor/)],
 ['proyección duplicada',()=>assert.throws(()=>run('pi id, id (Items)',db),/repetida/)],
 ['tipos incompatibles',()=>assert.throws(()=>run("sigma precio > 'abc' (Items)",db),/tipo/)],
];
let failed=0;for(const [name,test] of tests){try{test();console.log('OK',name)}catch(e){failed++;console.error('FAIL',name,e.message)}}if(failed)process.exitCode=1;

})().catch(error=>{console.error(error);process.exitCode=1});

