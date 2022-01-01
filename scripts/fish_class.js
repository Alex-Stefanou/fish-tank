import * as THREE from 'three';

class Fish {
    //Const fish properties
    _true_north = new THREE.Vector3(0,1,0); // Normalized world direction (upwards on the webpage)
    _boundary_influence_range = {surface: 1, depth: 1, edge: 4};
    _minimum_speed = 0.01;
    _maximum_speed = 0.08;
    _maximum_angular_speed = 0.08; // Max radians that can be turned in a frame
    _max_influence_strength = 12;
    _max_rules_strength = 4;
    _drag = { // Speeds at which drag becomes constant
        lower: {coefficient: 1, speed: 0.02},
        upper: {coefficient: 0.2, speed: 0.5},
    };

    _rules_coefficient = {
        alignment: 0.1,
        cohesion: 0.2,
        separation: 0.5,
    };
    _vision_range = 12;

    //Public and private variable properties
    id;
    _velocity = new THREE.Vector3();

    constructor(id, scene, boundary) {
        this.id = id;
        this._boundary = boundary;
        this._init();
        scene.add(this.mesh);
    }

    get direction() {
        return this._velocity.normalize();
    }
    set direction(new_direction) {
        const normalized_new_direction = new_direction.clone().normalize(); // Copied to not mutate original
        const new_direction_quaternion = new THREE.Quaternion().setFromUnitVectors(this._true_north, normalized_new_direction);
        this.mesh.setRotationFromQuaternion(new_direction_quaternion);
    }

    get position() {
        return this.mesh.position;
    }
    set position(new_position) {
        this.mesh.position.set(new_position.x, new_position.y, new_position.z);
    }

    set shoal(array_of_fish) {
        this._shoal = array_of_fish.filter(fish => fish.id !== this.id);
    }
    
    get velocity() {
        return this._velocity;
    }
    set velocity(new_velocity) {
        this.direction = new_velocity;
        this._velocity = new_velocity.clone().clampLength(this._minimum_speed, this._maximum_speed);
    }
    

    _init() {
        const color = [0xF1948A, 0xA569BD, 0xF7DC6F];
        const geometry = new THREE.ConeGeometry(0.6, 1.8, 32);
        const material = new THREE.MeshLambertMaterial({color: color[Math.floor(this.rand_range(0,2))]});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        const initial_position = new THREE.Vector3(0, 0, -2);
        // const initial_velocity = new THREE.Vector3(this.rand_range(-1,1), this.rand_range(-1,1), this.rand_range(-1,0));
        const initial_velocity = new THREE.Vector3(this.rand_range(-1,1), this.rand_range(-1,1), 0);
        // const initial_velocity = new THREE.Vector3(1, 1, 0);
        this.position = initial_position;
        this.velocity = initial_velocity;
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

    rand_range(min=0, max=0) {
        return Math.random()*(max-min+1) + min;
    }

    animate() {
        this.update_velocity();
        this.update_position();
    }

    influence = {
        /**
         * @returns Vector3: a sum of all influence vectors from source prop
         */
        compute: () => {
            let influences = [];
            for (const key in this.influence.source) {
                influences.push(this.influence.source[key]());
                // console.log(key, ": ", influences[influences.length-1].length());
            }

            let sum = new THREE.Vector3();
            influences.forEach(influence => {
                sum.add(influence);
            });
            // console.log(sum);
            return sum;
        },
        source: {
            alignment: () => {
                // Alignment: Steer towards the average heading of local boids
                const alignment_force = new THREE.Vector3();           
                const local_fish = this._shoal.filter(fish => fish.position.clone().sub(this.position.clone()).length() < this._vision_range);
                if (!local_fish.length) return alignment_force;

                local_fish.forEach(fish => {
                    const alignment = fish.direction.clone();
                    const separation = this.position.clone().sub(fish.position.clone());
                    if (separation.length() === 0) alignment_force.add(alignment);
                    else alignment_force.add(alignment.multiplyScalar(1 / separation.length()));
                });
                return alignment_force.multiplyScalar(this._rules_coefficient.alignment).clampLength(0, this._max_rules_strength);
            },
            cohesion: () => {
                // Cohesion: Steer toward center of mass of boids
                let center_of_mass = new THREE.Vector3();
                if (!this._shoal.length) return center_of_mass;

                this._shoal.forEach(fish => center_of_mass.add(fish.position));
                center_of_mass.multiplyScalar(1 / this._shoal.length);
                const cohesion_force = center_of_mass.sub(this.position) // Vector from this fish to center of mass of shoal
                return cohesion_force.multiplyScalar(this._rules_coefficient.cohesion).clampLength(0, this._max_rules_strength);
            },
            separation: () => {
                // Separation: Steer to avoid other boids
                const separation_force = new THREE.Vector3();           
                const local_fish = this._shoal.filter(fish => fish.position.clone().sub(this.position.clone()).length() < this._vision_range);
                if (!local_fish.length) return separation_force;

                local_fish.forEach(fish => {
                    const separation = this.position.clone().sub(fish.position.clone());
                    if (separation.lengthSq() > 0) separation_force.add(separation.multiplyScalar(2 / separation.lengthSq()));
                });
                return separation_force.multiplyScalar(this._rules_coefficient.separation).clampLength(0, this._max_rules_strength);
            },
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

    update_position() {
        const velocity_scale_factor = 1;
        const scaled_velocity = this.velocity.clone().multiplyScalar(velocity_scale_factor);
        this.position = this.position.add(scaled_velocity);
    }
    
    /**
     * @param {Vector3} influence The additional velocity from influences
     */
    update_velocity() {
        // Calculate velocity modifiers
        const damping_coefficient = () => {
            const current_speed = this.velocity.length();

            if (current_speed < this._drag.lower.speed) return this._drag.lower.coefficient;
            else if (current_speed > this._drag.upper.speed) return this._drag.upper.coefficient;
            else {
                const drag_coefficient_range = this._drag.lower.coefficient - this._drag.upper.coefficient;
                return this._drag.upper.coefficient + (drag_coefficient_range * (1 / (1 + Math.pow((current_speed - this._drag.lower.speed), 2))));
            }
        };

        const influence = this.influence.compute();

        // Apply velocity magnitude modifiers
        let target_velocity = this.velocity.clone();
        target_velocity.multiplyScalar(damping_coefficient());

        const influence_acceleration_coefficient = 1 + 1.6*Math.tanh(target_velocity.dot(influence)); // plot: https://www.wolframalpha.com/input/?i=y%3D1%2Btanh%28x%2F10%29
        target_velocity.multiplyScalar(influence_acceleration_coefficient);

        // Apply velocity direction modifier
        if (influence.lengthSq() !== 0) {
            const angular_speed = this._maximum_angular_speed * Math.tanh(influence.length()); // Scale angular speed to magnitude of influence

            const target_direction_quaternion = new THREE.Quaternion().setFromUnitVectors(this._true_north, influence.clone().normalize()); // Rotation from North to Traget direction
            let change_direction_quaternion = new THREE.Quaternion().setFromUnitVectors(this._true_north, target_velocity.clone().normalize()); // Rotation from Noth to current direction
            change_direction_quaternion.rotateTowards(target_direction_quaternion, angular_speed); // Rotate current direction rotation incrementally toward target direction

            const new_direction = this._true_north.clone().applyQuaternion(change_direction_quaternion).normalize(); // Apply calculated rotation to North to obtain new direction (unit vector)
            target_velocity = new_direction.multiplyScalar(target_velocity.length()); // Multiply by previous length to maintain speed
        }

        this.velocity = target_velocity;
    }
}

export default Fish;