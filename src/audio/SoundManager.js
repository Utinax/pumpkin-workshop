/**
 * Procedural Web Audio API Sound Synthesizer for Halloween
 * Zero external asset dependencies - runs reliably in any browser!
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.ambientNodes = [];
    this.isAmbientPlaying = false;
    this.lastCarveTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Realistic crunchy knife carving sound
  playCarve(intensity = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastCarveTime < 0.04) return; // throttle high frequency events
    this.lastCarveTime = now;

    const dur = 0.08 + Math.random() * 0.05;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Filtered noise with pumpkin flesh squelch
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * (i / bufferSize));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(800 + Math.random() * 700, now);
    bandpass.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Strike match & ignite flame
  playMatchStrike() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Friction scrape
    const scrapeDur = 0.12;
    const bufSize = this.ctx.sampleRate * scrapeDur;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const scrape = this.ctx.createBufferSource();
    scrape.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, now);

    const scrapeGain = this.ctx.createGain();
    scrapeGain.gain.setValueAtTime(0.2, now);
    scrapeGain.gain.exponentialRampToValueAtTime(0.01, now + scrapeDur);

    scrape.connect(filter);
    filter.connect(scrapeGain);
    scrapeGain.connect(this.ctx.destination);
    scrape.start(now);

    // Warm flame ignition "whoosh"
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);

    oscGain.gain.setValueAtTime(0.25, now + 0.08);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now + 0.08);
    osc.stop(now + 0.45);
  }

  // Blow out candle puff
  playCandleBlow() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.35;
    const bufSize = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / bufSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Distant or dramatic thunder crack & rumble
  playThunder() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 2.2;
    const bufSize = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);

    // Crack followed by long rumbling decay
    for (let i = 0; i < bufSize; i++) {
      const t = i / this.ctx.sampleRate;
      const env = t < 0.05 ? t / 0.05 : Math.exp(-1.4 * (t - 0.05));
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Spooky evil laugh synthesizer
  playWickedLaugh() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const pitches = [240, 210, 180, 150, 130, 110];
    
    pitches.forEach((freq, idx) => {
      const noteTime = now + idx * 0.16;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, noteTime + 0.14);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, noteTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.16);
    });
  }

  // Potion cauldron bubbling / liquid splash
  playPotionBubble() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const bubbleTime = now + i * 0.08 + Math.random() * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startFreq = 250 + Math.random() * 200;
      const endFreq = startFreq + 350 + Math.random() * 150;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, bubbleTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, bubbleTime + 0.09);

      gain.gain.setValueAtTime(0.15, bubbleTime);
      gain.gain.exponentialRampToValueAtTime(0.001, bubbleTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(bubbleTime);
      osc.stop(bubbleTime + 0.1);
    }
  }

  // Magical spell chime
  playMagicChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C E G C E

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  // Candy shower chime
  playCandyPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const popTime = now + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + i * 150, popTime);
      osc.frequency.exponentialRampToValueAtTime(1200 + i * 200, popTime + 0.06);

      gain.gain.setValueAtTime(0.15, popTime);
      gain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(popTime);
      osc.stop(popTime + 0.09);
    }
  }

  // Continuous spooky ambient wind & low drone
  startAmbient() {
    if (this.isAmbientPlaying) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, now);
    this.ambientGain.connect(this.ctx.destination);

    // Low mysterious drone
    const drone = this.ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(55, now); // A1 note

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.4, now);

    drone.connect(droneGain);
    droneGain.connect(this.ambientGain);
    drone.start(now);
    this.ambientNodes.push(drone);

    // Eerie howling wind via bandpassed noise with LFO modulation
    const windBufferSize = this.ctx.sampleRate * 2;
    const windBuf = this.ctx.createBuffer(1, windBufferSize, this.ctx.sampleRate);
    const windData = windBuf.getChannelData(0);
    for (let i = 0; i < windBufferSize; i++) {
      windData[i] = Math.random() * 2 - 1;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = windBuf;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(320, now);
    windFilter.Q.setValueAtTime(4.0, now);

    // LFO to modulate wind howling frequency
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, now); // slow wave
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, now); // swing between 180Hz and 460Hz
    lfo.connect(windFilter.frequency);
    lfo.start(now);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.35, now);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.ambientGain);

    windSource.start(now);
    this.ambientNodes.push(windSource, lfo);

    this.isAmbientPlaying = true;
  }

  // Procedural distant wolf howl
  playWolfHowl() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 2.8;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    // Classic mournful wolf pitch glide: start low, rise to peak, mournful slide down
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.6);
    osc.frequency.setValueAtTime(420, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(310, now + 2.0);
    osc.frequency.exponentialRampToValueAtTime(160, now + dur);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(360, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(260, now + dur);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.5);
    gain.gain.setValueAtTime(0.18, now + 1.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + dur);
  }

  // Gothic cathedral organ chord (D minor: D3, F3, A3, D4)
  playGothicOrganChord() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [146.83, 174.61, 220.00, 293.66]; // D3, F3, A3, D4
    const dur = 2.5;

    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + dur);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.setValueAtTime(0.08, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    });
  }

  stopAmbient() {
    this.ambientNodes.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.ambientNodes = [];
    this.isAmbientPlaying = false;
  }
}

export const soundManager = new SoundManager();
