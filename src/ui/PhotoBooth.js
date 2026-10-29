import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager.js';

export class PhotoBooth {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.cardText = 'Happy Halloween!';
    this.authorName = 'Master Carver';
    this.frameTheme = 'gothic';

    this.initModal();
  }

  initModal() {
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'photo-modal';
    this.dialog.innerHTML = `
      <div class="photo-modal-content glass-panel">
        <div class="modal-header">
          <h3>📸 Create Pumpkin Greeting Card</h3>
          <button class="close-btn" id="closePhotoModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="preview-area">
            <canvas id="photoCanvas" width="800" height="600"></canvas>
          </div>
          <div class="controls-area">
            <div class="field-group">
              <label for="cardTextInput">Greeting / Message:</label>
              <input type="text" id="cardTextInput" aria-label="Greeting / Message" value="Happy Halloween!" maxlength="40" />
            </div>
            <div class="field-group">
              <label for="authorInput">Your Name / Signature:</label>
              <input type="text" id="authorInput" aria-label="Your Name / Signature" value="Master Carver" maxlength="25" />
            </div>
            <div class="field-group">
              <span class="field-label">Card Theme:</span>
              <div class="theme-buttons">
                <button class="theme-btn active" data-theme="gothic">🎃 Classic Gothic</button>
                <button class="theme-btn" data-theme="blood">🩸 Blood Moon</button>
                <button class="theme-btn" data-theme="witch">🧪 Witch Potion</button>
                <button class="theme-btn" data-theme="ghost">👻 Ghost Realm</button>
              </div>
            </div>
            <div class="action-buttons" style="display: flex; flex-direction: column; gap: 8px;">
              <button id="downloadPhotoBtn" class="primary-btn glow-btn">
                <span>⬇️ Download Card (PNG)</span>
              </button>
              <button id="copyPhotoBtn" class="action-btn" style="width: 100%; justify-content: center; padding: 10px; font-weight: 700; border-radius: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2);">
                <span>📋 Copy to Clipboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.dialog.setAttribute('closedby', 'any');
    document.body.appendChild(this.dialog);

    this.canvas = this.dialog.querySelector('#photoCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.cardTextInput = this.dialog.querySelector('#cardTextInput');
    this.authorInput = this.dialog.querySelector('#authorInput');

    // Event listeners
    this.dialog.querySelector('#closePhotoModal').addEventListener('click', () => this.close());
    this.cardTextInput.addEventListener('input', () => this.renderCard());
    this.authorInput.addEventListener('input', () => this.renderCard());

    this.dialog.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.dialog.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.frameTheme = btn.dataset.theme;
        this.renderCard();
      });
    });

    this.dialog.querySelector('#downloadPhotoBtn').addEventListener('click', () => this.download());
    
    this.dialog.querySelector('#copyPhotoBtn').addEventListener('click', async () => {
      try {
        this.canvas.toBlob(async (blob) => {
          if (!blob) return;
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            soundManager.playMagicChime();
            const copyBtn = this.dialog.querySelector('#copyPhotoBtn span');
            const orig = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied to Clipboard!';
            setTimeout(() => { copyBtn.textContent = orig; }, 2500);
          } else {
            this.download();
          }
        });
      } catch (err) {
        this.download();
      }
    });

    // Light dismiss
    this.dialog.addEventListener('click', (e) => {
      if (e.target === this.dialog) this.close();
    });
  }

  open() {
    soundManager.playMagicChime();

    // 1. Save original camera aspect & viewport size
    const originalAspect = this.camera.aspect;
    const originalSize = new THREE.Vector2();
    this.renderer.getSize(originalSize);

    // 2. Temporarily set camera to clean 4:3 card aspect ratio (800x600)
    // so the pumpkin is perfectly proportioned on both mobile & desktop
    const cardW = 800;
    const cardH = 600;
    this.camera.aspect = cardW / cardH;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(cardW, cardH, false);

    // 3. Render and capture pristine 4:3 card image
    this.renderer.render(this.scene, this.camera);
    this.capturedImage = this.renderer.domElement.toDataURL('image/png');

    // 4. Immediately restore original camera & viewport size
    this.camera.aspect = originalAspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(originalSize.x, originalSize.y, false);

    this.dialog.showModal();
    this.renderCard();
  }

  close() {
    this.dialog.close();
  }

  renderCard() {
    if (!this.capturedImage) return;

    const img = new Image();
    img.onload = () => {
      const w = this.canvas.width;
      const h = this.canvas.height;

      // Aspect-ratio cover calculation: guarantees zero squashing or stretching
      const imgAspect = img.width / img.height;
      const canvasAspect = w / h;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (imgAspect > canvasAspect) {
        // Image is wider than card -> crop left/right
        sw = img.height * canvasAspect;
        sx = (img.width - sw) * 0.5;
      } else {
        // Image is taller than card (portrait) -> crop top/bottom
        sh = img.width / canvasAspect;
        sy = (img.height - sh) * 0.5;
      }

      // Draw background 3D capture with correct aspect ratio
      this.ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      // Theme colors
      const themeColors = {
        gothic: { primary: '#f97316', secondary: '#7c2d12', border: '#ea580c' },
        blood: { primary: '#ef4444', secondary: '#450a0a', border: '#b91c1c' },
        witch: { primary: '#22c55e', secondary: '#052e16', border: '#16a34a' },
        ghost: { primary: '#38bdf8', secondary: '#082f49', border: '#0284c7' }
      }[this.frameTheme];

      // Vignette & dark bottom gradient for text readability
      const vignette = this.ctx.createLinearGradient(0, h * 0.6, 0, h);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.75)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      this.ctx.fillStyle = vignette;
      this.ctx.fillRect(0, 0, w, h);

      // Ornate Spooky Border Frame
      this.ctx.lineWidth = 10;
      this.ctx.strokeStyle = themeColors.border;
      this.ctx.strokeRect(20, 20, w - 40, h - 40);

      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = themeColors.primary;
      this.ctx.strokeRect(28, 28, w - 56, h - 56);

      // Corner Ornaments
      const drawCorner = (cx, cy) => {
        this.ctx.fillStyle = themeColors.primary;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        this.ctx.fill();
      };
      drawCorner(28, 28);
      drawCorner(w - 28, 28);
      drawCorner(28, h - 28);
      drawCorner(w - 28, h - 28);

      // Top Header Banner
      this.ctx.font = 'bold 18px "Creepster", "Cinzel Decorative", serif';
      this.ctx.fillStyle = themeColors.primary;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('✦ HALLOWEEN 2026 ✦', w / 2, 55);

      // Bottom Message Text
      const msg = this.cardTextInput.value || 'Happy Halloween!';
      this.ctx.font = 'bold 36px "Creepster", "Cinzel Decorative", sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = themeColors.primary;
      this.ctx.shadowBlur = 16;
      this.ctx.fillText(msg, w / 2, h - 75);

      // Author Signature
      const author = this.authorInput.value ? `Carver: ${this.authorInput.value}` : '';
      this.ctx.font = 'italic 16px sans-serif';
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.shadowBlur = 0;
      this.ctx.fillText(author, w / 2, h - 42);
    };
    img.src = this.capturedImage;
  }

  download() {
    soundManager.playMagicChime();
    const link = document.createElement('a');
    link.download = `halloween-carved-pumpkin-${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }
}
