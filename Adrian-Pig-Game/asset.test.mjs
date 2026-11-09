import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self=globalThis;
const loader=new GLTFLoader();loader.register(()=>({name:'TEST_TEXTURE_SKIP',loadTexture:()=>Promise.resolve(null)}));
let buf=fs.readFileSync('dist/assets/pig.glb');const gltf=await loader.parseAsync(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'');
let box=new THREE.Box3().setFromObject(gltf.scene);assert(Number.isFinite(box.max.y));assert(box.max.y>box.min.y);let names=gltf.animations.map(a=>a.name);for(let n of ['Running','Walking','Zombie_Scream'])assert(names.includes(n));let mixer=new THREE.AnimationMixer(gltf.scene);for(let clip of gltf.animations){let a=mixer.clipAction(clip);a.play();mixer.update(.1);a.stop();}console.log(JSON.stringify({asset:'PASS',bounds:{min:box.min,max:box.max},animations:names,triangles:gltf.parser.json.accessors[gltf.parser.json.meshes[0].primitives[0].indices].count/3}));
