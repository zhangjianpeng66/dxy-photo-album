import * as THREE from 'three';
import { LAYOUT_COUNT } from './cards.js';

export function setupInteractions(renderer, camera, cards, getState, setState) {
  let pointers = new Map();
  let lastPinchDist = 0;
  let cStart = { x: 0, y: 0 };

  function getPinchDist() {
    const pts = [...pointers.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  }

  function getMidpoint() {
    const pts = [...pointers.values()];
    return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
  }

  renderer.domElement.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      cStart = { x: e.clientX, y: e.clientY };
      document.body.classList.add('dragging');
    }
    if (pointers.size === 2) {
      lastPinchDist = getPinchDist();
    }
    e.preventDefault();
  });

  window.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const s = getState();
    if (pointers.size === 1) {
      // Single finger: rotate
      const p0 = [...pointers.values()][0];
      const dx = e.clientX - cStart.x;
      const dy = e.clientY - cStart.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        s.targetRotY = s.targetRotY + (e.clientX - p0.x) * 0.004;
        s.targetRotX = s.targetRotX + (e.clientY - p0.y) * 0.003;
        s.targetRotX = Math.max(-1.2, Math.min(1.2, s.targetRotX));
        setState(s);
        // Update pointer reference
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
    } else if (pointers.size === 2) {
      // Two fingers: pinch zoom + vertical swipe for layout
      const dist = getPinchDist();
      if (lastPinchDist > 0 && Math.abs(dist - lastPinchDist) > 5) {
        s.targetZoom += (dist - lastPinchDist) * -0.02;
        s.targetZoom = Math.max(4, Math.min(16, s.targetZoom));
        setState(s);
      }
      // Vertical swipe for layout change
      const mid = getMidpoint();
      const dy2 = mid.y - cStart.y;
      if (Math.abs(dy2) > 60) {
        s.targetLayout = ((s.targetLayout + (dy2 > 0 ? -1 : 1)) % LAYOUT_COUNT + LAYOUT_COUNT) % LAYOUT_COUNT;
        s.layoutT = 0;
        cStart = mid;
        setState(s);
      }
      lastPinchDist = dist;
    }
  });

  window.addEventListener('pointerup', e => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      document.body.classList.remove('dragging');
    }
    if (pointers.size === 1) {
      // Reset single-finger reference
      const p0 = [...pointers.values()][0];
      cStart = { x: p0.x, y: p0.y };
    }
  });
  window.addEventListener('pointercancel', e => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) document.body.classList.remove('dragging');
  });

  // Desktop wheel
  renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault();
    const s = getState();
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      s.targetLayout = ((s.targetLayout + (e.deltaY > 0 ? 1 : -1)) % LAYOUT_COUNT + LAYOUT_COUNT) % LAYOUT_COUNT;
      s.layoutT = 0;
    } else {
      s.targetZoom += e.deltaX * 0.01;
      s.targetZoom = Math.max(4, Math.min(16, s.targetZoom));
    }
    setState(s);
  }, { passive: false });

  return {
    get cStart() {
      if (pointers.size === 1) {
        const p = [...pointers.values()][0];
        return { x: p.x, y: p.y };
      }
      return cStart;
    }
  };
}

export function setupZoom(renderer, camera, cards, zoomOverlay, zoomCardEl, zoomBack, cStartRef) {
  const raycaster = new THREE.Raycaster();
  const cMouse = new THREE.Vector2();
  let zoomed = null;

  function showZoom(info) {
    // Use original photo + text overlay in HTML/CSS (same layout as 3D card)
    const isMobile = window.innerWidth < 768;
    zoomCardEl.innerHTML = `
      <div style="width:100%;aspect-ratio:${isMobile?'auto':'16/10'};border-radius:14px;overflow:hidden;position:relative;display:flex;flex-direction:${isMobile?'column':'row'};background:rgba(10,2,18,0.98);border:1px solid rgba(255,28,174,0.4);box-shadow:0 0 60px rgba(255,28,174,0.2);${isMobile?'max-height:80vh;':''}">
        <div style="${isMobile?'height:55%;':'width:50%;'}position:relative;overflow:hidden;flex-shrink:0;">
          <img src="${info.image}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none'" />
        </div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:${isMobile?'18px 16px':'32px 28px 32px 20px'};">
          <div style="font-family:Georgia,serif;font-style:italic;color:#d090a0;font-size:${isMobile?'15px':'18px'};letter-spacing:2px;margin-bottom:2px;">${info.title_en}</div>
          <div style="color:#f5d5e0;font-size:${isMobile?'26px':'38px'};font-weight:300;letter-spacing:${isMobile?'6px':'10px'};margin-bottom:12px;">${info.title_cn.split('').join(' ')}</div>
          <div style="width:24px;height:1px;background:rgba(255,28,174,0.5);margin-bottom:12px;"></div>
          <div style="color:#b08090;font-size:${isMobile?'12px':'14px'};line-height:1.6;">${info.text}</div>
        </div>
      </div>`;
    zoomOverlay.classList.add('active');
  }

  function hideZoom() { zoomOverlay.classList.remove('active'); zoomed = null; }

  renderer.domElement.addEventListener('click', e => {
    if (!cStartRef) return;
    const cs = cStartRef();
    if (Math.abs(e.clientX - cs.x) > 4 || Math.abs(e.clientY - cs.y) > 4) return;
    cMouse.x = (e.clientX / innerWidth) * 2 - 1;
    cMouse.y = -(e.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(cMouse, camera);
    const hits = raycaster.intersectObjects(cards);
    if (hits.length > 0) {
      zoomed = hits[0].object;
      showZoom(zoomed.userData.info);
    } else {
      hideZoom();
    }
  });

  zoomBack.addEventListener('click', hideZoom);
  zoomOverlay.addEventListener('click', e => { if (e.target === zoomOverlay) hideZoom(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') hideZoom(); });

  return { hideZoom };
}
