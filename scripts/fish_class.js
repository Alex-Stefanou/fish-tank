import * as THREE from 'three';

class Fish {
    _angular_speed = 0.03; //radians that can be taken in a step
    _boundary_influence_range = {surface: 0.1, depth: 1, edge: 5};
    _front; // The local direction - Vector3 pointing out the front of the fish on frame 0
    _linear_speed = 0.03;
    _max_influence_strength = 100;
    // _max_force_magnitude = Math.sqrt(3 * (this._max_influence_strength**2));
    _true_north = new THREE.Vector3(0,1,0); // The world direction (upwards on the webpage)

    constructor(id, scene, boundary) {
        this.id = id;
        this._boundary = boundary;
        this._init();
        scene.add(this.mesh);
    }

    /**
     * @returns Vector3 of the direction the mesh is currently facing.
     */
    get direction() {
        return new THREE.Vector3().copy(this._true_north).applyQuaternion(this.mesh.quaternion);
    }
    
    /**
     * @returns Vector3 of mesh position in world.
     */
    get position() {
        return this.mesh.position;
    }

    set shoal(array_of_fish) {
        this._shoal = array_of_fish.filter(fish => fish.id !== this.id);
    }

    _init() {
        const color = [0xF1948A, 0xA569BD, 0xF7DC6F];
        const geometry = new THREE.ConeGeometry(0.6, 1.8, 32);
        const material = new THREE.MeshLambertMaterial({color: color[Math.floor(this.rand_range(0,2))]});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this._front = new THREE.Vector3(this.rand_range(-1,1), this.rand_range(-1,1), this.rand_range(-1,1)).normalize();
        const front_quaterntion = new THREE.Quaternion().setFromUnitVectors(this._true_north, this._front);
        this.mesh.setRotationFromQuaternion(front_quaterntion);
    }

    _boundary_force = {
        surface: (separation) => {
            if (separation > this._boundary_influence_range.surface) {
                return 0;
            } else if (separation <= 0) {
                return this._max_influence_strength;
            } else {
                const normalized_separation = separation / this._boundary_influence_range.surface;
                const F = Math.pow(normalized_separation, -0.5) - 1;
                return F > this._max_influence_strength ? this._max_influence_strength : F;
            }
        },
        depth: (separation) => {
            if (separation > this._boundary_influence_range.depth) {
                return 0;
            } else if (separation <= 0) {
                return this._max_influence_strength;
            } else {
                const normalized_separation = separation / this._boundary_influence_range.depth;
                const F = Math.pow(normalized_separation, -0.5) - 1;
                return F > this._max_influence_strength ? this._max_influence_strength : F;
            }
        },
        edge: (separation) => {
            if (separation > this._boundary_influence_range.edge) {
                return 0;
            } else if (separation <= 0) {
                return this._max_influence_strength;
            } else {
                const normalized_separation = separation / this._boundary_influence_range.edge;
                const F = Math.pow(normalized_separation, -0.5) - 1;
                return F > this._max_influence_strength ? this._max_influence_strength : F;
            }
        }
    }

    magnitude(Vector3) {
        return Math.sqrt(Vector3.x ** 2 + Vector3.y ** 2 + Vector3.z ** 2);
    }

    rand_range(min=0, max=0) {
        return Math.random()*(max-min+1) + min;
    }

    animate() {
        this.swim();
    }

    influence = {
        /**
         * @returns Vector3: a sum of all influence vectors
         */
        compute: () => {
            let influences = [];
            for (const key in this.influence.source) {
                influences.push(this.influence.source[key]());
            }
            // console.log(influences);

            let sum = new THREE.Vector3();
            influences.forEach(influence => {
                sum.add(influence);
            });
            return sum.normalize();
        },
        source: {
            // Alignment: () => {
            //     // Alignment: Steer towards the average heading of local boids
            // },
            // Cohesion: () => {
            //     // Cohesion: Steer toward center of mass of local boids
            // },
            // Separation: () => {
            //     // Separation: Stear to avoid local boids
            // },
            boundary_surface: () => {
                const separation = this._boundary.surface - this.mesh.position.z;
                const force = this._boundary_force.surface(separation);
                return new THREE.Vector3(0,0,-1).multiplyScalar(force);
            },
            boundary_depth: () => {
                const separation = this.mesh.position.z - this._boundary.depth;
                const force = this._boundary_force.depth(separation);
                return new THREE.Vector3(0,0,1).multiplyScalar(force);
            },
            boundary_top: () => {
                const separation = this._boundary.top - this.mesh.position.y;
                const force = this._boundary_force.edge(separation);
                return new THREE.Vector3(0,-1,0).multiplyScalar(force);
            },
            boundary_bottom: () => {
                const separation = this.mesh.position.y - this._boundary.bottom;
                const force = this._boundary_force.edge(separation);
                return new THREE.Vector3(0,1,0).multiplyScalar(force);
            },
            boundary_right: () => {
                const separation = this._boundary.right - this.mesh.position.x;
                const force = this._boundary_force.edge(separation);
                return new THREE.Vector3(-1,0,0).multiplyScalar(force);
            },
            boundary_left: () => {
                const separation = this.mesh.position.x - this._boundary.left;
                const force = this._boundary_force.edge(separation);
                return new THREE.Vector3(1,0,0).multiplyScalar(force);
            }
        }
    }

    propel() {
        let current_dir = new THREE.Vector3().copy(this._true_north).applyQuaternion(this.mesh.quaternion);

        let new_position = new THREE.Vector3().copy(this.mesh.position).add(current_dir.multiplyScalar(this._linear_speed));
        this.mesh.position.set(new_position.x, new_position.y, new_position.z);
    }

    swim() {
        const target_direction = this.influence.compute(); // as Vector3
        if (this.magnitude(target_direction) > 0) this.turn(target_direction);
        this.propel();
    }

    turn(target_dir) {
        // const force_magnitude = this.magnitude(target_dir);
        // target_dir.normalize();
        const quaternion_target = new THREE.Quaternion().setFromUnitVectors(this._true_north, target_dir);

        let current_direction_quaternion = this.mesh.quaternion;
        current_direction_quaternion.rotateTowards(quaternion_target, this._angular_speed);
        this.mesh.setRotationFromQuaternion(current_direction_quaternion);
    }
}

export default Fish;