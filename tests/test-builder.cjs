(async()=>{
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const {run}=await import('../src/core/engine.js'),m=await import('../src/core/lab-model.js');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../src/data/datasets.json'),'utf8').replace(/^\uFEFF/,''));
const db=data[0].relations;
const evaluate=(src,c)=>run(m.build(src,c,db),db);
assert.equal(m.symbolize("sigma nombre = 'sigma join' (Vendedor join Ventas)"),"σ nombre = 'sigma join' (Vendedor ⋈ Ventas)");
const chih={column:'ciudad',operator:'=',value:'Chih'};
assert.equal(evaluate('Casa',{op:'select',filters:[chih],logic:'and'}).rows.length,3);
assert.equal(evaluate('Casa',{op:'update',filters:[chih],field:'precio',mode:'add',value:500000}).rows.find(r=>r.numCasa===1024).precio,1200000);
assert.equal(evaluate('Casa',{op:'delete',filters:[{...chih,value:'Juarez'}]}).rows.length,6);
assert.equal(evaluate('Casa',{op:'update',filters:[{...chih,value:'NO EXISTE'}],field:'precio',mode:'add',value:500000}).rows.length,7);
assert.throws(()=>m.build('Casa',{op:'project',columns:[]},db),/al menos/);
assert.throws(()=>m.build('Casa',{op:'select',filters:[{...chih,column:'precio',value:''}]},db),/número/);
assert.throws(()=>m.build('Casa',{op:'select',filters:[{...chih,value:null}]},db),/valor/);
assert.throws(()=>m.build('Casa',{op:'update',filters:[chih],field:'ciudad',mode:'set',value:null},db),/valor/);
const casa=run('Casa',db);
assert.equal(m.builderIssue({op:'select',filters:[{...chih,value:null}]},casa)?.field,'filter-0');
assert.equal(m.builderIssue({op:'select',filters:[{column:'precio',operator:'>',value:'abc'}]},casa)?.kind,'invalid');
assert.equal(m.builderIssue({op:'select',filters:[chih]},casa),null);
assert.equal(m.builderIssue({op:'project',columns:[]},casa)?.field,'columns');
assert.equal(m.builderIssue({op:'join',table:''},casa)?.field,'table');
assert.equal(m.builderIssue({op:'insert',row:{}},casa)?.field,'row-numCasa');
assert.equal(m.builderIssue({op:'update',filters:[chih],field:'precio',value:null},casa)?.field,'value');
assert.equal(m.builderIssue({op:'union',other:''},casa)?.field,'other');
assert.equal(evaluate("σ precio > 99999999 (Casa)",{op:'insert',row:{numCasa:999,calle:'Prueba',numero:1,colonea:'Prueba',ciudad:'Chih',precio:1}}).rows.length,1);
assert.equal(evaluate('Vendedor',{op:'join',table:'Ventas'}).rows.length,5);
assert.equal(m.suggestJoinTable(run('Vendedor',db),db),'Ventas');
assert.equal(m.suggestJoinTable(run('Vendedor ⋈ Ventas',db),db),'Casa');
assert.equal(m.suggestJoinTable(run('π ciudad (Casa)',db),{Casa:db.Casa}),null);
assert.equal(evaluate('Casa',{op:'union',other:'Casa'}).rows.length,7);
assert.equal(evaluate('Casa',{op:'difference',other:"σ ciudad = 'Juarez' (Casa)"}).rows.length,6);
assert.equal(evaluate('Casa',{op:'intersect',other:'Casa'}).rows.length,7);
const autos=data[3].relations;
const pairs='π placaVehiculo, codigoServicio (Reparaciones)';
assert.deepEqual(run(m.build(pairs,{op:'divide',other:'π codigoServicio (Servicios)'},autos),autos).rows,[{placaVehiculo:15554},{placaVehiculo:16653}]);
const actual=run('π nombre (Vendedor ⋈ Ventas ⋈ Casa)',db),expected=run(data[0].exercises[0].expression,db);
assert.equal(m.compare(expected,expected).correct,true);assert.equal(m.compare(actual,expected).extra.length,1);
console.log('Casos del constructor y la comparación verificados.');

// Every operation must consume the preceding result without modifying the database.
const original=JSON.stringify(db);
let chain=m.build('Casa',{op:'select',filters:[{column:'precio',operator:'>',value:1000000}],logic:'and'},db);
chain=m.build(chain,{op:'join',table:'Ventas'},db);
chain=m.build(chain,{op:'join',table:'Vendedor'},db);
chain=m.build(chain,{op:'project',columns:['nombre']},db);
assert.deepEqual(run(chain,db).rows.map(row=>row.nombre).sort(),['Hugo','Jorge','Luis']);
assert.equal(JSON.stringify(db),original);
console.log('Encadenamiento selección → joins → proyección verificado.');

})().catch(error=>{console.error(error);process.exitCode=1});

