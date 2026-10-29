import * as THREE from 'three';

/**
 * 3D Floating Ghost Specter
 */
export class GhostSpecter {
  constructor(scene, count = 3) {
    this.scene = scene;
    this.count = count;
    this.ghosts = [];
    this.group = new THREE.Group();

    this.initGhosts();
    this.group.visible = false; // triggered via potion or trick
    this.scene.add(this.group);
  }

  initGhosts() {
    for (let i = 0; i < this.count; i++) {
      const ghost = new THREE.Group();

      // Translucent ghostly cloth body
      const bodyGeo = new THREE.CylinderGeometry(0.28, 0.45, 1.1, 16, 8, true);
      // Hemispherical head top
      const headGeo = new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      headGeo.translate(0, 0.55, 0);

      const ghostMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide
      });

      const body = new THREE.Mesh(bodyGeo, ghostMat);
      const head = new THREE.Mesh(headGeo, ghostMat);
      ghost.add(body, head);

      // Hollow dark eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
      leftEye.position.set(-0.1, 0.6, 0.24);
      leftEye.scale.set(1, 1.4, 0.5);

      const rightEye = leftEye.clone();
      rightEye.position.x = 0.1;

      // O mouth
      const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
      mouth.position.set(0, 0.48, 0.25);
      mouth.scale.set(0.8, 1.6, 0.5);

      ghost.add(leftEye, rightEye, mouth);

      const angle = (i / this.count) * Math.PI * 2;
      const radius = 2.4 + Math.random() * 1.5;
      const baseHeight = 1.0 + Math.random() * 0.8;

      ghost.position.set(
        Math.cos(angle) * radius,
        baseHeight,
        Math.sin(angle) * radius
      );

      this.ghosts.push({
        group: ghost,
        angle,
        radius,
        baseHeight,
        speed: 0.4 + Math.random() * 0.3,
        bobPhase: Math.random() * Math.PI * 2
      });

      this.group.add(ghost);
    }
  }

  update(time, delta) {
    if (!this.group.visible) return;

    this.ghosts.forEach(g => {
      g.angle += g.speed * delta;
      
      const x = Math.cos(g.angle) * g.radius;
      const z = Math.sin(g.angle) * g.radius;
      const y = g.baseHeight + Math.sin(time * 2.0 + g.bobPhase) * 0.25;

      g.group.position.set(x, y, z);
      g.group.rotation.y = -g.angle - Math.PI / 2;
      g.group.rotation.z = Math.sin(time * 3.0 + g.bobPhase) * 0.12; // wavy hover
    });
  }

  setVisible(visible) {
    this.group.visible = visible;
  }
}
