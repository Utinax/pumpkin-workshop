import * as THREE from 'three';

/**
 * Animated 3D Bat Swarm with flapping wing geometry
 */
export class BatSwarm {
  constructor(scene, count = 12) {
    this.scene = scene;
    this.count = count;
    this.bats = [];
    this.group = new THREE.Group();

    this.initBats();
    this.scene.add(this.group);
  }

  initBats() {
    const batMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < this.count; i++) {
      const bat = new THREE.Group();

      // Bat body
      const bodyGeo = new THREE.ConeGeometry(0.04, 0.16, 5);
      bodyGeo.rotateX(Math.PI / 2);
      const body = new THREE.Mesh(bodyGeo, batMaterial);
      bat.add(body);

      // Bat head with tiny ears
      const headGeo = new THREE.SphereGeometry(0.035, 6, 6);
      const head = new THREE.Mesh(headGeo, batMaterial);
      head.position.z = 0.09;
      bat.add(head);

      // Left wing
      const wingGeo = new THREE.BufferGeometry();
      const leftWingVerts = new Float32Array([
        0, 0, 0,
        -0.22, 0.08, 0.02,
        -0.12, -0.06, -0.04,
        -0.22, 0.08, 0.02,
        -0.35, 0.02, 0.01,
        -0.24, -0.08, -0.04
      ]);
      wingGeo.setAttribute('position', new THREE.BufferAttribute(leftWingVerts, 3));
      wingGeo.computeVertexNormals();

      const leftWing = new THREE.Mesh(wingGeo, batMaterial);
      leftWing.position.x = -0.03;

      // Right wing
      const rightWingGeo = wingGeo.clone();
      rightWingGeo.scale(-1, 1, 1);
      const rightWing = new THREE.Mesh(rightWingGeo, batMaterial);
      rightWing.position.x = 0.03;

      bat.add(leftWing);
      bat.add(rightWing);

      // Animation parameters
      const radius = 3.5 + Math.random() * 4.0;
      const height = 1.2 + Math.random() * 2.8;
      const speed = 0.8 + Math.random() * 0.7;
      const angle = (i / this.count) * Math.PI * 2;
      const flapSpeed = 16 + Math.random() * 8;

      bat.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      this.bats.push({
        group: bat,
        leftWing,
        rightWing,
        radius,
        baseHeight: height,
        speed,
        angle,
        flapSpeed,
        phase: Math.random() * Math.PI * 2
      });

      this.group.add(bat);
    }
  }

  update(time, delta) {
    this.bats.forEach(bat => {
      bat.angle += bat.speed * delta;
      
      const x = Math.cos(bat.angle) * bat.radius;
      const z = Math.sin(bat.angle) * bat.radius;
      const y = bat.baseHeight + Math.sin(bat.angle * 2.5 + bat.phase) * 0.45;

      bat.group.position.set(x, y, z);

      // Orient forward along tangent of orbit
      const forwardAngle = bat.angle + Math.PI / 2;
      bat.group.rotation.y = -forwardAngle;
      bat.group.rotation.z = Math.sin(bat.angle * 2.0) * 0.25; // banking

      // Flap wings
      const flap = Math.sin(time * bat.flapSpeed + bat.phase) * 0.7;
      bat.leftWing.rotation.z = flap;
      bat.rightWing.rotation.z = -flap;
    });
  }

  setVisible(visible) {
    this.group.visible = visible;
  }
}
