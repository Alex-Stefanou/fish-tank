import * as THREE from 'three';

const canvas_y = window.innerHeight;
const canvas_x = window.innerWidth;

const FOV = 90;
const z_camera = 12;
const z_floor = -2;

const aspect_ratio = canvas_x / canvas_y;
const texture_tile = new THREE.TextureLoader().load('./assets/textures/tiles.jpg');
const texture_sand = new THREE.TextureLoader().load('./assets/textures/underwater-sand.jpg');
const texture_sand_aspect_ratio = 2567/1707;

const toRads = (degrees) => degrees*Math.PI/180;

const initialise_scene = (scene) => {
    /* Create Scene */
    scene.background = new THREE.Color( 0xffffff );

    /* Add Camera */
    const camera = new THREE.PerspectiveCamera( FOV, aspect_ratio, 0.1, 1000 );
    camera.position.z = z_camera;

    /* Add Lighting */
    const directionalLightA = new THREE.DirectionalLight( 0xffffff, 1.2 );
    directionalLightA.position.set( -4, -4, z_camera/4 );
    directionalLightA.castShadow = true;
    scene.add( directionalLightA );

    const directionalLightB = new THREE.DirectionalLight( 0xffffff, 0.8 );
    directionalLightB.position.set( 4, 4, z_camera/4 );
    scene.add( directionalLightB );

    /* Add bounderies planes */
    const surface_y = 2 * z_camera * Math.tan(toRads(FOV)/2);
    const surface_x = surface_y * aspect_ratio;

    let floor_x, floor_y;
    if (aspect_ratio < texture_sand_aspect_ratio) {
        floor_y = surface_y;
        floor_x = floor_y * texture_sand_aspect_ratio;
    } else {
        floor_x = surface_x;
        floor_y = floor_x / texture_sand_aspect_ratio;
    }

    let geometry = new THREE.PlaneGeometry( floor_x, floor_y );
    let material = new THREE.MeshLambertMaterial( {map: texture_sand} );
    let floor = new THREE.Mesh( geometry, material );
    floor.position.set(0, 0, z_floor);
    scene.add( floor );

    texture_tile.wrapS = THREE.RepeatWrapping;
    const tiles_per_unit = 1 / z_floor;

    texture_tile.repeat.set(surface_y*tiles_per_unit*0.8,1);
    material = new THREE.MeshLambertMaterial( {map: texture_tile} );
    geometry = new THREE.PlaneGeometry( surface_y, Math.abs(z_floor) );
    let wall_left = new THREE.Mesh( geometry, material );
    wall_left.position.set(-surface_x/2, 0, z_floor/2);
    wall_left.rotation.set(0, toRads(90), toRads(90));
    scene.add( wall_left );

    let wall_right = new THREE.Mesh( geometry, material );
    wall_right.position.set(surface_x/2, 0, z_floor/2);
    wall_right.rotation.set(0, toRads(-90), toRads(90));
    scene.add( wall_right );

    geometry = new THREE.PlaneGeometry( surface_x, Math.abs(z_floor) );
    let wall_bottom = new THREE.Mesh( geometry, material );
    wall_bottom.position.set(0, -surface_y/2, z_floor/2);
    wall_bottom.rotation.set(toRads(-90), toRads(0), toRads(0));
    scene.add( wall_bottom );

    let wall_top = new THREE.Mesh( geometry, material );
    wall_top.position.set(0, surface_y/2, z_floor/2);
    wall_top.rotation.set(toRads(90), toRads(0), toRads(0));
    scene.add( wall_top );

    return {camera};
}

export default initialise_scene;