import assert from 'node:assert/strict';
import {PigAudio} from './dist/pig-audio.mjs';
const played=[];const param=()=>({value:0,setTargetAtTime(v){this.value=v;}});const node=()=>({connect(){},disconnect(){}});
const ctx={currentTime:0,decodeAudioData:async b=>({duration:8,id:new Uint8Array(b)[0]}),createGain:()=>({...node(),gain:param()}),createStereoPanner:()=>({...node(),pan:param()}),createBufferSource(){return {...node(),start(){played.push(this.buffer.id);},stop(){this.stopped=true;this.onended?.();}};}};
const files=Promise.resolve([1,2,3,4].map(n=>new Uint8Array([n]).buffer));let a=new PigAudio(ctx,{},files);await a.ready;
a.update({chasing:false,distance:12});assert.equal(played.length,0);
for(let n=1;n<=3;n++){a.update({chasing:true,distance:2,pan:.5});assert.equal(played.at(-1),n);a.update({chasing:true,distance:1});assert.equal(played.length,n,'no overlapping playback');a.voice.source.onended();ctx.currentTime+=15;}
a.update({chasing:false,distance:2});assert.equal(played.at(-1),1);let nearby=a.voice;await a.caught(true);assert(nearby.source.stopped);assert.equal(played.at(-1),4);assert.equal(a.voice.gain.gain.value,.2);a.update({chasing:true,distance:1});assert.equal(played.at(-1),4);a.stop();assert.equal(a.voice,null);
// An in-flight decode must not trigger a scare after restart/pause.
let release;const pending=new Promise(r=>release=r);let b=new PigAudio(ctx,{},pending);const p=b.caught();b.stop();release([1,2,3,4].map(n=>new Uint8Array([n]).buffer));await p;assert.equal(b.voice,null);
console.log('PASS: nearby threshold, rotation 1–3, no overlap, capture exclusively 4, interruption, quieter scare and cancelled late playback.');
