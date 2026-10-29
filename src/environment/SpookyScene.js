import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager.js';

export class SpookyScene {
  constructor(scene) {
    this.scene = scene;
    this.lightningTimer = 0;
    this.lightningIntensity = 0;

    this.initLighting();
    this.initMoon();
    this.initStars();
    this.initTable();
    this.initGraveyardProps();
    this.initGroundFog();
  }

  initLighting() {
    // Deep dark night ambient light (eerie midnight blue)
    this.ambientLight = new THREE.AmbientLight(0x1e1e38, 0.75);
    this.scene.add(this.ambientLight);

    // Cool directional moonlight from upper-left back
    this.moonLight = new THREE.DirectionalLight(0x7dd3fc, 0.85);
    this.moonLight.position.set(-6, 8, -6);
    this.scene.add(this.moonLight);

    // Warm dramatic front key light so the front pumpkin ribs and carving pop
    this.frontLight = new THREE.DirectionalLight(0xffedd5, 1.25);
    this.frontLight.position.set(2.5, 3.5, 4.5);
    this.scene.add(this.frontLight);

    // Soft eerie cyan fill light from side
    this.fillLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    this.fillLight.position.set(-4.5, 1.5, 3.5);
    this.scene.add(this.fillLight);

    // Dramatic Lightning Light (normally off)
    this.lightningLight = new THREE.DirectionalLight(0xdbeafe, 0);
    this.lightningLight.position.set(2, 10, 4);
    this.scene.add(this.lightningLight);
  }

  initMoon() {
    // Luminous Full Moon in distant background
    const moonGeo = new THREE.SphereGeometry(1.6, 24, 24);
    
    // Procedural lunar surface canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Moon base
    const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.7, '#fef3c7');
    grad.addColorStop(1, '#fde68a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Craters / Maria
    ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
    const craters = [
      [180, 160, 60], [320, 200, 80], [220, 320, 95],
      [360, 360, 50], [130, 280, 45], [290, 100, 35]
    ];
    craters.forEach(([cx, cy, r]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    const moonTex = new THREE.CanvasTexture(canvas);
    const moonMat = new THREE.MeshBasicMaterial({
      map: moonTex
    });

    this.moon = new THREE.Mesh(moonGeo, moonMat);
    this.moon.position.set(-8, 9, -14);
    this.scene.add(this.moon);

    // Glowing moon halo billboard
    const haloGeo = new THREE.PlaneGeometry(7.5, 7.5);
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 256;
    haloCanvas.height = 256;
    const hCtx = haloCanvas.getContext('2d');
    const hGrad = hCtx.createRadialGradient(128, 128, 40, 128, 128, 128);
    hGrad.addColorStop(0, 'rgba(254, 243, 199, 0.45)');
    hGrad.addColorStop(0.4, 'rgba(253, 230, 138, 0.2)');
    hGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 256, 256);

    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(-8, 9, -13.9);
    this.scene.add(halo);
  }

  initStars() {
    const starCount = 450;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Hemisphere distribution in the sky
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.8 + 0.2); // upper sky
      const r = 25 + Math.random() * 15;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.12,
      transparent: true,
      opacity: 0.75
    });

    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  initTable() {
    // Rustic weathered dark wood altar table where the pumpkin sits
    const tableGeo = new THREE.CylinderGeometry(2.1, 2.2, 0.4, 32);
    
    // Wood texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, 512, 512);

    // Wood rings
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    for (let r = 20; r < 250; r += 14) {
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const tableTex = new THREE.CanvasTexture(canvas);
    const tableMat = new THREE.MeshStandardMaterial({
      map: tableTex,
      roughness: 0.85,
      metalness: 0.05
    });

    this.table = new THREE.Mesh(tableGeo, tableMat);
    this.table.position.y = -1.25;
    this.scene.add(this.table);

    // Stone pedestal base
    const baseGeo = new THREE.CylinderGeometry(1.6, 2.4, 2.0, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.95
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = -2.4;
    this.scene.add(pedestal);
  }

  initGraveyardProps() {
    this.propsGroup = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9
    });

    // Tombstones around the distant background
    const tombPositions = [
      [-4.2, -1.0, -5.5],
      [4.5, -1.0, -6.0],
      [-5.5, -0.9, -2.5],
      [5.2, -0.9, -3.0],
      [1.5, -1.0, -7.0]
    ];

    tombPositions.forEach(([x, y, z], idx) => {
      const tomb = new THREE.Group();
      // Rounded top tombstone slab
      const slabGeo = new THREE.BoxGeometry(0.55, 0.9, 0.12);
      const slab = new THREE.Mesh(slabGeo, stoneMat);
      slab.position.y = 0.45;
      tomb.add(slab);

      // Rounded arch top
      const archGeo = new THREE.CylinderGeometry(0.275, 0.275, 0.12, 16, 1, false, 0, Math.PI);
      archGeo.rotateZ(-Math.PI / 2);
      archGeo.rotateX(Math.PI / 2);
      const arch = new THREE.Mesh(archGeo, stoneMat);
      arch.position.y = 0.9;
      tomb.add(arch);

      tomb.position.set(x, y, z);
      tomb.rotation.y = (Math.random() - 0.5) * 0.6;
      tomb.rotation.z = (Math.random() - 0.5) * 0.12; // tilted with age
      this.propsGroup.add(tomb);
    });

    // Spooky gnarled bare silhouette trees
    this.createGnarledTree(-6.5, -1.2, -7.5);
    this.createGnarledTree(6.8, -1.2, -8.0);

    this.scene.add(this.propsGroup);
  }

  createGnarledTree(x, y, z) {
    const treeMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.95
    });

    const trunk = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.35, 3.2, 8);
    const trunkMesh = new THREE.Mesh(trunkGeo, treeMat);
    trunkMesh.position.y = 1.6;
    trunkMesh.rotation.z = 0.08;
    trunk.add(trunkMesh);

    // Twisted branches
    const b1Geo = new THREE.CylinderGeometry(0.08, 0.14, 1.8, 6);
    const b1 = new THREE.Mesh(b1Geo, treeMat);
    b1.position.set(-0.4, 2.5, 0.1);
    b1.rotation.z = 0.7;
    trunk.add(b1);

    const b2Geo = new THREE.CylinderGeometry(0.06, 0.12, 1.5, 6);
    const b2 = new THREE.Mesh(b2Geo, treeMat);
    b2.position.set(0.5, 2.7, -0.2);
    b2.rotation.z = -0.65;
    trunk.add(b2);

    trunk.position.set(x, y, z);
    this.propsGroup.add(trunk);
  }

  initGroundFog() {
    // Layered ground fog planes
    const fogGeo = new THREE.PlaneGeometry(18, 18);
    fogGeo.rotateX(-Math.PI / 2);

    const fogCanvas = document.createElement('canvas');
    fogCanvas.width = 256;
    fogCanvas.height = 256;
    const ctx = fogCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
    grad.addColorStop(0.5, 'rgba(125, 211, 252, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const fogTex = new THREE.CanvasTexture(fogCanvas);
    this.fogMat = new THREE.MeshBasicMaterial({
      map: fogTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fogPlane1 = new THREE.Mesh(fogGeo, this.fogMat);
    this.fogPlane1.position.y = -1.0;
    this.scene.add(this.fogPlane1);

    this.fogPlane2 = new THREE.Mesh(fogGeo, this.fogMat);
    this.fogPlane2.position.y = -0.7;
    this.fogPlane2.rotation.y = Math.PI / 4;
    this.scene.add(this.fogPlane2);
  }

  triggerLightning() {
    this.lightningIntensity = 3.8;
    this.lightningLight.intensity = this.lightningIntensity;
    soundManager.playThunder();
  }

  update(time, delta) {
    // Slow drifting ground fog
    if (this.fogPlane1) {
      this.fogPlane1.rotation.y += delta * 0.04;
      this.fogPlane2.rotation.y -= delta * 0.03;
    }

    // Stars gentle twinkle
    if (this.stars) {
      this.stars.rotation.y = time * 0.002;
    }

    // Decay lightning flash
    if (this.lightningIntensity > 0) {
      this.lightningIntensity *= 0.88;
      if (this.lightningIntensity < 0.05) this.lightningIntensity = 0;
      this.lightningLight.intensity = this.lightningIntensity;
    }
  }
}
