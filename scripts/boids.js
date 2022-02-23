import * as THREE from 'three';
import initialise_scene from './init_scene.js';
import Fish from './fish_class.js';

/* Initialise THREE and bind to HTML element */
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();

let stop = false;

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* Begin Render */
const render = async (num_fish) => {
    stop = false;

    const {boundary, camera} = initialise_scene(scene);

    const fish = [];

    for(let i=0; i<num_fish; i++) {
        fish.push(new Fish(i, scene, boundary));
    }

    await sleep(1000);

    fish.forEach(f => f.shoal = fish);

    /* animate subject */
    const animate = function () {
        if (stop) return;

        requestAnimationFrame(animate);
    
        fish.forEach(f => f.animate());
        renderer.render(scene, camera);
    };

    animate();
}

const reset = () => {
    stop = true;
    scene.remove.apply(scene, scene.children);
}

export default {render, reset};