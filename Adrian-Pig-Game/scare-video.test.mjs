import assert from 'node:assert/strict';
import {ScareVideo} from './dist/scare-video.mjs';
let timers=new Map(),id=0;const video={hidden:true,pause(){},play(){return Promise.resolve();}};
let c=new ScareVideo(video,{schedule:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},cancel:id=>timers.delete(id)});let events=[];const callbacks={onStart:()=>events.push('sound4'),onEnd:()=>events.push('retry'),onFallback:()=>events.push('3d')};
c.play(callbacks);assert(c.active);assert(!video.hidden);assert(video.muted&&video.playsInline);assert.equal(video.currentTime,0);video.onplaying();video.onplaying();assert.deepEqual(events,['sound4']);video.onended();assert.deepEqual(events,['sound4','retry']);assert(video.hidden);assert(!c.active);assert.equal(timers.size,0);
// Restart invalidates old callbacks and a late rejected play promise.
let reject;video.play=()=>new Promise((_,r)=>reject=r);c.play(callbacks);let stale=video.onended;c.stop();reject(Error('blocked'));await Promise.resolve();stale();assert.deepEqual(events,['sound4','retry']);
video.play=()=>Promise.reject(Error('blocked'));c.play(callbacks);await Promise.resolve();assert.equal(events.at(-1),'3d');assert(video.hidden);
video.play=()=>Promise.resolve();c.play(callbacks);let startup=[...timers.values()][0];assert.equal(startup.ms,6000);startup.fn();assert(!c.active);assert.equal(events.at(-1),'3d');
c.play(callbacks);video.onplaying();let stalled=[...timers.values()][0];assert.equal(stalled.ms,12000);stalled.fn();assert.equal(events.at(-1),'retry');assert(!c.active);
console.log('PASS: capture video, synchronized one-shot sound, retry on end, clean restart, rejected playback fallback, startup/stall watchdogs.');
// Browser timers require the Window/global receiver. Reproduce the exact Start failure.
const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout;
let scheduled=0,cleared=0;
try{
 globalThis.setTimeout=function(fn,ms){if(this!==globalThis)throw new TypeError('Illegal invocation');scheduled++;return 42;};
 globalThis.clearTimeout=function(id){if(this!==globalThis)throw new TypeError('Illegal invocation');cleared++;};
 const nativeTimers=new ScareVideo({pause(){},play(){return Promise.resolve();}});
 nativeTimers.stop();nativeTimers.play(callbacks);nativeTimers.video.onplaying();nativeTimers.stop();
 assert.equal(scheduled,2);assert(cleared>=3);
 console.log('PASS: default browser timer receiver on Start reset, video startup, playback and stop.');
}finally{globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear;}
