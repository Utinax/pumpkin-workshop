import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager.js';
import { STENCILS } from '../ui/Stencils.js';
import { PUMPKIN_PRESETS } from '../ui/Presets.js';

export class CarvingEngine {
  constructor(scene, pumpkinMesh) {
    this.scene = scene;
    this.pumpkinMesh = pumpkinMesh;

    this.width = 2048;
    this.height = 1024;

    // Carving canvas & texture
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    // Initialize with white (solid uncut opaque pumpkin skin)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.carveTexture = new THREE.CanvasTexture(this.canvas);
    this.carveTexture.wrapS = THREE.RepeatWrapping;
    this.carveTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.carveTexture.minFilter = THREE.LinearFilter;
    this.carveTexture.magFilter = THREE.LinearFilter;

    // Tool configuration
    this.activeTool = 'knife'; // 'knife', 'saw', 'scoop', 'peel', 'patch', 'stencil'
    this.brushSize = 22; // 8 to 60
    this.selectedStencil = 'triangle_eyes';
    this.stencilScale = 140;

    // Drawing state
    this.isCarving = false;
    this.lastUV = null;

    // Undo history
    this.history = [];
    this.maxHistory = 12;
    this.saveState();

    // 3D Flying Pumpkin Shavings / Sparks Particle System
    this.initShavingsParticles();

    // Load initial classic preset so the pumpkin looks inviting right away, without triggering audio context before gesture
    this.loadPreset('classic_jack', false);
  }

  initShavingsParticles() {
    this.maxParticles = 120;
    const geo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.maxParticles * 3);
    this.particleVelocities = [];
    this.particleLifetimes = new Float32Array(this.maxParticles);

    for (let i = 0; i < this.maxParticles; i++) {
      this.particlePositions[i * 3] = 0;
      this.particlePositions[i * 3 + 1] = -100;
      this.particlePositions[i * 3 + 2] = 0;
      this.particleVelocities.push(new THREE.Vector3());
      this.particleLifetimes[i] = 0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    // Warm orange and yellow pumpkin flesh particles
    this.particleMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.05,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending
    });

    this.particles = new THREE.Points(geo, this.particleMat);
    this.scene.add(this.particles);
    this.nextParticleIdx = 0;
  }

  emitShavings(point, normal, count = 4) {
    for (let i = 0; i < count; i++) {
      const idx = this.nextParticleIdx;
      this.nextParticleIdx = (this.nextParticleIdx + 1) % this.maxParticles;

      this.particlePositions[idx * 3] = point.x + (Math.random() - 0.5) * 0.05;
      this.particlePositions[idx * 3 + 1] = point.y + (Math.random() - 0.5) * 0.05;
      this.particlePositions[idx * 3 + 2] = point.z + (Math.random() - 0.5) * 0.05;

      // Burst velocity outward along surface normal with random spread
      const vel = this.particleVelocities[idx];
      vel.copy(normal).multiplyScalar(0.8 + Math.random() * 0.8);
      vel.x += (Math.random() - 0.5) * 0.6;
      vel.y += (Math.random() - 0.2) * 0.5; // slight upward bounce
      vel.z += (Math.random() - 0.5) * 0.6;

      this.particleLifetimes[idx] = 0.5 + Math.random() * 0.4;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  updateParticles(delta) {
    let active = false;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.particleLifetimes[i] > 0) {
        active = true;
        this.particleLifetimes[i] -= delta;

        // Apply gravity
        this.particleVelocities[i].y -= 4.5 * delta;

        // Update pos
        this.particlePositions[i * 3] += this.particleVelocities[i].x * delta;
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i].y * delta;
        this.particlePositions[i * 3 + 2] += this.particleVelocities[i].z * delta;

        if (this.particleLifetimes[i] <= 0) {
          this.particlePositions[i * 3 + 1] = -100; // hide
        }
      }
    }
    if (active) {
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }

  saveState() {
    try {
      const data = this.ctx.getImageData(0, 0, this.width, this.height);
      this.history.push(data);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    } catch (e) {
      console.warn('History snapshot error', e);
    }
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop(); // remove current state
      const prevState = this.history[this.history.length - 1];
      if (prevState) {
        this.ctx.putImageData(prevState, 0, 0);
        this.carveTexture.needsUpdate = true;
        soundManager.playCarve(0.8);
        return true;
      }
    }
    return false;
  }

  clear() {
    this.saveState();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.carveTexture.needsUpdate = true;
    soundManager.playCarve(1.2);
  }

  loadPreset(presetId, playSound = true) {
    const preset = PUMPKIN_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    this.saveState();
    preset.draw(this.ctx, this.width, this.height);
    this.carveTexture.needsUpdate = true;
    if (playSound) {
      soundManager.playMagicChime();
    }
  }

  startStroke(uv, hitPoint, hitNormal) {
    this.saveState();
    this.isCarving = true;
    this.lastUV = uv;

    if (this.activeTool === 'stencil') {
      this.stampStencilAtUV(uv);
    } else {
      this.carveAtUV(uv, uv);
    }

    if (hitPoint && hitNormal) {
      this.emitShavings(hitPoint, hitNormal, 8);
    }
    soundManager.playCarve(1.0);
  }

  continueStroke(uv, hitPoint, hitNormal) {
    if (!this.isCarving) return;

    if (this.activeTool !== 'stencil') {
      this.carveAtUV(this.lastUV, uv);
      this.lastUV = uv;
    }

    if (hitPoint && hitNormal) {
      this.emitShavings(hitPoint, hitNormal, 2);
    }
    soundManager.playCarve(0.6);
  }

  endStroke() {
    this.isCarving = false;
    this.lastUV = null;
  }

  carveAtUV(fromUV, toUV) {
    const fromX = fromUV.x * this.width;
    const fromY = (1.0 - fromUV.y) * this.height;
    let toX = toUV.x * this.width;
    const toY = (1.0 - toUV.y) * this.height;

    // Handle horizontal texture wrapping seam
    if (Math.abs(toX - fromX) > this.width * 0.5) {
      if (toX > fromX) {
        toX -= this.width;
      } else {
        toX += this.width;
      }
    }

    const dist = Math.hypot(toX - fromX, toY - fromY);
    const stepSize = Math.max(3, this.brushSize * 0.3);
    const steps = Math.max(1, Math.ceil(dist / stepSize));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let currX = fromX + (toX - fromX) * t;
      const currY = fromY + (toY - fromY) * t;

      // Wrap back to canvas bounds
      currX = (currX % this.width + this.width) % this.width;

      this.drawToolStamp(currX, currY);

      // Handle seam wrap near edges
      if (currX < this.brushSize * 2) {
        this.drawToolStamp(currX + this.width, currY);
      } else if (currX > this.width - this.brushSize * 2) {
        this.drawToolStamp(currX - this.width, currY);
      }
    }

    this.carveTexture.needsUpdate = true;
  }

  drawToolStamp(x, y) {
    this.ctx.save();

    if (this.activeTool === 'knife') {
      // Clean cut through shell (black = transparent cutout revealing glowing inside)
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.brushSize * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.activeTool === 'saw') {
      // Serrated jagged knife cut
      this.ctx.fillStyle = '#000000';
      const points = 7;
      const rOuter = this.brushSize * 0.6;
      const rInner = this.brushSize * 0.3;
      this.ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const rad = i % 2 === 0 ? rOuter : rInner;
        const px = x + Math.cos(angle) * rad;
        const py = y + Math.sin(angle) * rad;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.fill();
    } else if (this.activeTool === 'scoop') {
      // Broad round chisel
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.brushSize * 1.1, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.activeTool === 'peel') {
      // Flesh scraping / peel (partial alpha)
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.brushSize * 0.8, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.activeTool === 'patch') {
      // Putty eraser - restores white solid uncut pumpkin skin
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.brushSize * 0.9, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  stampStencilAtUV(uv) {
    const x = uv.x * this.width;
    const y = (1.0 - uv.y) * this.height;

    const stencil = STENCILS[this.selectedStencil];
    if (!stencil) return;

    this.ctx.save();
    this.ctx.fillStyle = '#000000';

    stencil.draw(this.ctx, x, y, this.stencilScale);

    // Seam wrap check
    if (x < this.stencilScale) {
      stencil.draw(this.ctx, x + this.width, y, this.stencilScale);
    } else if (x > this.width - this.stencilScale) {
      stencil.draw(this.ctx, x - this.width, y, this.stencilScale);
    }

    this.ctx.restore();
    this.carveTexture.needsUpdate = true;
  }
}
