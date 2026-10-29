import * as THREE from 'three';

/**
 * Procedurally generates high-resolution pumpkin outer peel texture with ribs and organic mottling
 */
export function createPumpkinSkinTexture(width = 2048, height = 1024, ribCount = 10) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base gradient: subtle vertical variation
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0.0, '#9a3412'); // darker top
  gradient.addColorStop(0.15, '#c2410c');
  gradient.addColorStop(0.5, '#ea580c'); // vibrant equator
  gradient.addColorStop(0.85, '#c2410c');
  gradient.addColorStop(1.0, '#7c2d12'); // darker bottom
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Rib striations and highlights
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const vFactor = Math.sin(v * Math.PI);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const idx = (y * width + x) * 4;

      // Rib modulation
      const ribAngle = u * Math.PI * 2 * ribCount;
      const ribShade = Math.sin(ribAngle); // -1 to 1

      // Fine organic grain/fiber lines
      const grain = Math.sin(u * width * 0.15) * 0.08 + Math.sin(u * width * 0.4) * 0.04;
      
      // Micro speckles
      const speckle = (Math.random() - 0.5) * 16;

      const delta = (ribShade * 24 + grain * 30 + speckle) * vFactor;

      data[idx] = Math.min(255, Math.max(0, data[idx] + delta * 0.8));       // R
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + delta * 0.5)); // G
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + delta * 0.2)); // B
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedurally generates bump map for pumpkin ridges and skin pores
 */
export function createPumpkinBumpMap(width = 1024, height = 512, ribCount = 10) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const vFactor = Math.sin(v * Math.PI);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const idx = (y * width + x) * 4;

      const ribAngle = u * Math.PI * 2 * ribCount;
      const ribVal = Math.sin(ribAngle) * 0.5 + 0.5; // 0 to 1

      const noise = Math.random() * 0.2;
      const val = Math.floor((ribVal * 0.8 + noise) * vFactor * 255);

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedurally generates inner hollow pumpkin flesh texture (warm yellow-orange stringy pulp)
 */
export function createPumpkinFleshTexture(width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base warm amber pulp
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, width, height);

  // Stringy pumpkin pulp fibers
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
  for (let i = 0; i < 400; i++) {
    ctx.beginPath();
    const startX = Math.random() * width;
    const startY = Math.random() * height;
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + (Math.random() - 0.5) * 60,
      startY + Math.random() * 100,
      startX + (Math.random() - 0.5) * 60,
      startY + Math.random() * 150,
      startX + (Math.random() - 0.5) * 80,
      startY + Math.random() * 200
    );
    ctx.stroke();
  }

  // Soft bright highlights
  for (let i = 0; i < 60; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    const rad = 10 + Math.random() * 25;
    const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
    grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Stem woody texture
 */
export function createStemTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#3f4f24';
  ctx.fillRect(0, 0, width, height);

  // Bark grain
  ctx.lineWidth = 2;
  for (let i = 0; i < 150; i++) {
    const y = Math.random() * height;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(74, 95, 42, 0.6)' : 'rgba(38, 48, 22, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + (Math.random() - 0.5) * 12);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates outer pumpkin material with native alphaMap cutout
 */
export function createOuterPumpkinMaterial(carveTexture) {
  const skinMap = createPumpkinSkinTexture();
  const bumpMap = createPumpkinBumpMap();

  return new THREE.MeshStandardMaterial({
    map: skinMap,
    bumpMap: bumpMap,
    bumpScale: 0.035,
    roughness: 0.45,
    metalness: 0.05,
    alphaMap: carveTexture,
    alphaTest: 0.45,
    side: THREE.DoubleSide
  });
}

/**
 * Creates inner hollow pumpkin material (viewed from inside through cut holes)
 */
export function createInnerPumpkinMaterial() {
  const fleshMap = createPumpkinFleshTexture();

  return new THREE.MeshStandardMaterial({
    map: fleshMap,
    roughness: 0.75,
    metalness: 0.02,
    side: THREE.BackSide // Render interior when looking into cut openings
  });
}

/**
 * Creates stem material
 */
export function createStemMaterial() {
  const stemMap = createStemTexture();
  return new THREE.MeshStandardMaterial({
    map: stemMap,
    roughness: 0.85,
    metalness: 0.02
  });
}
