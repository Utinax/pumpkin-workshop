import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { soundManager } from '../audio/SoundManager.js';

/**
 * 3D Halloween Candy Rain & Treat Physics
 */
export class CandyRain {
  constructor(scene) {
    this.scene = scene;
    this.candies = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  triggerTreatShower() {
    soundManager.playCandyPop();

    // Trigger canvas confetti in vibrant Halloween colors
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ea580c', '#f59e0b', '#8b5cf6', '#22c55e', '#ffffff']
    });

    // Spawn 24 3D Falling Candies
    const candyGeometries = [
      new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12), // wrapped candy
      new THREE.ConeGeometry(0.09, 0.22, 10),            // candy corn
      new THREE.SphereGeometry(0.1, 12, 12)             // lollipop ball
    ];

    const candyColors = [0xf97316, 0xfacc15, 0xa855f7, 0x22c55e, 0xef4444, 0x38bdf8];

    for (let i = 0; i < 24; i++) {
      const geo = candyGeometries[Math.floor(Math.random() * candyGeometries.length)];
      const col = candyColors[Math.floor(Math.random() * candyColors.length)];
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.3,
        metalness: 0.1
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 3.5,
        4.0 + Math.random() * 2.5,
        (Math.random() - 0.5) * 3.5
      );

      const vx = (Math.random() - 0.5) * 1.5;
      const vy = -1.0 - Math.random() * 2.0;
      const vz = (Math.random() - 0.5) * 1.5;

      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );

      this.candies.push({
        mesh,
        vel: new THREE.Vector3(vx, vy, vz),
        rotSpeed,
        life: 4.5
      });

      this.group.add(mesh);
    }
  }

  update(delta) {
    for (let i = this.candies.length - 1; i >= 0; i--) {
      const c = this.candies[i];
      c.life -= delta;

      // Gravity
      c.vel.y -= 9.8 * delta;

      c.mesh.position.addScaledVector(c.vel, delta);
      c.mesh.rotation.x += c.rotSpeed.x * delta;
      c.mesh.rotation.y += c.rotSpeed.y * delta;
      c.mesh.rotation.z += c.rotSpeed.z * delta;

      // Bounce on table surface (y ~ -1.1)
      if (c.mesh.position.y < -1.05 && c.vel.y < 0) {
        c.vel.y = -c.vel.y * 0.45; // bounce elasticity
        c.vel.x *= 0.7;
        c.vel.z *= 0.7;
        c.rotSpeed.multiplyScalar(0.7);
      }

      if (c.life <= 0 || c.mesh.position.y < -3.0) {
        this.group.remove(c.mesh);
        this.candies.splice(i, 1);
      }
    }
  }
}
