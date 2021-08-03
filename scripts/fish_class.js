import * as THREE from 'three';

class Fish {
    constructor(scene) {
        this.init();
        scene.add(this.mesh);
    }

    t_last_turn = 0;
    turn_status = 0;

    init() {
        const geometry = new THREE.ConeGeometry(0.3, 1, 20);
        const material = new THREE.MeshLambertMaterial( { color: 0x0066ff } );
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.rotation.z = this.rand_range(0,2*Math.PI);
    }

    rand_range(min=0, max=0) {
        return Math.random()*(max-min) + min;
    }

    swim(speed=0.012) {
        if (this.turn_status === 0) this.t_last_turn++;
        if (this.turn_status !== 0 || this.t_last_turn > 100) this.turn();

        this.mesh.position.x += -speed * Math.sin(this.mesh.rotation.z);
        this.mesh.position.y += speed * Math.cos(this.mesh.rotation.z);
    }

    turn() {
        if (this.turn_status === 0) {
            this.turn_status = Math.floor(this.rand_range(-5,5));
            this.t_last_turn = 0;
        } else if (this.t_last_turn > 100) {
            this.turn_status = 0;
        } else {
            this.mesh.rotation.z += 0.0025 * this.turn_status;
        }
        this.t_last_turn++;
    }

    animate() {
        this.swim();
    }

}

export default Fish;