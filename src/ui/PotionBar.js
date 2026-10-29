import { soundManager } from '../audio/SoundManager.js';

export class PotionBar {
  constructor(options = {}) {
    this.batSwarm = options.batSwarm;
    this.ghostSpecter = options.ghostSpecter;
    this.spookyScene = options.spookyScene;
    this.candle = options.candle;

    this.batsActive = true;
    this.ghostsActive = false;
    this.toxicFogActive = false;

    this.initUI();
  }

  initUI() {
    this.container = document.createElement('div');
    this.container.className = 'potion-bar glass-panel';
    this.container.innerHTML = `
      <div class="panel-header">
        <span class="icon">🧪</span>
        <h2>Witch's Cauldron</h2>
      </div>
      <p class="panel-desc">Cast dark spells around the pumpkin:</p>
      <div class="potion-grid">
        <button class="potion-btn ${this.batsActive ? 'active' : ''}" data-spell="bats" title="Bat Swarm">
          <span class="potion-icon">🦇</span>
          <span class="potion-label">Bats</span>
        </button>
        <button class="potion-btn ${this.ghostsActive ? 'active' : ''}" data-spell="ghosts" title="Ghostly Spirits">
          <span class="potion-icon">👻</span>
          <span class="potion-label">Ghosts</span>
        </button>
        <button class="potion-btn" data-spell="toxic" title="Toxic Ectoplasm Mist">
          <span class="potion-icon">🫧</span>
          <span class="potion-label">Poison Fog</span>
        </button>
        <button class="potion-btn" data-spell="thunder" title="Midnight Lightning & Thunder">
          <span class="potion-icon">⚡</span>
          <span class="potion-label">Lightning</span>
        </button>
        <button class="potion-btn" data-spell="wolf" title="Werewolf Howl into the Night">
          <span class="potion-icon">🐺</span>
          <span class="potion-label">Wolf Howl</span>
        </button>
        <button class="potion-btn" data-spell="organ" title="Gothic Haunted Organ Chord">
          <span class="potion-icon">🎹</span>
          <span class="potion-label">Dark Organ</span>
        </button>
      </div>
    `;

    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.potion-btn');
      if (!btn) return;

      const spell = btn.dataset.spell;
      this.castSpell(spell, btn);
    });
  }

  castSpell(spell, btn) {
    soundManager.playPotionBubble();

    if (spell === 'bats') {
      this.batsActive = !this.batsActive;
      this.batSwarm.setVisible(this.batsActive);
      btn.classList.toggle('active', this.batsActive);
      if (this.batsActive) soundManager.playMagicChime();
    } else if (spell === 'ghosts') {
      this.ghostsActive = !this.ghostsActive;
      this.ghostSpecter.setVisible(this.ghostsActive);
      btn.classList.toggle('active', this.ghostsActive);
      if (this.ghostsActive) soundManager.playMagicChime();
    } else if (spell === 'toxic') {
      this.toxicFogActive = !this.toxicFogActive;
      btn.classList.toggle('active', this.toxicFogActive);
      if (this.toxicFogActive) {
        this.spookyScene.fogMat.color.setHex(0x22c55e);
        this.candle.setPreset('witch');
      } else {
        this.spookyScene.fogMat.color.setHex(0xffffff);
      }
      soundManager.playMagicChime();
    } else if (spell === 'thunder') {
      this.spookyScene.triggerLightning();
      // Screen shake effect
      document.body.classList.add('screen-shake');
      if (navigator.vibrate) navigator.vibrate([30, 40, 80]);
      setTimeout(() => document.body.classList.remove('screen-shake'), 400);
    } else if (spell === 'wolf') {
      soundManager.playWolfHowl();
      if (this.spookyScene.moonLight) {
        const orig = this.spookyScene.moonLight.intensity;
        this.spookyScene.moonLight.intensity = orig * 2.2;
        setTimeout(() => {
          this.spookyScene.moonLight.intensity = orig;
        }, 2200);
      }
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 2500);
    } else if (spell === 'organ') {
      soundManager.playGothicOrganChord();
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 2500);
    }
  }

  getElement() {
    return this.container;
  }
}
