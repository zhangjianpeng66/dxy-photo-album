import * as THREE from 'three';

export function createStars(scene) {
  const geo = new THREE.BufferGeometry();
  const N = 900;
  const pos = new Float32Array(N * 3);
  const sz = new Float32Array(N);
  const col = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r = 14 + Math.random() * 28;
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph) - 6;
    sz[i] = Math.random() * 2.8 + 0.3;
    const t = Math.random();
    if (t < 0.08) { col[i * 3] = 1; col[i * 3 + 1] = 0.7; col[i * 3 + 2] = 0.85; }
    else if (t < 0.22) { col[i * 3] = 0.7; col[i * 3 + 1] = 0.75; col[i * 3 + 2] = 1; }
    else { const w = 0.75 + Math.random() * 0.25; col[i * 3] = w; col[i * 3 + 1] = w; col[i * 3 + 2] = w; }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sz, 1));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.12, vertexColors: true, blending: THREE.AdditiveBlending,
    depthWrite: false, transparent: true, opacity: 0.85
  });

  const stars = new THREE.Points(geo, mat);
  scene.add(stars);
  return stars;
}
