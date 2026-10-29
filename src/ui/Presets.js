/**
 * Preset carved faces that can be instantly painted onto the pumpkin carving canvas
 */
import { STENCILS } from './Stencils.js';

export const PUMPKIN_PRESETS = [
  {
    id: 'empty',
    name: 'Clean Pumpkin (Reset)',
    description: 'A fresh blank pumpkin to carve your own design from scratch.',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
  },
  {
    id: 'classic_jack',
    name: 'Classic Jack-o\'-Lantern',
    description: 'The timeless, legendary Halloween grin.',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      ctx.fillStyle = '#000000';
      // Triangle eyes & nose
      STENCILS.triangle_eyes.draw(ctx, cx, cy - height * 0.11, 240);
      // Wicked jagged smile
      STENCILS.wicked_smile.draw(ctx, cx, cy + height * 0.09, 260);
    }
  },
  {
    id: 'vampire',
    name: 'Dark Vampire Count',
    description: 'Razor-sharp fangs and demonic glowing stare.',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      ctx.fillStyle = '#000000';

      // Left eye
      ctx.beginPath();
      ctx.moveTo(cx - 240, cy - 120);
      ctx.quadraticCurveTo(cx - 150, cy - 190, cx - 60, cy - 100);
      ctx.quadraticCurveTo(cx - 150, cy - 60, cx - 240, cy - 120);
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.moveTo(cx + 240, cy - 120);
      ctx.quadraticCurveTo(cx + 150, cy - 190, cx + 60, cy - 100);
      ctx.quadraticCurveTo(cx + 150, cy - 60, cx + 240, cy - 120);
      ctx.fill();

      // Sharp inverted triangle nose
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy - 40);
      ctx.lineTo(cx + 35, cy - 40);
      ctx.lineTo(cx, cy + 20);
      ctx.closePath();
      ctx.fill();

      // Vampire mouth with prominent fangs
      ctx.beginPath();
      ctx.moveTo(cx - 260, cy + 80);
      ctx.quadraticCurveTo(cx, cy + 50, cx + 260, cy + 80);
      // Right fang
      ctx.lineTo(cx + 130, cy + 80);
      ctx.lineTo(cx + 110, cy + 190); // deep fang tip
      ctx.lineTo(cx + 85, cy + 90);
      // Left fang
      ctx.lineTo(cx - 85, cy + 90);
      ctx.lineTo(cx - 110, cy + 190); // deep fang tip
      ctx.lineTo(cx - 130, cy + 80);
      ctx.lineTo(cx - 260, cy + 80);
      // Bottom lip
      ctx.quadraticCurveTo(cx, cy + 220, cx + 260, cy + 80);
      ctx.fill();
    }
  },
  {
    id: 'ghost_scream',
    name: 'Screaming Ghost',
    description: 'An ectoplasmic spirit wailing in the dark.',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      ctx.fillStyle = '#000000';

      // Screaming ghost face
      // Hollow elongated eyes
      ctx.beginPath();
      ctx.ellipse(cx - 160, cy - 120, 65, 140, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cx + 160, cy - 120, 65, 140, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Little nose holes
      ctx.beginPath();
      ctx.ellipse(cx - 22, cy + 30, 12, 28, -0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + 22, cy + 30, 12, 28, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Huge screaming mouth
      ctx.beginPath();
      ctx.ellipse(cx, cy + 220, 105, 190, 0, 0, Math.PI * 2);
      ctx.fill();

      // Little bats on sides
      STENCILS.bat.draw(ctx, cx - 600, cy - 180, 220);
      STENCILS.bat.draw(ctx, cx + 600, cy - 160, 240);
    }
  },
  {
    id: 'spooky_cat',
    name: 'Witch\'s Black Cat',
    description: 'Mysterious feline howling under the crescent moon.',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      ctx.fillStyle = '#000000';
      // Crescent Moon in background
      STENCILS.crescent_moon.draw(ctx, cx + 100, cy - 90, 240);

      // Black Cat silhouette
      STENCILS.cat.draw(ctx, cx - 60, cy + 50, 170);

      // Little stars
      for (const pos of [[cx - 220, cy - 120], [cx - 150, cy + 120], [cx + 250, cy + 60]]) {
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  {
    id: 'skull_crossbones',
    name: 'Pirate Skull',
    description: 'The cursed sigil of fearless buccaneers.',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      ctx.fillStyle = '#000000';
      STENCILS.skull.draw(ctx, cx, cy, 320);
    }
  },
  {
    id: 'sinister_grin',
    name: 'Sinister Devil Smile',
    description: 'Menacing horned eyes and a chilling ear-to-ear grin.',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      ctx.fillStyle = '#000000';

      // Angled menacing eyes
      ctx.beginPath();
      ctx.moveTo(cx - 220, cy - 140);
      ctx.lineTo(cx - 60, cy - 80);
      ctx.lineTo(cx - 160, cy - 50);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 220, cy - 140);
      ctx.lineTo(cx + 60, cy - 80);
      ctx.lineTo(cx + 160, cy - 50);
      ctx.closePath();
      ctx.fill();

      // Slit nostrils
      ctx.beginPath();
      ctx.ellipse(cx - 20, cy + 10, 10, 24, -0.3, 0, Math.PI * 2);
      ctx.ellipse(cx + 20, cy + 10, 10, 24, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Giant jagged grin with 10 teeth
      ctx.beginPath();
      ctx.moveTo(cx - 300, cy + 70);
      ctx.quadraticCurveTo(cx, cy + 40, cx + 300, cy + 70);
      ctx.quadraticCurveTo(cx, cy + 260, cx - 300, cy + 70);
      ctx.fill();

      // Sharp white teeth gaps
      ctx.fillStyle = '#ffffff';
      for (let i = -4; i <= 4; i++) {
        const tx = cx + i * 55;
        // Upper teeth
        ctx.beginPath();
        ctx.moveTo(tx - 12, cy + 50);
        ctx.lineTo(tx + 12, cy + 50);
        ctx.lineTo(tx, cy + 115);
        ctx.closePath();
        ctx.fill();

        // Lower teeth
        ctx.beginPath();
        ctx.moveTo(tx - 12, cy + 190);
        ctx.lineTo(tx + 12, cy + 190);
        ctx.lineTo(tx, cy + 125);
        ctx.closePath();
        ctx.fill();
      }
    }
  },
  {
    id: 'spider_queen',
    name: 'Spider Queen',
    description: 'A giant arachnid crawling from within the pumpkin.',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      ctx.fillStyle = '#000000';
      // Spider stencil in center
      STENCILS.spider.draw(ctx, cx, cy, 320);

      // Web accents in corners
      STENCILS.crescent_moon.draw(ctx, cx - 240, cy - 140, 160);
      STENCILS.bat.draw(ctx, cx + 240, cy - 130, 180);
    }
  }
];
