import * as THREE from 'three';

const HEART_COLORS = ['#FF1CAE', '#CC3299', '#FF1CAE', '#CC3299', '#FF1CAE', '#CC3299'];

function makeHeartTex(color, size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2, s = size * 0.48;

  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.moveTo(0, s * 0.6);
  ctx.bezierCurveTo(s * 0.78, s * 0.15, s * 1.15, -s * 0.08, s * 0.5, -s * 0.58);
  ctx.bezierCurveTo(s * 0.22, -s * 0.88, s * 0.07, -s * 0.22, 0, -s * 0.2);
  ctx.bezierCurveTo(-s * 0.07, -s * 0.22, -s * 0.22, -s * 0.88, -s * 0.5, -s * 0.58);
  ctx.bezierCurveTo(-s * 1.15, -s * 0.08, -s * 0.78, s * 0.15, 0, s * 0.6);

  const grad = ctx.createRadialGradient(0, -s * 0.05, s * 0.06, 0, s * 0.05, s * 1.15);
  grad.addColorStop(0, color);
  grad.addColorStop(0.4, color);
  grad.addColorStop(0.7, color + '80');
  grad.addColorStop(1, 'rgba(255,28,174,0)');
  ctx.fillStyle = grad; ctx.fill();

  ctx.globalAlpha = 0.35; ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = size * 0.009;
  ctx.beginPath(); ctx.moveTo(0, s * 0.55); ctx.quadraticCurveTo(0, -s * 0.05, 0, -s * 0.18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, s * 0.15); ctx.quadraticCurveTo(-s * 0.24, -s * 0.18, -s * 0.4, -s * 0.48); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, s * 0.15); ctx.quadraticCurveTo(s * 0.24, -s * 0.18, s * 0.4, -s * 0.48); ctx.stroke();
  ctx.lineWidth = size * 0.005;
  ctx.beginPath(); ctx.moveTo(-s * 0.16, -s * 0.08); ctx.quadraticCurveTo(-s * 0.34, -s * 0.16, -s * 0.38, -s * 0.3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s * 0.16, -s * 0.08); ctx.quadraticCurveTo(s * 0.34, -s * 0.16, s * 0.38, -s * 0.3); ctx.stroke();
  ctx.globalAlpha = 1; ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export function createParticles(scene) {
  const container = new THREE.Group();
  scene.add(container);
  const particles = [];
  const P_N = 400;

  for (let i = 0; i < P_N; i++) {
    const isBig = i < 100;
    const wSize = isBig ? (0.2 + Math.random() * 0.42) : (0.06 + Math.random() * 0.18);
    const tSize = isBig ? 128 : 64;
    const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    const tex = makeHeartTex(color, tSize);
    const mat = new THREE.SpriteMaterial({
      map: tex, blending: THREE.AdditiveBlending,
      depthWrite: false, transparent: true, opacity: 0
    });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(wSize, wSize, 1);

    sp.userData = {
      isBig,
      S: () => {
        sp.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12, -14 - Math.random() * 10);
        sp.userData.spd = (isBig ? 5.0 : 8.0) + Math.random() * 6.0;
        sp.userData.sA = 0.3 + Math.random() * 0.9;
        sp.userData.sF = 0.6 + Math.random() * 1.3;
        sp.userData.sP = Math.random() * Math.PI * 2;
        sp.userData.bx = sp.position.x;
        sp.userData.by = sp.position.y;
        sp.userData.z0 = sp.position.z;
        sp.userData.z1 = 5 + Math.random() * 3;
      }
    };
    sp.userData.S();
    sp.position.z = sp.userData.z0 + Math.random() * (sp.userData.z1 - sp.userData.z0);
    sp.material.rotation = 0;
    container.add(sp);
    particles.push(sp);
  }

  return { container, particles };
}

export function updateParticles(container, particles, camera, dt) {
  container.position.copy(camera.position);
  container.quaternion.copy(camera.quaternion);

  particles.forEach(p => {
    const ud = p.userData;
    p.position.z += ud.spd * dt;
    ud.sP += ud.sF * dt;
    p.position.x = ud.bx + Math.sin(ud.sP) * ud.sA;
    p.position.y = ud.by + Math.cos(ud.sP * 1.3) * ud.sA * 0.7;
    p.material.rotation = Math.sin(ud.sP * 0.7) * 0.3;

    const rng = ud.z1 - ud.z0;
    const prog = (p.position.z - ud.z0) / rng;
    const bo = ud.isBig ? 0.6 : 0.7;
    if (prog < 0.1) p.material.opacity = (prog / 0.1) * bo;
    else if (prog < 0.6) p.material.opacity = bo;
    else if (prog < 1) p.material.opacity = bo * (1 - (prog - 0.6) / 0.4);
    else ud.S();
  });
}
