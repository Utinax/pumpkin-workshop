import * as THREE from 'three';

/**
 * Creates high-detail procedural pumpkin geometry with organic ribs,
 * top stem cavity, and flattened resting base.
 */
export function createPumpkinGeometry(options = {}) {
  const {
    radius = 1.25,
    heightScale = 0.88,
    ribCount = 10,
    ribDepth = 0.14,
    radialSegments = 96,
    heightSegments = 64,
    scaleFactor = 1.0 // used for inner hollow shell
  } = options;

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Generate grid of vertices
  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const theta = v * Math.PI; // 0 (top pole) to PI (bottom pole)
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments;
      // Offset phi so u=0.5 corresponds to the front facing the default camera (+Z)
      const phi = u * Math.PI * 2 + Math.PI;

      // Base radius with rib modulation
      // Rib depth smoothly tapers to 0 near top & bottom poles to prevent pinch artifacts
      const poleFade = Math.sin(theta);
      const ribModulation = (Math.cos(ribCount * phi) * ribDepth - Math.cos(ribCount * 2 * phi) * (ribDepth * 0.25)) * Math.pow(poleFade, 0.7);

      // Subtle organic variation
      const organicNoise = (Math.sin(phi * 3.0 + theta * 2.0) * 0.03 + Math.cos(phi * 2.0) * 0.02) * poleFade;

      const r = (1.0 + ribModulation + organicNoise) * radius * scaleFactor;

      let posX = r * sinTheta * Math.sin(phi);
      let posZ = r * sinTheta * Math.cos(phi);
      let posY = cosTheta * radius * heightScale * scaleFactor;

      // Top dimple (where the stem grows)
      if (v < 0.22) {
        const topFactor = (0.22 - v) / 0.22;
        posY -= Math.pow(topFactor, 2.0) * 0.35 * radius * scaleFactor;
        posX *= (1.0 - topFactor * 0.35);
        posZ *= (1.0 - topFactor * 0.35);
      }

      // Bottom dimple (resting base)
      if (v > 0.78) {
        const botFactor = (v - 0.78) / 0.22;
        posY += Math.pow(botFactor, 2.0) * 0.22 * radius * scaleFactor;
        posX *= (1.0 - botFactor * 0.25);
        posZ *= (1.0 - botFactor * 0.25);
      }

      vertices.push(posX, posY, posZ);
      uvs.push(u, 1.0 - v);
    }
  }

  // Generate faces with correct counter-clockwise winding pointing outward
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x;
      const b = (y + 1) * (radialSegments + 1) + x;
      const c = (y + 1) * (radialSegments + 1) + (x + 1);
      const d = y * (radialSegments + 1) + (x + 1);

      // Wound so outward normal faces outward
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Creates realistic curved woody pumpkin stem
 */
export function createStemGeometry() {
  const points = [];
  const segments = 24;
  
  // Arching stem curve
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = 0.75 + t * 0.55;
    const x = Math.sin(t * 1.5) * 0.16 + (Math.pow(t, 2) * 0.08);
    const z = Math.cos(t * 1.2) * 0.08 - (t * 0.12);
    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const baseTube = new THREE.TubeGeometry(curve, 28, 0.11, 8, false);

  // Deform tube vertices to give a 5-rib star fluted wood texture and taper at tip
  const pos = baseTube.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const progress = Math.min(1.0, Math.max(0.0, (y - 0.75) / 0.55));
    
    // Taper
    const taper = 1.35 - progress * 0.55;
    
    // 5-sided fluting
    const angle = Math.atan2(pos.getZ(i), pos.getX(i));
    const flute = 1.0 + Math.cos(angle * 5.0) * 0.22;

    pos.setX(i, pos.getX(i) * taper * flute);
    pos.setZ(i, pos.getZ(i) * taper * flute);
  }

  baseTube.computeVertexNormals();
  return baseTube;
}
