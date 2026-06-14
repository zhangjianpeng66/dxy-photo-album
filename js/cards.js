import * as THREE from 'three';

export const LAYOUT_NAMES = [
  '扇形展牌','圆形环绕','正弦波浪','爱心排列','螺旋银河',
  '菱阵','飘带','星散布','错落立柱',
  'V形展翅','双环','瀑布流','螺旋塔','银河漩涡','孔雀开屏'
];
export const LAYOUT_COUNT = LAYOUT_NAMES.length;

export function getLayout(layoutType, total) {
  const pos = []; const mid = (total - 1) / 2;
  const hash = (i, s) => { let h = 0; for (let c of String(i + s)) h = ((h << 5) - h) + c.charCodeAt(0) & 0x7fffffff; return h / 0x7fffffff; };

  switch (layoutType) {
    case 0: { const R = 5, sp = Math.PI * 0.7; for (let i = 0; i < total; i++) { const a = -sp / 2 + (i / mid) * sp / 2; pos.push({ x: Math.sin(a) * R, y: (i - mid) * 0.25, z: Math.cos(a) * R - 1.5 }); } } break;
    case 1: { const R = 4.2; for (let i = 0; i < total; i++) { const a = (i / total) * Math.PI * 2; pos.push({ x: Math.cos(a) * R, y: 0, z: Math.sin(a) * R }); } } break;
    case 2: for (let i = 0; i < total; i++) pos.push({ x: (i - mid) * 1.4, y: Math.sin(i * 1.1) * 1.8, z: Math.cos(i * 0.7) * 1.2 }); break;
    case 3: for (let i = 0; i < total; i++) { const t = (i / total) * Math.PI * 2, hx = 16 * Math.pow(Math.sin(t), 3), hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); pos.push({ x: hx * 0.2, y: hy * 0.2 - 0.5, z: (hash(i, 99) - 0.5) * 0.4 }); } break;
    case 4: for (let i = 0; i < total; i++) { const a = (i / total) * Math.PI * 4.5, r = 0.5 + (i / total) * 4.5; pos.push({ x: Math.cos(a) * r, y: (i - mid) * 0.35, z: Math.sin(a) * r }); } break;
    case 5: { const c = 3, rows = Math.ceil(total / c); for (let i = 0; i < total; i++) { const col = i % c, row = Math.floor(i / c); pos.push({ x: (col - (c - 1) / 2) * 2.4, y: (row - (rows - 1) / 2) * 1.8, z: Math.abs(col - (c - 1) / 2) * 0.6 }); } } break;
    case 6: for (let i = 0; i < total; i++) { const t2 = (i / total) * Math.PI * 1.6 - Math.PI * 0.8; pos.push({ x: Math.sin(t2) * 3.5, y: (i - mid) * 0.55, z: Math.cos(t2 * 0.6) * 2.5 - 1 }); } break;
    case 7: for (let i = 0; i < total; i++) pos.push({ x: (hash(i, 3) - 0.5) * 5.5, y: (hash(i, 7) - 0.5) * 4, z: (hash(i, 11) - 0.5) * 3.5 }); break;
    case 8: { const sc = 4; for (let i = 0; i < total; i++) { const col = i % sc, r2 = Math.floor(i / sc); pos.push({ x: (col - (sc - 1) / 2) * 2.2, y: (r2 - (total / sc - 1) / 2) * 1.4 + (col % 2 ? 0.7 : 0), z: col * 0.35 }); } } break;
    case 9: // V formation
      for (let i = 0; i < total; i++) { const side = i < total / 2 ? -1 : 1; const idx = i < total / 2 ? i : i - Math.floor(total / 2); pos.push({ x: side * idx * 1.2 + (i < total / 2 ? -0.6 : 0.6), y: Math.abs(idx - (total / 2 - 1) / 2) * 0.5, z: side * 1.5 + (idx % 2) * 0.4 }); } break;
    case 10: // Double ring
      for (let i = 0; i < total; i++) { const inner = i < total / 2; const R = inner ? 2.5 : 4.5; const a = (i / (inner ? Math.floor(total / 2) : Math.ceil(total / 2))) * Math.PI * 2 + (inner ? 0.3 : 0); pos.push({ x: Math.cos(a) * R, y: (inner ? 0.6 : -0.3), z: Math.sin(a) * R }); } break;
    case 11: // Waterfall cascade
      for (let i = 0; i < total; i++) pos.push({ x: (i - mid) * 0.7 + Math.sin(i * 1.3) * 0.8, y: (total - i) * 0.45 - 3, z: Math.cos(i * 0.6) * 1.5 }); break;
    case 12: // Spiral tower
      for (let i = 0; i < total; i++) { const a = (i / total) * Math.PI * 6; const R = 1.2 + i * 0.25; pos.push({ x: Math.cos(a) * R, y: (i - mid) * 0.5, z: Math.sin(a) * R }); } break;
    case 13: // Galaxy swirl
      for (let i = 0; i < total; i++) { const a = i * 0.9; const R = 1 + i * 0.35; pos.push({ x: Math.cos(a) * R, y: Math.sin(a * 2) * 0.7, z: Math.sin(a) * R * 0.6 }); } break;
    case 14: // Peacock fan
      for (let i = 0; i < total; i++) { const a = -Math.PI * 0.35 + (i / (total - 1)) * Math.PI * 0.7; const R = 2 + Math.abs(i - mid) * 0.5; pos.push({ x: Math.sin(a) * R, y: (i - mid) * 0.3, z: Math.cos(a) * R - 1 }); } break;
    default: for (let i = 0; i < total; i++) pos.push({ x: (i - mid) * 1.5, y: 0, z: 0 });
  }
  return pos;
}

export function createCardTex(d) {
  const w = 640, h = 400, c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, w, 0);
  bg.addColorStop(0, 'rgba(12,2,20,0.98)'); bg.addColorStop(0.5, 'rgba(15,4,24,0.98)'); bg.addColorStop(1, 'rgba(12,2,20,0.98)');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(255,28,174,0.28)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(1, 1, w - 2, h - 2, 16); ctx.stroke();

  const M = 38, phL = M, phR = w / 2 - M, phT = M, phB = h - M;

  // Draw preloaded image — fills photo area, no color overlay
  if (d.loadedImg) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(phL, phT, phR - phL, phB - phT, 8); ctx.clip();
    ctx.drawImage(d.loadedImg, phL, phT, phR - phL, phB - phT);
    ctx.restore();
    // Subtle vignette on top (dark edges, not color tint)
    const vignette = ctx.createRadialGradient((phL+phR)/2, (phT+phB)/2, (phR-phL)*0.3, (phL+phR)/2, (phT+phB)/2, (phR-phL)*0.75);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(2,0,8,0.65)');
    ctx.fillStyle = vignette; ctx.beginPath(); ctx.roundRect(phL, phT, phR - phL, phB - phT, 8); ctx.fill();
  } else {
    // No image — show dark placeholder
    const pg = ctx.createLinearGradient(0, phT, 0, phB);
    pg.addColorStop(0, d.color); pg.addColorStop(0.5, 'rgba(30,15,25,1)'); pg.addColorStop(1, 'rgba(18,8,22,1)');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(phL, phT, phR - phL, phB - phT, 8); ctx.fill();
    ctx.font = `${(phB - phT) * 0.45}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.emoji || '📷', (phL + phR) / 2, (phT + phB) / 2);
  }

  const tx = w / 2, ty = h / 2;
  ctx.font = 'italic 21px Georgia,serif'; ctx.fillStyle = '#d090a0'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.title_en, tx, ty - 34);
  ctx.font = '300 40px "Noto Serif SC",Georgia,serif'; ctx.fillStyle = '#f5d5e0';
  ctx.fillText(d.title_cn.split('').join('  '), tx, ty + 12);
  ctx.strokeStyle = 'rgba(255,28,174,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, ty + 26); ctx.lineTo(tx + 26, ty + 26); ctx.stroke();
  ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = '#b08090';
  d.text.split('\n').forEach((l, i) => ctx.fillText(l, tx, ty + 52 + i * 19));

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
  return tex;
}

export function createCards(scene, cardInfos) {
  const cardGroup = new THREE.Group();
  scene.add(cardGroup);
  const cards = [];

  cardInfos.forEach((d, i) => {
    const tex = createCardTex(d);
    const isMobile = window.innerWidth < 768;
    const cardW = isMobile ? 2.0 : 3.2;
    const cardH = cardW / 1.6; // 16:10
    const geo = new THREE.PlaneGeometry(cardW, cardH);
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: 0xcccccc, transparent: true, side: THREE.DoubleSide, depthTest: true, depthWrite: true });
    const card = new THREE.Mesh(geo, mat);
    card.userData = { index: i, total: cardInfos.length, info: d, floatO: Math.random() * Math.PI * 2 };
    card.renderOrder = i;
    cardGroup.add(card);
    cards.push(card);
  });

  const layoutTargets = [];
  for (let lt = 0; lt < LAYOUT_COUNT; lt++) layoutTargets.push(getLayout(lt, cards.length));

  return { cardGroup, cards, layoutTargets };
}
