import * as THREE from 'three';

const canvas_y = window.innerHeight;
const canvas_x = window.innerWidth;

const FOV = 90;
const z_camera = 12;
const z_floor = -2;

const aspect_ratio = canvas_x / canvas_y;
const texture_sand = new THREE.TextureLoader().load('./assets/textures/underwater-sand.jpg');
const texture_sand_aspect_ratio = 2567/1707;

const toRads = (degrees) => degrees*Math.PI/180;

const initialise_scene = (scene) => {
    /* Set Scene */
    scene.background = new THREE.Color(0xffffff);

    /* Add Camera */
    const camera = new THREE.PerspectiveCamera(FOV, aspect_ratio, 0.1, 1000);
    camera.position.z = z_camera;

    /* Add background plane */
    let surface_y = 2 * (z_camera + Math.abs(z_floor)) * Math.tan(toRads(FOV)/2);
    let surface_x = surface_y * aspect_ratio;
    
    // Ensure background texture isn't streched and optimally fits frame
    if (aspect_ratio < texture_sand_aspect_ratio) {
        surface_x = surface_y * texture_sand_aspect_ratio;
    } else {
        surface_y = surface_x / texture_sand_aspect_ratio;
    }
    
    let geometry = new THREE.PlaneGeometry(surface_x, surface_y);
    let material = new THREE.MeshLambertMaterial({map: texture_sand});
    let background = new THREE.Mesh(geometry, material);
    background.receiveShadow = true;
    background.position.set(0, 0, z_floor);
    scene.add(background);

    /* Calculate boundary positions (frame edges at z=0) */
    let boundary = {};
    boundary.top    = z_camera * Math.tan(toRads(FOV)/2);
    boundary.bottom = -boundary.top;
    boundary.right  = boundary.top * aspect_ratio;
    boundary.left   = -boundary.right;
    boundary.surface= 0;
    boundary.depth  = z_floor;
    // console.log(boundary);
    
    /* Add Lighting */
    const directionalLightA = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLightA.position.set(-4, -4, z_camera/4);
    directionalLightA.castShadow = true;
    directionalLightA.shadow.camera = new THREE.OrthographicCamera(boundary.left, boundary.right, boundary.top, boundary.bottom);
    scene.add(directionalLightA);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    return {boundary, camera};
}

export default initialise_scene;