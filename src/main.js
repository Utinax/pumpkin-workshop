import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPumpkinGeometry, createStemGeometry } from './pumpkin/PumpkinGeometry.js';
import {
  createOuterPumpkinMaterial,
  createInnerPumpkinMaterial,
  createStemMaterial
} from './pumpkin/PumpkinMaterials.js';
import { Candle, FLAME_PRESETS } from './pumpkin/Candle.js';
import { CarvingEngine } from './pumpkin/CarvingEngine.js';
import { SpookyScene } from './environment/SpookyScene.js';
import { BatSwarm } from './environment/BatSwarm.js';
import { GhostSpecter } from './environment/GhostSpecter.js';
import { PotionBar } from './ui/PotionBar.js';
import { PhotoBooth } from './ui/PhotoBooth.js';
import { CandyRain } from './utils/CandyRain.js';
import { soundManager } from './audio/SoundManager.js';
import { STENCILS } from './ui/Stencils.js';
import { PUMPKIN_PRESETS } from './ui/Presets.js';

class HalloweenApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.controlMode = 'carve'; // 'carve' or 'orbit'
    this.isAwakened = false;
    this.awakenTimer = 0;

    this.initThree();
    this.initSceneObjects();
    this.initInteraction();
    this.initUI();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Start ambient audio on first user click
    const startAudioOnce = () => {
      soundManager.startAmbient();
      window.removeEventListener('pointerdown', startAudioOnce);
      window.removeEventListener('keydown', startAudioOnce);
    };
    window.addEventListener('pointerdown', startAudioOnce);
    window.addEventListener('keydown', startAudioOnce);
  }

  initThree() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060713);
    this.scene.fog = new THREE.FogExp2(0x08091a, 0.045);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0.25, 4.3);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 7.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go under the table
    this.controls.target.set(0, 0.05, 0);

    // In carve mode, right-click rotates, left-click carves
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.NONE, // handled manually in carve mode
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };

    window.addEventListener('resize', () => this.onResize());
  }

  initSceneObjects() {
    // Spooky graveyard environment (moon, stars, tombstones, fog, altar table)
    this.spookyScene = new SpookyScene(this.scene);

    // Pumpkin Master Group
    this.pumpkinGroup = new THREE.Group();
    this.pumpkinGroup.position.set(0, 0.0, 0);
    this.scene.add(this.pumpkinGroup);

    // 1. Carving Engine (manages carve canvas & texture)
    this.carvingEngine = new CarvingEngine(this.scene);

    // 2. Outer Pumpkin Shell (with carving discard shader)
    const outerGeo = createPumpkinGeometry({ radius: 1.25, heightScale: 0.88 });
    this.outerMat = createOuterPumpkinMaterial(this.carvingEngine.carveTexture);
    this.outerMesh = new THREE.Mesh(outerGeo, this.outerMat);
    this.pumpkinGroup.add(this.outerMesh);

    // Give mesh reference to carving engine for particle collisions
    this.carvingEngine.pumpkinMesh = this.outerMesh;

    // 3. Curved Woody Pumpkin Stem
    const stemGeo = createStemGeometry();
    const stemMat = createStemMaterial();
    this.stemMesh = new THREE.Mesh(stemGeo, stemMat);
    this.pumpkinGroup.add(this.stemMesh);

    // 5. Candle inside pumpkin
    this.candle = new Candle(this.pumpkinGroup);

    // 6. Flying Bat Swarm & Ghost Specters
    this.batSwarm = new BatSwarm(this.scene, 10);
    this.ghostSpecter = new GhostSpecter(this.scene, 3);

    // 7. Candy Rain Manager
    this.candyRain = new CandyRain(this.scene);

    // 8. Photo Booth Manager
    this.photoBooth = new PhotoBooth(this.renderer, this.scene, this.camera);
  }

  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isPointerDown = false;

    // 3D Carve Radius Ring (Target Cursor)
    const ringGeo = new THREE.RingGeometry(0.024, 0.032, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthTest: false
    });
    this.carveReticle = new THREE.Mesh(ringGeo, ringMat);
    this.carveReticle.visible = false;
    this.carveReticle.renderOrder = 999;
    this.scene.add(this.carveReticle);

    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    dom.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());

    // Context menu disable on canvas so right click rotate is smooth
    dom.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  getIntersection(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.outerMesh, false);
    return intersects.length > 0 ? intersects[0] : null;
  }

  onPointerDown(e) {
    if (this.controlMode === 'orbit' || e.button === 2) {
      // Allow OrbitControls default behavior
      return;
    }

    if (e.button === 0) {
      const hit = this.getIntersection(e);
      if (hit && hit.uv) {
        // Carve directly on pumpkin
        this.controls.enabled = false;
        this.isPointerDown = true;
        this.carvingEngine.startStroke(hit.uv, hit.point, hit.normal);
        if (navigator.vibrate) navigator.vibrate(14);
      } else {
        // Clicked outside pumpkin -> rotate view seamlessly!
        this.controls.enabled = true;
        this.controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      }
    }
  }

  onPointerMove(e) {
    const hit = this.getIntersection(e);

    // Update cursor style and 3D surface reticle
    if (this.controlMode === 'carve' && hit) {
      document.body.classList.add('cursor-knife');
      this.carveReticle.visible = true;
      this.carveReticle.position.copy(hit.point).addScaledVector(hit.normal, 0.005);
      this.carveReticle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), hit.normal);
      const scale = (this.carvingEngine.brushSize / 22) * 1.0;
      this.carveReticle.scale.set(scale, scale, 1);
    } else {
      document.body.classList.remove('cursor-knife');
      this.carveReticle.visible = false;
    }

    if (this.isPointerDown && hit && hit.uv) {
      this.carvingEngine.continueStroke(hit.uv, hit.point, hit.normal);
      if (navigator.vibrate) navigator.vibrate(8);
    }
  }

  onPointerUp() {
    this.controls.enabled = true;
    if (this.controlMode === 'carve') {
      this.controls.mouseButtons.LEFT = THREE.MOUSE.NONE;
    }
    if (this.isPointerDown) {
      this.isPointerDown = false;
      this.carvingEngine.endStroke();
    }
  }

  setControlMode(mode) {
    this.controlMode = mode;
    if (mode === 'orbit') {
      this.controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      document.body.classList.remove('cursor-knife');
    } else {
      this.controls.mouseButtons.LEFT = THREE.MOUSE.NONE;
    }
  }

  awakenPumpkin() {
    this.isAwakened = true;
    this.awakenTimer = 6.0;

    soundManager.playWickedLaugh();
    this.spookyScene.triggerLightning();

    // Sinister voice greeting
    const quotes = [
      "Muhahaha! Jack of the Shadows has awakened! Tonight the night belongs to us!",
      "Thank you for carving me with such a wicked face, mortal!",
      "Midnight approaches... Let all restless spirits roam free!",
      "Trick or treat? Tonight, I take both!"
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    this.showSpookyBanner('🎃 PUMPKIN SOUL AWAKENED!', quote);

    // Web Speech API if supported
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(quote);
        utter.lang = 'en-US';
        utter.pitch = 0.6; // deep eerie pitch
        utter.rate = 0.88;
        window.speechSynthesis.speak(utter);
      } catch (e) {}
    }
  }

  triggerTrickOrTreat() {
    const dialog = document.getElementById('trickOrTreatModal');
    if (dialog) dialog.showModal();
  }

  showSpookyBanner(title, subtitle) {
    const banner = document.getElementById('spookyBanner');
    if (!banner) return;
    banner.querySelector('.banner-title').textContent = title;
    banner.querySelector('.banner-sub').textContent = subtitle;
    banner.classList.add('show');
    setTimeout(() => {
      banner.classList.remove('show');
    }, 4500);
  }

  initUI() {
    // Mode Toggles (Carve vs Orbit)
    const modeCarveBtn = document.getElementById('modeCarveBtn');
    const modeOrbitBtn = document.getElementById('modeOrbitBtn');

    modeCarveBtn.addEventListener('click', () => {
      this.setControlMode('carve');
      modeCarveBtn.classList.add('active');
      modeOrbitBtn.classList.remove('active');
    });

    modeOrbitBtn.addEventListener('click', () => {
      this.setControlMode('orbit');
      modeOrbitBtn.classList.add('active');
      modeCarveBtn.classList.remove('active');
    });

    // Tool Selector buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tool = btn.dataset.tool;
        this.carvingEngine.activeTool = tool;

        // Toggle stencil drawer if stencil tool chosen
        const stencilPanel = document.getElementById('stencilDrawer');
        if (tool === 'stencil') {
          stencilPanel.classList.add('open');
        } else {
          stencilPanel.classList.remove('open');
        }
      });
    });

    // Brush Size Slider
    const sizeSlider = document.getElementById('brushSizeSlider');
    const sizeValue = document.getElementById('brushSizeVal');
    sizeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      this.carvingEngine.brushSize = val;
      sizeValue.textContent = `${val}px`;
    });

    // Undo & Clear buttons
    document.getElementById('undoBtn').addEventListener('click', () => {
      this.carvingEngine.undo();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all carvings and reset the pumpkin?')) {
        this.carvingEngine.clear();
      }
    });

    // Stencil Selection Palette
    const stencilList = document.getElementById('stencilList');
    Object.values(STENCILS).forEach((st, idx) => {
      const item = document.createElement('button');
      item.className = `stencil-card ${idx === 0 ? 'active' : ''}`;
      item.dataset.stencilId = st.id;
      item.innerHTML = `
        <span class="stencil-name">${st.name}</span>
        <span class="stencil-badge">${st.category}</span>
      `;
      item.addEventListener('click', () => {
        stencilList.querySelectorAll('.stencil-card').forEach(c => c.classList.remove('active'));
        item.classList.add('active');
        this.carvingEngine.selectedStencil = st.id;
        // Also auto select stencil tool
        this.carvingEngine.activeTool = 'stencil';
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tool="stencil"]').classList.add('active');
      });
      stencilList.appendChild(item);
    });

    // Preset Faces
    const presetSelect = document.getElementById('presetSelect');
    PUMPKIN_PRESETS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      presetSelect.appendChild(opt);
    });
    presetSelect.value = 'classic_jack';
    presetSelect.addEventListener('change', (e) => {
      this.carvingEngine.loadPreset(e.target.value);
    });

    // Candle Flame Color Buttons
    document.querySelectorAll('.flame-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.flame-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const colorKey = btn.dataset.flame;
        this.candle.setPreset(colorKey);
        soundManager.playMatchStrike();
      });
    });

    // Candle Toggle (Blow / Light)
    const candleToggleBtn = document.getElementById('candleToggleBtn');
    candleToggleBtn.addEventListener('click', () => {
      const isLit = this.candle.toggleLit();
      candleToggleBtn.classList.toggle('active', isLit);
      candleToggleBtn.querySelector('.btn-label').textContent = isLit ? 'Blow Out Candle' : 'Light Candle';
      if (isLit) {
        soundManager.playMatchStrike();
      } else {
        soundManager.playCandleBlow();
      }
    });

    // Potion Bar initialization
    const potionBarContainer = document.getElementById('potionBarMount');
    this.potionBar = new PotionBar({
      batSwarm: this.batSwarm,
      ghostSpecter: this.ghostSpecter,
      spookyScene: this.spookyScene,
      candle: this.candle
    });
    potionBarContainer.appendChild(this.potionBar.getElement());

    // Awaken Soul Button
    document.getElementById('awakenSoulBtn').addEventListener('click', () => {
      this.awakenPumpkin();
    });

    // Photo Booth Button
    document.getElementById('photoBoothBtn').addEventListener('click', () => {
      this.photoBooth.open();
    });

    // Trick or Treat Modal & Buttons
    const treatBtn = document.getElementById('trickOrTreatBtn');
    treatBtn.addEventListener('click', () => this.triggerTrickOrTreat());

    const trickOrTreatModal = document.getElementById('trickOrTreatModal');
    document.getElementById('chooseTreatBtn').addEventListener('click', () => {
      trickOrTreatModal.close();
      this.candyRain.triggerTreatShower();
      this.showSpookyBanner('🍬 TREAT UNLOCKED!', 'Delicious Halloween candies are raining down from above!');
    });

    document.getElementById('chooseTrickBtn').addEventListener('click', () => {
      trickOrTreatModal.close();
      this.spookyScene.triggerLightning();
      soundManager.playWickedLaugh();
      this.ghostSpecter.setVisible(true);
      document.body.classList.add('jumpscare-flash');
      if (navigator.vibrate) navigator.vibrate([40, 60, 100]);
      this.showSpookyBanner('👻 BOOOOO!', 'You got tricked! The graveyard ghosts have awakened!');
      setTimeout(() => {
        document.body.classList.remove('jumpscare-flash');
      }, 1000);
    });

    document.getElementById('closeTrickModal').addEventListener('click', () => {
      trickOrTreatModal.close();
    });

    // Hanging Spider Click Interaction
    const spider = document.getElementById('hangingSpider');
    if (spider) {
      spider.addEventListener('click', () => {
        soundManager.playCandyPop();
        if (navigator.vibrate) navigator.vibrate([20, 20]);
        spider.style.animation = 'none';
        void spider.offsetWidth; // reflow
        spider.style.animation = 'spiderSway 0.6s ease-in-out 3';
        this.showSpookyBanner('🕷️ EEEEEK!', 'You poked Charlotte the spider! She did a happy little wiggle!');
      });
    }

    // Sound Mute Toggle Button
    const muteBtn = document.getElementById('soundToggleBtn');
    muteBtn.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      muteBtn.classList.toggle('muted', isMuted);
      muteBtn.querySelector('.icon').textContent = isMuted ? '🔇' : '🔊';
    });

    // Mobile Navigation Dock Controls
    const mobileToolsBtn = document.getElementById('mobileToolsBtn');
    const mobileStyleBtn = document.getElementById('mobileStyleBtn');
    const mobileHideBtn = document.getElementById('mobileHideBtn');
    const sidebarLeft = document.querySelector('.sidebar-left');
    const sidebarRight = document.querySelector('.sidebar-right');

    const updateMobileDock = (activeTab) => {
      [mobileToolsBtn, mobileStyleBtn, mobileHideBtn].forEach(btn => {
        if (btn) btn.classList.remove('active');
      });

      if (activeTab === 'tools') {
        if (mobileToolsBtn) mobileToolsBtn.classList.add('active');
        if (sidebarLeft) sidebarLeft.classList.add('mobile-open');
        if (sidebarRight) sidebarRight.classList.remove('mobile-open');
      } else if (activeTab === 'style') {
        if (mobileStyleBtn) mobileStyleBtn.classList.add('active');
        if (sidebarRight) sidebarRight.classList.add('mobile-open');
        if (sidebarLeft) sidebarLeft.classList.remove('mobile-open');
      } else if (activeTab === 'hide') {
        if (mobileHideBtn) mobileHideBtn.classList.add('active');
        if (sidebarLeft) sidebarLeft.classList.remove('mobile-open');
        if (sidebarRight) sidebarRight.classList.remove('mobile-open');
      }
    };

    if (mobileToolsBtn && mobileStyleBtn && mobileHideBtn) {
      if (window.innerWidth <= 860 && sidebarLeft) {
        sidebarLeft.classList.add('mobile-open');
      }

      mobileToolsBtn.addEventListener('click', () => {
        if (sidebarLeft && sidebarLeft.classList.contains('mobile-open')) {
          updateMobileDock('hide');
        } else {
          updateMobileDock('tools');
        }
      });

      mobileStyleBtn.addEventListener('click', () => {
        if (sidebarRight && sidebarRight.classList.contains('mobile-open')) {
          updateMobileDock('hide');
        } else {
          updateMobileDock('style');
        }
      });

      mobileHideBtn.addEventListener('click', () => {
        updateMobileDock('hide');
      });
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate(timestamp) {
    requestAnimationFrame(this.animate);

    const time = timestamp * 0.001;
    const delta = 0.016;

    // Update Controls
    this.controls.update();

    // Update Candle Flame Flicker & Point Light
    this.candle.update(time);

    // Update Carving Particles (shavings flying off)
    this.carvingEngine.updateParticles(delta);

    // Update Bat Swarm & Ghost Specters
    this.batSwarm.update(time, delta);
    this.ghostSpecter.update(time, delta);

    // Update Spooky Graveyard Scene (fog drift, stars, lightning)
    this.spookyScene.update(time, delta);

    // Update Candy Rain
    this.candyRain.update(delta);

    // Awaken animation (levitation & wobble)
    if (this.isAwakened) {
      this.awakenTimer -= delta;
      if (this.awakenTimer > 0) {
        // Levitate and eerie wobble
        this.pumpkinGroup.position.y = Math.sin(time * 4.0) * 0.25 + 0.15;
        this.pumpkinGroup.rotation.y += delta * 0.4;
        this.pumpkinGroup.rotation.z = Math.sin(time * 6.0) * 0.06;
      } else {
        // Return smoothly to ground
        this.pumpkinGroup.position.y *= 0.92;
        this.pumpkinGroup.rotation.z *= 0.92;
        if (Math.abs(this.pumpkinGroup.position.y) < 0.01) {
          this.pumpkinGroup.position.y = 0;
          this.pumpkinGroup.rotation.z = 0;
          this.isAwakened = false;
        }
      }
    } else {
      // Very gentle idle breathing
      this.pumpkinGroup.position.y = Math.sin(time * 1.5) * 0.03;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new HalloweenApp();
});
