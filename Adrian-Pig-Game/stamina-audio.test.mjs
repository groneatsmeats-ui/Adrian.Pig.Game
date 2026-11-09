import assert from 'node:assert/strict';
import {createGame,updateStamina} from './dist/core.mjs';
import {BreathAudio,breathingVariation} from './dist/breath-audio.mjs';
let g=createGame();assert.equal(breathingVariation(g),1);updateStamina(g,{sprint:true},.05);assert.equal(g.stamina,100);assert.equal(breathingVariation(g),1);
updateStamina(g,{sprint:true,forward:1},.05);assert.equal(breathingVariation(g),2);assert(g.stamina<100);
for(let i=0;i<100&&!g.exhausted;i++)updateStamina(g,{sprint:true,forward:1},.05);
assert.equal(g.stamina,0);assert(g.exhausted);assert(!g.isSprinting);assert.equal(breathingVariation(g),3);
for(let i=0;i<20;i++){updateStamina(g,{sprint:true,forward:1},.05);assert(!g.isSprinting);assert.equal(breathingVariation(g),3);}
for(let i=0;i<15;i++)updateStamina(g,{},.05);assert(!g.exhausted);assert(g.stamina>=25);assert.equal(breathingVariation(g),1);updateStamina(g,{sprint:true,forward:1},.05);assert(g.isSprinting);assert.equal(breathingVariation(g),2);
g.state='paused';let before=g.stamina;updateStamina(g,{},10);assert.equal(g.stamina,before);
const played=[],stopped=[];const param=()=>({setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){}}),node=()=>({connect(){},disconnect(){}});
const ctx={currentTime:0,decodeAudioData:async b=>({id:new Uint8Array(b)[0]}),createGain:()=>({...node(),gain:param()}),createBufferSource(){return {...node(),start(){played.push(this.buffer.id);},stop(t){stopped.push({id:this.buffer.id,t});}};}};
let b=new BreathAudio(ctx,{},Promise.resolve([1,2,3].map(n=>new Uint8Array([n]).buffer)));await b.ready;
for(let state of [{},{isSprinting:true},{exhausted:true},{exhausted:true},{}])b.update(state);
assert.deepEqual(played,[1,2,3,1]);assert(b.current.source.loop);assert(stopped.every(s=>s.t===.36));b.stop();assert.equal(b.current,null);assert.equal(b.voices.size,0);
console.log('PASS: idle/sprint/exhausted audio mapping, depletion, recovery lockout, idle RUN does not drain, paused stamina, fade transitions, looping, and stop/reset.');
