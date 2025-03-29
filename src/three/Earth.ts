import * as THREE from "three";
import { Feet } from "../support";
import { calculateVisibleLineOfSight } from "../support/math";

class Earth {
  static create(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry( 15, 16, 8 ); 
    let material = new THREE.MeshLambertMaterial({ color: 'red' });
    let mesh = new THREE.Mesh(geometry, material);

    // make it transparent and show the wireframe
    material.transparent = true;
    material.opacity = 0.5;
    material.wireframe = true;

    return mesh;
  }

  static createGround(altitude: Feet): THREE.Mesh {
    // we need to calculate the visible line of sight from the given altitude
    let visibleLineOfSight = calculateVisibleLineOfSight(altitude);
    const geometry = new THREE.PlaneGeometry(visibleLineOfSight.feet, visibleLineOfSight.feet);
    const material = new THREE.MeshLambertMaterial({ color: 'sandybrown', side: THREE.DoubleSide });
    let mesh = new THREE.Mesh(geometry, material);

    // rotate the mesh 90 degrees
    mesh.rotateX(Math.PI / 2);

    // set the position to the origin
    mesh.position.set(0, 0, 0);

    return mesh;
  }

  static createAmbientLight(): THREE.AmbientLight {
    return new THREE.AmbientLight(0xffffff, 1);
  }

  static createDirectionalLight(): THREE.DirectionalLight {
    return new THREE.DirectionalLight(0xffffff, 1);
  }
}

export default Earth;
