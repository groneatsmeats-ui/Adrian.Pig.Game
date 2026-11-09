import assert from 'node:assert/strict';
import {MAP,EXIT,KEYS,BATTERIES,DOORS,createGame,pathTo,wall,move,interact,update,clearLine,blocked,toggleLight,nearby} from './dist/core.mjs';
const tick=(g,seconds,input={})=>{for(let i=0;i<Math.ceil(seconds/.05);i++)update(g,input,.05);};
assert(MAP.every(r=>r.length===24));let g=createGame();for(let p of [...KEYS,...BATTERIES,...DOORS,EXIT,g.monster])assert(!wall(p.x,p.y),JSON.stringify(p));
assert(pathTo(g.player.x,g.player.y,KEYS[0].x,KEYS[0].y,g).length);
assert.equal(pathTo(g.player.x,g.player.y,KEYS[1].x,KEYS[1].y,g).length,0,'Security room must be locked');
Object.assign(g.player,EXIT);assert.equal(interact(g),'locked');assert.equal(g.state,'playing');
Object.assign(g.player,{x:18.5,y:5.5});assert.equal(nearby(g)?.type,'door');assert.equal(interact(g),'locked');assert(!g.doors[0].open);
Object.assign(g.player,KEYS[0]);assert.equal(interact(g),'key');assert.equal(g.inventory.length,1);interact(g);assert.equal(g.inventory.length,1);
Object.assign(g.player,{x:18.5,y:5.5});assert.equal(interact(g),'door');assert(g.doors[0].open);assert(pathTo(g.player.x,g.player.y,KEYS[1].x,KEYS[1].y,g).length);
Object.assign(g.player,KEYS[1]);assert.equal(interact(g),'key');assert(pathTo(g.player.x,g.player.y,EXIT.x,EXIT.y,g).length);Object.assign(g.player,EXIT);assert.equal(interact(g),'won');
// Floor pickups cannot be taken through a locked door.
let hidden=createGame();hidden.keys[1].x=19.8;hidden.keys[1].y=5.5;hidden.player={x:19.1,y:5.5};assert.notEqual(interact(hidden),'key');
let c=createGame();c.inventory.push('maintenance');c.player={x:3.5,y:5.7};assert(blocked(c,3.5,6.5));assert(!clearLine(3.5,5.5,3.5,7.5,c));let body={x:3.5,y:5.5};for(let i=0;i<50;i++)move(body,0,.04,.18,c);assert(body.y<6);assert.equal(interact(c),'door');assert(clearLine(3.5,5.5,3.5,7.5,c));for(let i=0;i<50;i++)move(body,0,.04,.18,c);assert(body.y>7);assert.equal(interact(c),'door');assert(!c.doors[1].open);
// Do not close a door on either actor.
c.doors[1].open=true;c.player={x:3.5,y:6.5};interact(c);assert(c.doors[1].open);
// Pig spends time breaking a door; it cannot walk through the closed door.
let hunt=createGame();hunt.player={x:3.5,y:5.5};Object.assign(hunt.monster,{x:3.5,y:7.5,memory:100,target:{...hunt.player},mode:'search'});tick(hunt,1);assert(!hunt.doors[1].open);assert(hunt.monster.y>6.5);tick(hunt,3.5);assert(hunt.doors[1].broken);tick(hunt,3);assert.equal(hunt.state,'caught');
// Battery drain, conservation, depletion, recharge, and single collection.
let b=createGame();b.monster.x=-99;b.monster.y=-99;tick(b,30);assert(Math.abs(b.battery-80)<.1);toggleLight(b);tick(b,30);assert(Math.abs(b.battery-80)<.1);toggleLight(b);b.battery=.01;tick(b,.05);assert.equal(b.battery,0);assert.equal(b.flashlight,false);toggleLight(b);assert.equal(b.flashlight,false);Object.assign(b.player,BATTERIES[0]);assert.equal(interact(b),'battery');assert.equal(b.battery,65);assert(b.flashlight);interact(b);assert.equal(b.battery,65);Object.assign(b.player,BATTERIES[1]);b.battery=96;interact(b);assert(!b.batteries[1].found);
let paused=createGame();paused.state='paused';tick(paused,10);assert.equal(paused.battery,100);
let fresh=createGame();assert.equal(fresh.inventory.length,0);assert(fresh.doors.every(d=>!d.open&&!d.broken));assert(fresh.batteries.every(b=>!b.found));
console.log('PASS: key progression, reachable supplies, locked exit, door collision/visibility, safe closing, timed pig breach/capture, battery drain/off/depletion/recharge, no duplicate pickups, pause and restart.');
