import * as THREE from 'three';
import { createStars } from './stars.js';
import { createParticles, updateParticles } from './particles.js';
import { createCards, LAYOUT_NAMES } from './cards.js';
import { setupInteractions, setupZoom } from './interactions.js';

async function loadConfig() {
  const resp = await fetch('/config.json');
  return resp.json();
}

async function init() {
  const config = await loadConfig();

  // Scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#030010', 0.0002);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 60);
  camera.position.set(0, 0.3, 9);

  const container = document.getElementById('three-container');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  container.appendChild(renderer.domElement);

  // Stars
  const stars = createStars(scene);

  // Particles
  const { container: pContainer, particles } = createParticles(scene);

  // Preload all images before creating cards
  const imageLoadPromises = config.cards.map(c => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ path: c.image, img });
      img.onerror = () => resolve({ path: c.image, img: null });
      img.src = c.image;
    });
  });
  const loadedImages = await Promise.all(imageLoadPromises);
  const imageMap = {};
  loadedImages.forEach(({ path, img }) => { imageMap[path] = img; });

  // Cards — map config format to internal format, attach loaded images
  const cardInfos = config.cards.map(c => ({
    title_cn: c.title_cn,
    title_en: c.title_en,
    text: c.text,
    image: c.image,
    color: c.color,
    emoji: '📷',
    loadedImg: imageMap[c.image] || null
  }));
  const { cardGroup, cards, layoutTargets } = createCards(scene, cardInfos);

  // State
  let curLayout = 0;
  const state = {
    targetLayout: 0, layoutT: 1,
    targetRotY: 0, targetRotX: 0.3, curRotY: 0, curRotX: 0.3,
    targetZoom: 9, curZoom: 9
  };
  function getState() { return state; }
  function setState(s) { Object.assign(state, s); }

  // Interactions
  const interactions = setupInteractions(renderer, camera, cards, getState, setState);
  const zoomOverlay = document.getElementById('zoom-overlay');
  const zoomCardEl = document.getElementById('zoom-card');
  const zoomBack = document.getElementById('zoom-back');
  setupZoom(renderer, camera, cards, zoomOverlay, zoomCardEl, zoomBack,
    () => ({ x: interactions.cStart.x, y: interactions.cStart.y }));

  // Hint fade
  setTimeout(() => { const h = document.getElementById('hint'); if (h) h.style.opacity = '0'; }, 5000);

  // Layout label
  const layoutLabel = document.getElementById('layout-label');

  // ── Animation loop ──
  const clock = new THREE.Clock();
  function animate(ts) {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.12);
    const t = ts * 0.001;

    // Camera
    const s = state;
    s.curRotY += (s.targetRotY - s.curRotY) * 3 * dt;
    s.curRotX += (s.targetRotX - s.curRotX) * 3 * dt;
    s.curZoom += (s.targetZoom - s.curZoom) * 2.5 * dt;
    const cx = Math.sin(s.curRotY) * Math.cos(s.curRotX) * s.curZoom;
    const cy = Math.sin(s.curRotX) * s.curZoom;
    const cz = Math.cos(s.curRotY) * Math.cos(s.curRotX) * s.curZoom;
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), 3 * dt);
    camera.lookAt(0, 0, 0);

    stars.rotation.y += 0.015 * dt;
    stars.rotation.x += 0.004 * dt;

    // Particles
    updateParticles(pContainer, particles, camera, dt);

    // Layout transition
    s.layoutT = Math.min(1, s.layoutT + 1.5 * dt);
    const from = layoutTargets[curLayout];
    const to = layoutTargets[s.targetLayout];
    const lrp = s.layoutT;

    cards.forEach((card, i) => {
      const f = from[i] || from[0];
      const tt = to[i] || to[0];
      card.position.set(
        f.x + (tt.x - f.x) * lrp,
        f.y + (tt.y - f.y) * lrp,
        f.z + (tt.z - f.z) * lrp
      );
      card.lookAt(camera.position);
      const ud = card.userData;
      ud.floatO += 0.4 * dt;
      card.position.y += Math.sin(t * 1.2 + ud.floatO) * 0.04;
    });

    if (s.layoutT >= 1 && s.targetLayout !== curLayout) {
      curLayout = s.targetLayout;
      s.layoutT = 0;
    }

    layoutLabel.textContent = LAYOUT_NAMES[curLayout];
    layoutLabel.style.opacity = s.layoutT < 0.5 ? '0.4' : '0';

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

init();
