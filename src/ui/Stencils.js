/**
 * Vector Stencil path definitions for instant stamping onto the pumpkin
 */
export const STENCILS = {
  triangle_eyes: {
    id: 'triangle_eyes',
    name: 'Triangle Eyes',
    category: 'Face',
    draw: (ctx, x, y, size) => {
      const half = size / 2;
      ctx.beginPath();
      // Left eye
      ctx.moveTo(x - half * 0.8, y - half * 0.4);
      ctx.lineTo(x - half * 0.3, y + half * 0.3);
      ctx.lineTo(x - half * 1.3, y + half * 0.3);
      ctx.closePath();
      // Right eye
      ctx.moveTo(x + half * 0.8, y - half * 0.4);
      ctx.lineTo(x + half * 1.3, y + half * 0.3);
      ctx.lineTo(x + half * 0.3, y + half * 0.3);
      ctx.closePath();
      // Nose
      ctx.moveTo(x, y + half * 0.5);
      ctx.lineTo(x - half * 0.25, y + half * 0.9);
      ctx.lineTo(x + half * 0.25, y + half * 0.9);
      ctx.closePath();
      ctx.fill();
    }
  },

  wicked_smile: {
    id: 'wicked_smile',
    name: 'Wicked Grin',
    category: 'Face',
    draw: (ctx, x, y, size) => {
      const w = size * 1.5;
      const h = size * 0.7;
      ctx.beginPath();
      // Outer arc mouth with jagged teeth
      ctx.moveTo(x - w / 2, y);
      // Top teeth curve
      ctx.quadraticCurveTo(x - w / 4, y + h * 0.2, x, y + h * 0.15);
      ctx.quadraticCurveTo(x + w / 4, y + h * 0.2, x + w / 2, y);
      
      // Bottom jagged teeth
      const teeth = 8;
      for (let i = teeth; i >= 0; i--) {
        const tx = x - w / 2 + (w / teeth) * i;
        const dip = (i % 2 === 0) ? h * 0.95 : h * 0.3;
        const curveOffset = Math.sin((i / teeth) * Math.PI) * (h * 0.6);
        ctx.lineTo(tx, y + curveOffset + (i % 2 === 0 ? dip * 0.5 : 0));
      }
      ctx.closePath();
      ctx.fill();
    }
  },

  bat: {
    id: 'bat',
    name: 'Flying Bat',
    category: 'Figure',
    draw: (ctx, x, y, size) => {
      const s = size * 1.1;
      ctx.beginPath();
      // Bat head
      ctx.moveTo(x, y - s * 0.15);
      ctx.lineTo(x - s * 0.08, y - s * 0.3); // left ear
      ctx.lineTo(x - s * 0.04, y - s * 0.1);
      // Left wing
      ctx.bezierCurveTo(x - s * 0.3, y - s * 0.45, x - s * 0.8, y - s * 0.2, x - s * 1.0, y - s * 0.05);
      ctx.bezierCurveTo(x - s * 0.8, y + s * 0.15, x - s * 0.6, y + s * 0.2, x - s * 0.5, y + s * 0.35);
      ctx.bezierCurveTo(x - s * 0.35, y + s * 0.18, x - s * 0.2, y + s * 0.22, x - s * 0.1, y + s * 0.3);
      // Body bottom
      ctx.lineTo(x, y + s * 0.35);
      // Right wing
      ctx.lineTo(x + s * 0.1, y + s * 0.3);
      ctx.bezierCurveTo(x + s * 0.2, y + s * 0.22, x + s * 0.35, y + s * 0.18, x + s * 0.5, y + s * 0.35);
      ctx.bezierCurveTo(x + s * 0.6, y + s * 0.2, x + s * 0.8, y + s * 0.15, x + s * 1.0, y - s * 0.05);
      ctx.bezierCurveTo(x + s * 0.8, y - s * 0.2, x + s * 0.3, y - s * 0.45, x + s * 0.04, y - s * 0.1);
      ctx.lineTo(x + s * 0.08, y - s * 0.3); // right ear
      ctx.closePath();
      ctx.fill();
    }
  },

  ghost: {
    id: 'ghost',
    name: 'Gliding Ghost',
    category: 'Figure',
    draw: (ctx, x, y, size) => {
      const s = size * 1.0;
      ctx.beginPath();
      // Rounded head
      ctx.arc(x, y - s * 0.3, s * 0.4, Math.PI, 0, false);
      // Right flowing wavy body
      ctx.bezierCurveTo(x + s * 0.5, y + s * 0.1, x + s * 0.45, y + s * 0.4, x + s * 0.35, y + s * 0.7);
      // Ruffled bottom
      ctx.bezierCurveTo(x + s * 0.2, y + s * 0.55, x + s * 0.1, y + s * 0.7, x, y + s * 0.6);
      ctx.bezierCurveTo(x - s * 0.1, y + s * 0.7, x - s * 0.2, y + s * 0.55, x - s * 0.35, y + s * 0.7);
      // Left flowing wavy body
      ctx.bezierCurveTo(x - s * 0.45, y + s * 0.4, x - s * 0.5, y + s * 0.1, x - s * 0.4, y - s * 0.3);
      ctx.closePath();
      ctx.fill();

      // Cutout hollow eyes inside ghost (fill with white skin)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x - s * 0.15, y - s * 0.3, s * 0.08, s * 0.12, 0, 0, Math.PI * 2);
      ctx.ellipse(x + s * 0.15, y - s * 0.3, s * 0.08, s * 0.12, 0, 0, Math.PI * 2);
      // Screaming O mouth
      ctx.ellipse(x, y - s * 0.1, s * 0.07, s * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
    }
  },

  skull: {
    id: 'skull',
    name: 'Pirate Skull',
    category: 'Figure',
    draw: (ctx, x, y, size) => {
      const s = size * 0.9;
      ctx.beginPath();
      // Cranium
      ctx.arc(x, y - s * 0.15, s * 0.45, 0, Math.PI, true);
      // Cheeks & Jaw
      ctx.lineTo(x - s * 0.26, y + s * 0.1);
      ctx.lineTo(x - s * 0.22, y + s * 0.45);
      ctx.lineTo(x + s * 0.22, y + s * 0.45);
      ctx.lineTo(x + s * 0.26, y + s * 0.1);
      ctx.closePath();
      ctx.fill();

      // Eye sockets & nose cutout (fill with white skin)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x - s * 0.16, y - s * 0.1, s * 0.12, s * 0.15, -0.2, 0, Math.PI * 2);
      ctx.ellipse(x + s * 0.16, y - s * 0.1, s * 0.12, s * 0.15, 0.2, 0, Math.PI * 2);
      // Inverted heart nose
      ctx.moveTo(x, y + s * 0.08);
      ctx.lineTo(x - s * 0.06, y + s * 0.18);
      ctx.lineTo(x + s * 0.06, y + s * 0.18);
      ctx.closePath();
      // Teeth slits
      for (let i = -2; i <= 2; i++) {
        ctx.rect(x + i * s * 0.08 - s * 0.015, y + s * 0.3, s * 0.03, s * 0.13);
      }
      ctx.fill();
      ctx.fillStyle = '#000000';
    }
  },

  cat: {
    id: 'cat',
    name: 'Black Cat',
    category: 'Figure',
    draw: (ctx, x, y, size) => {
      const s = size * 0.9;
      ctx.beginPath();
      // Cat Head
      ctx.arc(x, y - s * 0.2, s * 0.3, 0, Math.PI * 2);
      // Ears
      ctx.moveTo(x - s * 0.25, y - s * 0.35);
      ctx.lineTo(x - s * 0.35, y - s * 0.65);
      ctx.lineTo(x - s * 0.08, y - s * 0.45);
      ctx.moveTo(x + s * 0.25, y - s * 0.35);
      ctx.lineTo(x + s * 0.35, y - s * 0.65);
      ctx.lineTo(x + s * 0.08, y - s * 0.45);
      // Body
      ctx.ellipse(x, y + s * 0.25, s * 0.32, s * 0.45, 0, 0, Math.PI * 2);
      // Curled Tail
      ctx.moveTo(x + s * 0.25, y + s * 0.5);
      ctx.bezierCurveTo(x + s * 0.7, y + s * 0.5, x + s * 0.8, y, x + s * 0.55, y - s * 0.1);
      ctx.bezierCurveTo(x + s * 0.65, y, x + s * 0.55, y + s * 0.35, x + s * 0.25, y + s * 0.35);
      ctx.fill();
    }
  },

  crescent_moon: {
    id: 'crescent_moon',
    name: 'Crescent Moon',
    category: 'Symbol',
    draw: (ctx, x, y, size) => {
      const s = size * 0.8;
      ctx.beginPath();
      ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + s * 0.25, y - s * 0.1, s * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
    }
  },

  boo_text: {
    id: 'boo_text',
    name: 'BOO! Lettering',
    category: 'Text',
    draw: (ctx, x, y, size) => {
      ctx.save();
      ctx.font = `900 ${Math.round(size * 0.7)}px "Creepster", "Impact", "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BOO!', x, y);
      ctx.restore();
    }
  }
};
