import * as THREE from 'three';
import Fish from './fish_class.js';

/* Initialise and bind THREE */
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/* Create Scene */
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

/* Add Camera and Lighting */
const camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 12;

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
directionalLight.position.set( -2, -2, 12 );
directionalLight.castShadow = true;
scene.add( directionalLight );

/* Add background plane */
let geometry = new THREE.PlaneGeometry( 100, 100 );
let material = new THREE.MeshLambertMaterial( {color: 0xD6EAF8 } );
let plane = new THREE.Mesh( geometry, material );
plane.receiveShadow = true;
plane.position.set(0, 0, -5);
scene.add( plane );

/* Add subject */
const fish = []
for(let i=0; i<60; i++) {
    fish.push(new Fish(scene));
}

/* animate subject */
const rand_range = (min=0, max=0) => Math.random()*(max-min) + min;
const animate = function () {
    requestAnimationFrame( animate );

    fish.forEach(f => f.animate());

    renderer.render( scene, camera );
};

export default {animate};