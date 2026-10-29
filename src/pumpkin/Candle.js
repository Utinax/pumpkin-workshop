import * as THREE from 'three';

export const FLAME_PRESETS = {
  classic: { name: 'Classic Fire', hex: '#ff7700', lightColor: 0xff8811, glowColor: 0xffaa33, lightIntensity: 4.5 },
  ghost: { name: 'Ghost Cyan', hex: '#00e5ff', lightColor: 0x00e5ff, glowColor: 0x67e8f9, lightIntensity: 4.8 },
  witch: { name: 'Witch\'s Green', hex: '#22c55e', lightColor: 0x22c55e, glowColor: 0x86efac, lightIntensity: 4.6 },
  cursed: { name: 'Cursed Violet', hex: '#a855f7', lightColor: 0xa855f7, glowColor: 0xd8b4fe, lightIntensity: 5.0 },
  blood: { name: 'Blood Moon', hex: '#ef4444', lightColor: 0xef4444, glowColor: 0xfca5a5, lightIntensity: 4.5 }
};

export class Candle {
  constructor(scene) {
    this.scene = scene;
    this.isLit = true;
    this.currentPresetKey = 'classic';
    this.group = new THREE.Group();

    this.initCandleMesh();
    this.initLight();
    this.initFlameMesh();
    this.initSmokeParticles();

    this.group.position.set(0, -0.65, 0); // Position inside bottom of pumpkin
    this.scene.add(this.group);
  }

  initCandleMesh() {
    // Ivory wax cylinder with subtle melted top
    const waxGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.35, 16);
    const waxMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.35,
      metalness: 0.05
    });
    const wax = new THREE.Mesh(waxGeo, waxMat);
    wax.position.y = 0.175;
    this.group.add(wax);

    // Candle wick
    const wickGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
    const wick = new THREE.Mesh(wickGeo, wickMat);
    wick.position.y = 0.38;
    this.group.add(wick);
  }

  initLight() {
    const preset = FLAME_PRESETS[this.currentPresetKey];
    this.light = new THREE.PointLight(preset.lightColor, preset.lightIntensity, 7.5, 1.8);
    this.light.position.set(0, 0.5, 0);
    this.light.castShadow = false; // keep 60fps fast
    this.group.add(this.light);

    // Secondary subtle fill light so the carved interior details pop
    this.innerFillLight = new THREE.PointLight(preset.lightColor, preset.lightIntensity * 0.45, 4.0, 2.0);
    this.innerFillLight.position.set(0, 0.1, 0);
    this.group.add(this.innerFillLight);
  }

  initFlameMesh() {
    // Crossed animated planes for 3D volumetric flame look
    const flameGeo = new THREE.PlaneGeometry(0.18, 0.36);
    flameGeo.translate(0, 0.18, 0); // pivot at base of flame

    // Procedural flame canvas
    const flameCanvas = document.createElement('canvas');
    flameCanvas.width = 128;
    flameCanvas.height = 256;
    const ctx = flameCanvas.getContext('2d');

    // Outer glow
    const grad = ctx.createRadialGradient(64, 180, 5, 64, 160, 60);
    grad.addColorStop(0, '#ffffff'); // pure white core
    grad.addColorStop(0.35, '#fffae6');
    grad.addColorStop(0.7, '#ff8800');
    grad.addColorStop(1, 'rgba(255, 60, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(64, 240);
    ctx.bezierCurveTo(20, 200, 20, 100, 64, 20); // teardrop top
    ctx.bezierCurveTo(108, 100, 108, 200, 64, 240);
    ctx.fill();

    this.flameTexture = new THREE.CanvasTexture(flameCanvas);

    this.flameMat = new THREE.MeshBasicMaterial({
      map: this.flameTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.flame1 = new THREE.Mesh(flameGeo, this.flameMat);
    this.flame2 = new THREE.Mesh(flameGeo, this.flameMat);
    this.flame2.rotation.y = Math.PI / 2;

    this.flameGroup = new THREE.Group();
    this.flameGroup.position.set(0, 0.41, 0);
    this.flameGroup.add(this.flame1, this.flame2);
    this.group.add(this.flameGroup);
  }

  initSmokeParticles() {
    // Faint smoke drift when blown out
    const particleCount = 20;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.1;
      pos[i * 3 + 1] = 0.4 + Math.random() * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    this.smokeMat = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.08,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    this.smokeParticles = new THREE.Points(geo, this.smokeMat);
    this.group.add(this.smokeParticles);
  }

  setPreset(presetKey) {
    if (!FLAME_PRESETS[presetKey]) return;
    this.currentPresetKey = presetKey;
    const preset = FLAME_PRESETS[presetKey];

    this.light.color.setHex(preset.lightColor);
    this.innerFillLight.color.setHex(preset.lightColor);
    this.flameMat.color.setHex(preset.glowColor);
  }

  toggleLit() {
    this.isLit = !this.isLit;
    this.flameGroup.visible = this.isLit;
    if (!this.isLit) {
      this.light.intensity = 0;
      this.innerFillLight.intensity = 0;
      this.smokeMat.opacity = 0.4;
    } else {
      this.smokeMat.opacity = 0.0;
    }
    return this.isLit;
  }

  update(time) {
    if (!this.isLit) {
      // Fade out smoke
      if (this.smokeMat.opacity > 0.005) {
        this.smokeMat.opacity *= 0.96;
        const pos = this.smokeParticles.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          pos.setY(i, pos.getY(i) + 0.008);
        }
        pos.needsUpdate = true;
      }
      return;
    }

    const preset = FLAME_PRESETS[this.currentPresetKey];

    // Realistic multi-frequency flame flicker
    const flicker1 = Math.sin(time * 16.0) * 0.12;
    const flicker2 = Math.cos(time * 29.0) * 0.08;
    const randomFlicker = (Math.random() - 0.5) * 0.09;
    const flicker = 1.0 + flicker1 + flicker2 + randomFlicker;

    this.light.intensity = preset.lightIntensity * Math.max(0.6, flicker);
    this.innerFillLight.intensity = (preset.lightIntensity * 0.45) * Math.max(0.6, flicker);

    // Flame mesh pulsation & gentle swaying draft
    const scaleX = 1.0 + Math.sin(time * 18.0) * 0.15;
    const scaleY = 1.0 + Math.cos(time * 14.0) * 0.22;
    this.flameGroup.scale.set(scaleX, scaleY, scaleX);

    // Gentle wind wobble
    this.flameGroup.rotation.z = Math.sin(time * 8.0) * 0.08 + Math.cos(time * 21.0) * 0.04;
    this.flameGroup.rotation.x = Math.cos(time * 7.0) * 0.06;

    // Light position micro-jitter
    this.light.position.x = Math.sin(time * 12.0) * 0.02;
    this.light.position.z = Math.cos(time * 14.0) * 0.02;
  }
}
