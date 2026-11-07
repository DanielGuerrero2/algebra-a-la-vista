import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, reduceSession } from '../src/core/session.js';

test('edits do not replace the executed expression',()=>{
  const original=createSession('Casa');
  const edited=reduceSession(original,{type:'edit',expression:'σ precio > (Casa)'});
  assert.equal(edited.executed,'Casa');
  assert.equal(edited.expression,'σ precio > (Casa)');
});
test('undo restores valid expression before stepping through history',()=>{
  let state=reduceSession(createSession('Casa'),{type:'execute',expression:'π ciudad (Casa)',valid:true});
  state=reduceSession(state,{type:'edit',expression:'incompleta'});
  state=reduceSession(state,{type:'undo'});
  assert.equal(state.expression,'π ciudad (Casa)');
  state=reduceSession(state,{type:'undo'});
  assert.equal(state.expression,'Casa');
  state=reduceSession(state,{type:'redo'});
  assert.equal(state.expression,'π ciudad (Casa)');
});
test('failed execution never adds invalid expressions to history',()=>{
  const state=reduceSession(createSession('Casa'),{type:'execute',expression:'incompleta',valid:false});
  assert.deepEqual(state.history,['Casa']);
  assert.equal(state.executed,'incompleta');
});
test('drafts from the previous site keep their history and assisted state',()=>{
  const state=createSession('Casa',{source:'Casa',expression:'π ciudad (Casa)',history:['Casa','π ciudad (Casa)'],historyIndex:1,assisted:true});
  assert.equal(state.index,1);
  assert.equal(state.assisted,true);
  const reset=reduceSession(state,{type:'reset'});
  assert.equal(reset.assisted,false);
  assert.equal(reset.expression,'Casa');
});
test('history stays bounded and discards the redo branch after a new operation',()=>{
  let state=createSession('Casa');
  for(let i=0;i<70;i++)state=reduceSession(state,{type:'execute',expression:`σ precio > ${i} (Casa)`,valid:true});
  assert.equal(state.history.length,50);
  state=reduceSession(state,{type:'undo'});
  state=reduceSession(state,{type:'execute',expression:'π ciudad (Casa)',valid:true});
  assert.equal(state.index,state.history.length-1);
});
test('results appear only after an explicit execute or check',()=>{
  let state=createSession('Casa');
  assert.equal(state.resultVisible,false);
  state=reduceSession(state,{type:'execute',expression:'π ciudad (Casa)',valid:true,showResult:false});
  assert.equal(state.resultVisible,false);
  state=reduceSession(state,{type:'execute',expression:'π ciudad (Casa)',valid:true});
  assert.equal(state.resultVisible,true);
  state=reduceSession(state,{type:'edit',expression:'σ precio > (Casa)'});
  assert.equal(state.resultVisible,false);
  state=reduceSession(state,{type:'execute',expression:'σ precio > (Casa)',valid:false});
  assert.equal(state.resultVisible,true);
  state=reduceSession(state,{type:'undo'});
  assert.equal(state.resultVisible,false);
  state=reduceSession(state,{type:'solution',expression:'Casa'});
  assert.equal(state.resultVisible,false);
});
