export const MAP=[
'########################',
'#......#...............#',
'#......#...##....##....#',
'#......#...##....##....#',
'#..........##....##....#',
'#......#...............#',
'###.#######..#####..####',
'#........#.............#',
'#..##....#....###......#',
'#..##.........###......#',
'#........#.............#',
'####..#######..#####.###',
'#...........#..........#',
'#..###......#...###....#',
'#..###..........###....#',
'#...........#..........#',
'###..####.######..######',
'#.........#............#',
'#...##....#....##......#',
'#...##.........##......#',
'#.........#............#',
'#.........#............#',
'#......................#',
'########################'];
// A locked security room contains the final exit key.
for(let y=1;y<=5;y++){let row=[...MAP[y]];row[19]=y===5?'.':'#';MAP[y]=row.join('');}
{let row=[...MAP[6]];for(let x=19;x<24;x++)row[x]='#';MAP[6]=row.join('');}
export const EXIT={x:2.5,y:1.5};
export const KEYS=[{id:'maintenance',name:'Maintenance',x:4.5,y:4.5,color:0x78c9ef},{id:'exit',name:'Exit',x:21.5,y:3.5,color:0xeec974}];
export const BATTERIES=[{x:3.5,y:4.7},{x:9.5,y:4.5},{x:16.5,y:7.5},{x:6.5,y:14.5},{x:20.5,y:20.5},{x:21.5,y:5.2},{x:5.5,y:8.5}];
export const DOORS=[{id:'security',name:'Security',key:'maintenance',x:19.5,y:5.5,axis:'x'},{id:'loading',name:'Loading',key:'maintenance',x:3.5,y:6.5,axis:'y'},{id:'service',name:'Service',key:null,x:9.5,y:16.5,axis:'y'}];
export const wall=(x,y)=>MAP[Math.floor(y)]?.[Math.floor(x)]!=='.';
export const doorAt=(g,x,y)=>g?.doors.find(d=>!d.open&&!d.broken&&Math.floor(d.x)===Math.floor(x)&&Math.floor(d.y)===Math.floor(y));
export const blocked=(g,x,y)=>wall(x,y)||!!doorAt(g,x,y);
export function clearLine(x,y,tx,ty,g){let n=Math.ceil(Math.hypot(tx-x,ty-y)/.08);for(let i=1;i<n;i++)if(blocked(g,x+(tx-x)*i/n,y+(ty-y)*i/n))return false;return true;}
export function pathTo(x,y,tx,ty,g,breakDoors=false){let start=[Math.floor(x),Math.floor(y)],goal=[Math.floor(tx),Math.floor(ty)],q=[start],prev=new Map([[start.join(','),null]]);for(let i=0;i<q.length;i++){let [cx,cy]=q[i],k=`${cx},${cy}`;if(cx===goal[0]&&cy===goal[1]){let out=[];while(prev.get(k)){let [x,y]=k.split(',').map(Number);out.push({x:x+.5,y:y+.5});k=prev.get(k);}return out.reverse();}for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let nx=cx+dx,ny=cy+dy,nk=`${nx},${ny}`;if(!(breakDoors?wall(nx,ny):blocked(g,nx,ny))&&!prev.has(nk)){prev.set(nk,k);q.push([nx,ny]);}}}return [];}
export function move(b,dx,dy,r=.18,g){const free=(x,y)=>[[-1,-1],[1,-1],[-1,1],[1,1]].every(([a,c])=>!blocked(g,x+a*r,y+c*r));if(free(b.x+dx,b.y))b.x+=dx;if(free(b.x,b.y+dy))b.y+=dy;}
export function createGame(){return {player:{x:3.5,y:3.5,angle:Math.PI},monster:{x:20.5,y:18.5,mode:'patrol',memory:0,path:[],repath:0,target:null,patrol:0},keys:KEYS.map(k=>({...k,found:false})),batteries:BATTERIES.map(b=>({...b,found:false})),doors:DOORS.map(d=>({...d,open:false,broken:false,damage:0})),inventory:[],battery:100,lowWarned:false,stamina:100,exhausted:false,isSprinting:false,flashlight:true,elapsed:0,state:'playing',alarm:0,message:'Find the blue Maintenance key nearby. Keep your flashlight charged.',messageTime:7};}
const PATROL=[{x:20.5,y:18.5},{x:17.5,y:8.5},{x:4.5,y:12.5},{x:14.5,y:21.5}];
export function objective(g){return g.inventory.includes('exit')?'RETURN TO THE GREEN EXIT':g.inventory.includes('maintenance')?'FIND THE EXIT KEY · SECURITY ROOM':'FIND THE BLUE MAINTENANCE KEY';}
function message(g,text){g.message=text;g.messageTime=4;}
export function nearby(g){let p=g.player,items=[];for(let k of g.keys)if(!k.found)items.push({type:'key',item:k});for(let b of g.batteries)if(!b.found)items.push({type:'battery',item:b});for(let v of items){v.distance=Math.hypot(p.x-v.item.x,p.y-v.item.y);}items=items.filter(v=>v.distance<.95&&clearLine(p.x,p.y,v.item.x,v.item.y,g)).sort((a,b)=>a.distance-b.distance);if(items.length)return items[0];if(Math.hypot(p.x-EXIT.x,p.y-EXIT.y)<1.1)return {type:'exit',item:EXIT};for(let d of g.doors){let dist=Math.hypot(p.x-d.x,p.y-d.y);if(dist<1.35){let nearX=d.x+(p.x-d.x)*.6,nearY=d.y+(p.y-d.y)*.6;if(clearLine(p.x,p.y,nearX,nearY,g)||dist<.85)return {type:'door',item:d};}}return null;}
export function prompt(g){let n=nearby(g);if(!n)return '';let d=n.item;if(n.type==='key')return `TAKE ${d.name.toUpperCase()} KEY`;if(n.type==='battery')return g.battery>90?'BATTERY · SAVE FOR LATER':'PICK UP BATTERY';if(n.type==='exit')return g.inventory.includes('exit')?'UNLOCK EXIT · ESCAPE':'EXIT KEY REQUIRED';return d.broken?'DOOR BROKEN':d.open?'CLOSE DOOR':d.key&&!g.inventory.includes(d.key)?'MAINTENANCE KEY REQUIRED':`OPEN ${d.name.toUpperCase()} DOOR`;}
export function interact(g){if(g.state!=='playing')return;let n=nearby(g);if(!n)return;let item=n.item;if(n.type==='key'){item.found=true;g.inventory.push(item.id);message(g,item.id==='exit'?'Exit key found. Get back to the green exit!':'Maintenance key found. Unlock the blue Security door in the northeast.');return 'key';}if(n.type==='battery'){if(g.battery>90){message(g,'Battery is nearly full. Leave this one for later.');return;}item.found=true;g.battery=Math.min(100,g.battery+65);g.lowWarned=false;g.flashlight=true;message(g,'Fresh battery installed. +65% charge.');return 'battery';}if(n.type==='exit'){if(g.inventory.includes('exit')){g.state='won';return 'won';}message(g,'Locked. Find the Exit key inside the Security room.');return 'locked';}if(item.broken){message(g,'The pig broke this door. It cannot be closed.');return;}if(!item.open&&item.key&&!g.inventory.includes(item.key)){message(g,'You need the blue Maintenance key.');return 'locked';}if(item.open&&[g.player,g.monster].some(b=>Math.abs(b.x-item.x)<.75&&Math.abs(b.y-item.y)<.75)){message(g,'Step clear of the doorway before closing it.');return;}item.open=!item.open;g.monster.repath=0;message(g,item.open?'Door unlocked. You can close it behind you.':'Door closed. It will only hold the pig briefly.');return 'door';}
export function toggleLight(g){if(g.battery<=0){message(g,'Flashlight empty. Find a glowing battery on the floor.');return false;}g.flashlight=!g.flashlight;return true;}
export function updateStamina(g,input,dt){
 if(g.state!=='playing')return;
 const moving=Math.hypot(input.forward||0,input.strafe||0)>.1;
 if(g.exhausted&&g.stamina>=25)g.exhausted=false;
 g.isSprinting=!!input.sprint&&moving&&!g.exhausted&&g.stamina>0;
 g.stamina=Math.max(0,Math.min(100,g.stamina+(g.isSprinting?-23:15)*dt));
 if(g.stamina<=0){g.exhausted=true;g.isSprinting=false;}
 if(g.exhausted&&g.stamina>=25)g.exhausted=false;
}
export function update(g,input,dt){if(g.state!=='playing')return;dt=Math.min(dt,.05);g.elapsed+=dt;g.messageTime=Math.max(0,g.messageTime-dt);if(g.flashlight){g.battery=Math.max(0,g.battery-dt*100/150);if(g.battery<=20&&!g.lowWarned){g.lowWarned=true;message(g,'Battery low. Find a battery or switch off your light to conserve power.');}if(g.battery===0){g.flashlight=false;message(g,'Flashlight dead. Look for the faint green battery glints.');}}
let p=g.player,m=g.monster;updateStamina(g,input,dt);const motion=Math.hypot(input.forward||0,input.strafe||0),sprint=g.isSprinting;if(motion){let s=(sprint?2.4:1.35)*dt/Math.max(1,motion),f=input.forward||0,a=input.strafe||0;move(p,(-Math.sin(p.angle)*f+Math.cos(p.angle)*a)*s,(-Math.cos(p.angle)*f-Math.sin(p.angle)*a)*s,.18,g);}let d=Math.hypot(p.x-m.x,p.y-m.y),los=clearLine(m.x,m.y,p.x,p.y,g);if(g.elapsed>5&&((los&&d<(g.flashlight?8:2.6))||(sprint&&d<5))){m.mode='chase';m.memory=7;m.target={x:p.x,y:p.y};}else if(m.memory>0){m.memory-=dt;m.mode='search';}else{m.mode='patrol';if(!m.target||Math.hypot(m.x-m.target.x,m.y-m.target.y)<.4){m.patrol=(m.patrol+1)%PATROL.length;m.target=PATROL[m.patrol];}}m.repath-=dt;if(m.repath<=0&&m.target){m.path=pathTo(m.x,m.y,m.target.x,m.target.y,g,true);m.repath=.4;}m.bashing=false;let next=m.path[0];if(next){let nd=Math.hypot(next.x-m.x,next.y-m.y),door=doorAt(g,next.x,next.y);if(door&&nd<1.25){m.bashing=true;door.damage+=dt;if(door.damage>=3){door.open=true;door.broken=true;m.repath=0;message(g,'A door has been smashed open. Keep moving.');}}else{let speed=(m.mode==='chase'?1.8:m.mode==='search'?1.2:.75)*dt;if(nd<.07)m.path.shift();else move(m,(next.x-m.x)/nd*Math.min(nd,speed),(next.y-m.y)/nd*Math.min(nd,speed),.17,g);}}g.alarm=Math.max(0,Math.min(1,(6-d)/5))*(m.mode==='patrol'?.3:1);if(d<.54&&los){g.state='caught';return 'caught';}}
