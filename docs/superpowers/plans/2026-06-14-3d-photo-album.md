# 3D 梦幻相册 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 preview.html 拆分为整洁的多文件项目结构，加入 config.json 配置系统，部署到 Vercel 生成公开链接。

**Architecture:** 纯静态 HTML + JS (ES modules) + Three.js CDN。config.json 驱动卡片内容，用户只编辑这一个文件。Vite 做本地开发预览。

**Tech Stack:** Three.js 0.160 (CDN importmap)、Vite、GitHub + Vercel

---

## 文件结构（目标）

```
3d-photo-album/
├── index.html          # 入口，引入所有模块
├── style.css           # 标题动画 + zoom overlay 样式
├── config.json         # 用户唯一编辑的文件
├── photos/             # 用户照片目录
│   └── .gitkeep
├── js/
│   ├── main.js         # 场景初始化，启动循环
│   ├── stars.js        # 星空背景
│   ├── particles.js    # 爱心粒子系统
│   ├── cards.js        # 卡片纹理 + 3D 卡片 + 阵型
│   └── interactions.js # 拖拽/滚轮/点击/zoom
└── package.json        # 仅含 Vite 依赖
```

---

### Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `index.html`（骨架）
- Create: `style.css`
- Create: `config.json`
- Create: `photos/.gitkeep`
- Create: `js/main.js`
- Create: `js/stars.js`
- Create: `js/particles.js`
- Create: `js/cards.js`
- Create: `js/interactions.js`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "dxy-photo-album",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: 创建 config.json（用户唯一编辑的文件）**

```json
{
  "title": "dxy",
  "subtitle": "forever lovers  jun zi hao qiu",
  "cards": [
    {
      "title_cn": "海边",
      "title_en": "Seaside",
      "text": "那天的风很温柔",
      "image": "photos/photo1.jpg",
      "color": "#4a3040"
    },
    {
      "title_cn": "登山",
      "title_en": "Hiking",
      "text": "和你走过的每一步",
      "image": "photos/photo2.jpg",
      "color": "#3a3530"
    },
    {
      "title_cn": "星空",
      "title_en": "Starry Night",
      "text": "你比星星更耀眼",
      "image": "photos/photo3.jpg",
      "color": "#303050"
    },
    {
      "title_cn": "初见",
      "title_en": "First Sight",
      "text": "那天阳光正好",
      "image": "photos/photo4.jpg",
      "color": "#403540"
    },
    {
      "title_cn": "约定",
      "title_en": "Promise",
      "text": "说好了一起走很远",
      "image": "photos/photo5.jpg",
      "color": "#403040"
    },
    {
      "title_cn": "花火",
      "title_en": "Fireworks",
      "text": "你笑的样子像夏天",
      "image": "photos/photo6.jpg",
      "color": "#3a2835"
    },
    {
      "title_cn": "旅途",
      "title_en": "Journey",
      "text": "风景再美不如你",
      "image": "photos/photo7.jpg",
      "color": "#353040"
    },
    {
      "title_cn": "晚安",
      "title_en": "Good Night",
      "text": "梦里也要见到你",
      "image": "photos/photo8.jpg",
      "color": "#283040"
    }
  ]
}
```

- [ ] **Step 3: 创建 photos/.gitkeep**

```bash
echo "" > photos/.gitkeep
```

- [ ] **Step 4: 创建 index.html 骨架（完整 HTML 见下方）**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>dxy · 梦幻相册</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div id="title-overlay">
    <div id="main-title">dxy</div>
    <div id="title-line"></div>
    <div id="sub-title">forever lovers &nbsp; jun zi hao qiu</div>
  </div>
  <div id="hint">拖拽旋转 · 滚轮切换阵型 · 单击卡片放大</div>
  <div id="layout-label"></div>
  <div id="zoom-overlay">
    <div id="zoom-card"></div>
    <button id="zoom-back">Click to go back</button>
  </div>
  <div id="three-container"></div>
  <script type="importmap">
    { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
  </script>
  <script type="module" src="/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: project scaffold with config and file structure"
```

---

### Task 2: style.css — 标题动画 + Zoom 遮罩

**Files:**
- Create: `style.css`

从 preview.html 的 `<style>` 中提取所有 CSS，放到 style.css。

- [ ] **Step 1: 写入 style.css**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #030010; overflow: hidden;
  font-family: 'Georgia', 'Noto Serif SC', serif; cursor: grab;
}
body.dragging { cursor: grabbing; }
#three-container { position: fixed; inset: 0; }
#three-container canvas { display: block; }

/* Title — pure CSS keyframes, only transform animates */
#title-overlay {
  position: fixed; z-index: 10; pointer-events: none;
  display: flex; flex-direction: column; align-items: center;
  top: 14px; left: 16px;
  animation: flyToCorner 3.5s cubic-bezier(0.22,0.05,0.1,0.97) 1s forwards;
}
@keyframes flyToCorner {
  from { transform: translate(calc(50vw - 16px), calc(50vh - 14px)); align-items: center; }
  to   { transform: translate(0, 0); align-items: flex-start; }
}

#main-title {
  color: #fff; font-size: 32px; font-weight: 200; letter-spacing: 16px;
  text-shadow: 0 0 40px rgba(255,28,174,0.4), 0 0 80px rgba(255,28,174,0.15);
  animation: sh1 3.5s cubic-bezier(0.22,0.05,0.1,0.97) 1s forwards;
}
@keyframes sh1 {
  from { font-size: 32px; letter-spacing: 16px; text-shadow: 0 0 40px rgba(255,28,174,0.4), 0 0 80px rgba(255,28,174,0.15); }
  to   { font-size: 16px; letter-spacing: 5px; text-shadow: 0 0 10px rgba(255,28,174,0.2); }
}

#sub-title {
  color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 5px; margin-top: 8px;
  font-family: system-ui, sans-serif;
  animation: sh2 3.5s cubic-bezier(0.22,0.05,0.1,0.97) 1s forwards;
}
@keyframes sh2 {
  from { font-size: 12px; letter-spacing: 5px; margin-top: 8px; color: rgba(255,255,255,0.5); }
  to   { font-size: 8px; letter-spacing: 2px; margin-top: 3px; color: rgba(255,255,255,0.35); }
}

#title-line {
  width: 60px; height: 1px; background: rgba(255,28,174,0.5); margin: 10px 0;
  animation: sh3 3.5s cubic-bezier(0.22,0.05,0.1,0.97) 1s forwards;
}
@keyframes sh3 {
  from { width: 60px; margin: 10px 0; background: rgba(255,28,174,0.5); }
  to   { width: 20px; margin: 6px 0; background: rgba(255,28,174,0.3); }
}

/* Hint & layout label */
#hint {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,0.25); font-size: 11px; letter-spacing: 2px;
  font-family: system-ui, sans-serif; pointer-events: none; transition: opacity 1s;
}
#layout-label {
  position: fixed; top: 20px; right: 20px; z-index: 5; pointer-events: none;
  color: rgba(255,28,174,0.5); font-size: 12px; letter-spacing: 2px;
  font-family: system-ui, sans-serif; transition: opacity 0.5s;
}

/* Zoom overlay */
#zoom-overlay {
  position: fixed; inset: 0; z-index: 100; display: none;
  background: rgba(3,0,16,0.92); backdrop-filter: blur(8px);
  justify-content: center; align-items: center; flex-direction: column;
}
#zoom-overlay.active { display: flex; }
#zoom-card {
  width: min(72vw, 720px); border-radius: 14px; overflow: hidden;
  border: 1px solid rgba(255,28,174,0.4);
  box-shadow: 0 0 60px rgba(255,28,174,0.2), 0 20px 60px rgba(0,0,0,0.5);
}
#zoom-back {
  margin-top: 20px; padding: 10px 32px; background: rgba(255,28,174,0.15);
  border: 1px solid rgba(255,28,174,0.4); color: #f0c0d0; font-size: 13px;
  letter-spacing: 2px; border-radius: 24px; cursor: pointer; font-family: system-ui, sans-serif;
  transition: all 0.3s;
}
#zoom-back:hover { background: rgba(255,28,174,0.25); border-color: rgba(255,28,174,0.7); }
```

- [ ] **Step 2: 提交**

```bash
git add style.css
git commit -m "feat: extract CSS — title animation, zoom overlay, hints"
```

---

### Task 3: stars.js — 星空背景模块

**Files:**
- Create: `js/stars.js`

从 preview.html 提取星空相关代码，封装为 `export function createStars(scene)`。

- [ ] **Step 1: 写入 js/stars.js**

```js
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
    size: 0.06, vertexColors: true, blending: THREE.AdditiveBlending,
    depthWrite: false, transparent: true, opacity: 0.85
  });

  const stars = new THREE.Points(geo, mat);
  scene.add(stars);
  return stars;
}
```

- [ ] **Step 2: 提交**

```bash
git add js/stars.js
git commit -m "feat: extract stars module — 900-star field with color variants"
```

---

### Task 4: particles.js — 爱心粒子系统

**Files:**
- Create: `js/particles.js`

从 preview.html 提取爱心纹理 + 粒子系统，封装为 `export function createParticles(scene)`。

- [ ] **Step 1: 写入 js/particles.js**

```js
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

  // Veins
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
  const P_N = 300;

  for (let i = 0; i < P_N; i++) {
    const isBig = i < 75;
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
```

- [ ] **Step 2: 提交**

```bash
git add js/particles.js
git commit -m "feat: extract particles module — 300 heart sprites, camera-space flow"
```

---

### Task 5: cards.js — 卡片纹理 + 3D 卡片 + 9 阵型

**Files:**
- Create: `js/cards.js`

从 preview.html 提取卡片纹理、3D 卡片创建、9 种阵型计算逻辑。

- [ ] **Step 1: 写入 js/cards.js**

内容包含：
1. `makeCardTex(data)` — Canvas 绘制 16:10 卡片纹理（照片左 + 文案右 A风字体）
2. `getLayout(layoutType, total)` — 9 种阵型位置计算
3. `createCards(scene, cardInfos)` — 创建所有 3D 卡片，返回 cards 数组 + cardGroup + 阵型数据
4. `LAYOUT_NAMES` — 导出阵型名称数组

```js
import * as THREE from 'three';

export const LAYOUT_NAMES = ['扇形展牌', '圆形环绕', '正弦波浪', '爱心排列', '螺旋银河', '菱阵', '飘带', '星散布', '错落立柱'];

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
  const pg = ctx.createLinearGradient(0, phT, 0, phB);
  pg.addColorStop(0, d.color); pg.addColorStop(0.5, 'rgba(30,15,25,1)'); pg.addColorStop(1, 'rgba(18,8,22,1)');
  ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(phL, phT, phR - phL, phB - phT, 8); ctx.fill();

  // Load image or show placeholder
  if (d.image) {
    const img = new Image();
    img.src = d.image;
    if (img.complete) {
      ctx.save(); ctx.beginPath(); ctx.roundRect(phL, phT, phR - phL, phB - phT, 8); ctx.clip();
      ctx.drawImage(img, phL, phT, phR - phL, phB - phT);
      ctx.restore();
    } else {
      ctx.font = `${(phB - phT) * 0.45}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(d.emoji || '📷', (phL + phR) / 2, (phT + phB) / 2);
    }
  } else {
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
    const geo = new THREE.PlaneGeometry(3.2, 2.0);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthTest: true, depthWrite: true });
    const card = new THREE.Mesh(geo, mat);
    card.userData = { index: i, total: cardInfos.length, info: d, floatO: Math.random() * Math.PI * 2 };
    card.renderOrder = i;
    cardGroup.add(card);
    cards.push(card);
  });

  const layoutTargets = [];
  for (let lt = 0; lt < 9; lt++) layoutTargets.push(getLayout(lt, cards.length));

  return { cardGroup, cards, layoutTargets };
}
```

- [ ] **Step 2: 提交**

```bash
git add js/cards.js
git commit -m "feat: extract cards module — 9 layouts, 16:10 card texture with config support"
```

---

### Task 6: interactions.js — 拖拽/滚轮/点击/Zoom

**Files:**
- Create: `js/interactions.js`

封装所有交互逻辑。

- [ ] **Step 1: 写入 js/interactions.js**

```js
export function setupInteractions(renderer, camera, cards, getState, setState) {
  let dragging = false, dStart = { x: 0, y: 0 }, dPrev = { rotY: 0, rotX: 0 }, cStart = { x: 0, y: 0 };

  renderer.domElement.addEventListener('pointerdown', e => {
    const s = getState();
    dragging = true;
    dStart = { x: e.clientX, y: e.clientY };
    cStart = { x: e.clientX, y: e.clientY };
    dPrev = { rotY: s.targetRotY, rotX: s.targetRotX };
    document.body.classList.add('dragging');
  });

  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const s = getState();
    s.targetRotY = dPrev.rotY + (e.clientX - dStart.x) * 0.008;
    s.targetRotX = dPrev.rotX + (e.clientY - dStart.y) * 0.005;
    s.targetRotX = Math.max(-1.2, Math.min(1.2, s.targetRotX));
    setState(s);
  });

  window.addEventListener('pointerup', () => { dragging = false; document.body.classList.remove('dragging'); });

  renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault();
    const s = getState();
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      s.targetLayout = ((s.targetLayout + (e.deltaY > 0 ? 1 : -1)) % 9 + 9) % 9;
      s.layoutT = 0;
    } else {
      s.targetZoom += e.deltaX * 0.01;
      s.targetZoom = Math.max(4, Math.min(16, s.targetZoom));
    }
    setState(s);
  }, { passive: false });

  return { get cStart() { return cStart; } };
}

export function setupZoom(renderer, camera, cards, zoomOverlay, zoomCardEl, zoomBack, cStartRef) {
  const raycaster = new THREE.Raycaster();
  const cMouse = new THREE.Vector2();
  let zoomed = null;

  function showZoom(info) {
    const w = 720, h = 450;
    const c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
    const ctx = c2.getContext('2d');

    const bg2 = ctx.createLinearGradient(0, 0, w, 0);
    bg2.addColorStop(0, 'rgba(12,2,20,0.99)'); bg2.addColorStop(0.5, 'rgba(15,4,24,0.99)'); bg2.addColorStop(1, 'rgba(12,2,20,0.99)');
    ctx.fillStyle = bg2; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 20); ctx.fill();
    ctx.strokeStyle = 'rgba(255,28,174,0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(1, 1, w - 2, h - 2, 20); ctx.stroke();

    const glow2 = ctx.createRadialGradient(w * 0.32, h * 0.5, 0, w * 0.32, h * 0.5, w * 0.4);
    glow2.addColorStop(0, 'rgba(255,28,174,0.08)'); glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 20); ctx.fill();

    const M2 = 44, phL2 = M2, phR2 = w / 2 - M2, phT2 = M2, phB2 = h - M2;
    const pg2 = ctx.createLinearGradient(0, phT2, 0, phB2);
    pg2.addColorStop(0, info.color); pg2.addColorStop(0.5, 'rgba(30,15,25,1)'); pg2.addColorStop(1, 'rgba(18,8,22,1)');
    ctx.fillStyle = pg2; ctx.beginPath(); ctx.roundRect(phL2, phT2, phR2 - phL2, phB2 - phT2, 10); ctx.fill();

    ctx.font = `${(phB2 - phT2) * 0.45}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(info.emoji || '📷', (phL2 + phR2) / 2, (phT2 + phB2) / 2);

    const tx2 = w / 2, ty2 = h / 2;
    ctx.font = 'italic 24px Georgia,serif'; ctx.fillStyle = '#d090a0'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(info.title_en, tx2, ty2 - 42);
    ctx.font = '300 48px "Noto Serif SC",Georgia,serif'; ctx.fillStyle = '#f5d5e0';
    ctx.fillText(info.title_cn.split('').join('  '), tx2, ty2 + 18);
    ctx.strokeStyle = 'rgba(255,28,174,0.4)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(tx2, ty2 + 34); ctx.lineTo(tx2 + 32, ty2 + 34); ctx.stroke();
    ctx.font = '14px system-ui,sans-serif'; ctx.fillStyle = '#b08090';
    info.text.split('\n').forEach((l, i) => ctx.fillText(l, tx2, ty2 + 66 + i * 24));

    zoomCardEl.innerHTML = `<div style="width:100%;aspect-ratio:16/10;border-radius:14px;overflow:hidden;position:relative;"><img src="${c2.toDataURL('image/png')}" style="width:100%;height:100%;object-fit:contain;display:block;" /></div>`;
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
```

- [ ] **Step 2: 提交**

```bash
git add js/interactions.js
git commit -m "feat: extract interactions module — drag orbit, scroll layout, click zoom"
```

---

### Task 7: main.js — 主入口：初始化场景 + 启动循环

**Files:**
- Create: `js/main.js`

将 preview.html 的 `<script type="module">` 剩余部分（场景初始化 + 动画循环 + 配置文件加载）提取到 main.js。

- [ ] **Step 1: 写入 js/main.js**

```js
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
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  // Stars
  const stars = createStars(scene);

  // Particles
  const { container: pContainer, particles } = createParticles(scene);

  // Cards — map config format to internal format
  const cardInfos = config.cards.map(c => ({
    title_cn: c.title_cn,
    title_en: c.title_en,
    text: c.text,
    image: c.image,
    color: c.color,
    emoji: '📷'
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
```

- [ ] **Step 2: 提交**

```bash
git add js/main.js
git commit -m "feat: main entry — load config, init scene, animation loop"
```

---

### Task 8: 本地运行 + 验证

- [ ] **Step 1: 安装依赖**

```bash
cd /c/Users/23001/Desktop/3d-photo-album
npm install
```

- [ ] **Step 2: 启动开发服务器**

```bash
npm run dev
```

Expected: Vite 启动，终端显示 `http://localhost:5173`

- [ ] **Step 3: 浏览器验证**

打开 `http://localhost:5173`：
- ✅ 标题动画正常播放（中央 → 左上角）
- ✅ 星空背景可见
- ✅ 爱心粒子流动
- ✅ 8 张卡片按扇形排列
- ✅ 滚轮切换 9 种阵型
- ✅ 拖拽旋转视角
- ✅ 单击卡片弹出详情
- ✅ 无 console 报错

---

### Task 9: 部署到 Vercel

- [ ] **Step 1: 初始化 Git 仓库**

```bash
cd /c/Users/23001/Desktop/3d-photo-album
git init
git add -A
git commit -m "feat: 3D dreamy photo album — initial release"
```

- [ ] **Step 2: 推送到 GitHub**

```bash
# 用户在 GitHub 创建仓库 dxy-photo-album 后
git remote add origin https://github.com/<username>/dxy-photo-album.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Vercel 部署**

1. 访问 https://vercel.com
2. 用 GitHub 登录
3. 点击 "New Project" → 选择 dxy-photo-album 仓库
4. Framework: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. 点击 Deploy

- [ ] **Step 4: 验证部署**

打开 Vercel 生成的 `.vercel.app` 链接，确认一切正常。

---

## 自审

- ✅ Spec 覆盖：卡片布局、标题动画、星空、粒子、交互、配置、部署全部有对应 Task
- ✅ 无占位符：所有代码完整写出
- ✅ 类型一致：config.json 字段名与 cards.js 读取一致（title_cn, title_en, text, image, color）
