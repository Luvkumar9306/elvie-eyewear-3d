/* ─────────────────────────────────────────────────────────────────────────────
   ELVIE by Jimmy Fairly — app.js
   Three.js model · GSAP ScrollTrigger · UI interactions
───────────────────────────────────────────────────────────────────────────── */

'use strict';

let scene, camera, renderer, orbitControls;
let glassesGroup, floatingGroup, frameGroup, lensesGroup, templesGroup, hingesGroup;
let frameMaterial, lensMaterial;
let scrollTimeline;

let currentFrameMode = 'honey';
let currentLensMode  = 'brown';

gsap.registerPlugin(ScrollTrigger);

// ────────────────────────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initThree();
  createEnvironmentMap();
  createElvieGlasses();
  setupScrollAnimations();
  setupEventListeners();
  setupSectionObserver();
  setupSpecTicker();
  setupProgressBar();
  handleResize();
});

// ────────────────────────────────────────────────────────────────────────────
// THREE.JS SCENE
// ────────────────────────────────────────────────────────────────────────────
function initThree() {
  const container = document.getElementById('webgl-container');
  if (!container) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.04;
  orbitControls.enableZoom = false;
  orbitControls.maxPolarAngle = Math.PI / 1.8;
  orbitControls.minPolarAngle = Math.PI / 2.5;

  // Premium studio lighting
  scene.add(new THREE.AmbientLight(0xfff8f2, 0.85));

  const key = new THREE.DirectionalLight(0xfff8ee, 1.5);
  key.position.set(4, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(1024);
  key.shadow.bias = -0.001;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xd9e3f0, 0.45);
  fill.position.set(-4, 2, -2);
  scene.add(fill);

  const rim = new THREE.PointLight(0xffedd5, 1.8, 18);
  rim.position.set(0, 1.5, -4);
  scene.add(rim);

  const bounce = new THREE.PointLight(0xffd8a8, 0.5, 10);
  bounce.position.set(0, -3, 3);
  scene.add(bounce);

  function animate(time) {
    requestAnimationFrame(animate);
    if (floatingGroup) {
      floatingGroup.position.y = Math.sin(time * 0.0009) * 0.045;
      floatingGroup.rotation.y = Math.sin(time * 0.00045) * 0.032;
      floatingGroup.rotation.x = Math.cos(time * 0.00065) * 0.018;
    }
    orbitControls.update();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}

// ────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT MAP
// ────────────────────────────────────────────────────────────────────────────
function createEnvironmentMap() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0,   '#fdfcf9');
  grad.addColorStop(0.4, '#e8e4d8');
  grad.addColorStop(0.7, '#7f7c74');
  grad.addColorStop(1,   '#1c1c1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.filter = 'blur(10px)';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8,  8,  40, 100);
  ctx.fillRect(size - 55, 15, 50, 70);
  ctx.filter = 'blur(5px)';
  ctx.fillStyle = 'rgba(255,240,220,0.6)';
  ctx.fillRect(90, 5, 80, 35);

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;
}

// ────────────────────────────────────────────────────────────────────────────
// TORTOISE TEXTURE
// ────────────────────────────────────────────────────────────────────────────
function createTortoiseTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#dfa968';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 55; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 28;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0,   'rgba(42, 22, 8, 0.92)');
    g.addColorStop(0.4, 'rgba(90, 52, 20, 0.75)');
    g.addColorStop(0.8, 'rgba(180, 110, 50, 0.3)');
    g.addColorStop(1,   'rgba(223, 169, 104, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 0.8),
                Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const sheen = ctx.createLinearGradient(0, 0, size, size);
  sheen.addColorStop(0,   'rgba(255,230,180,0.12)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  sheen.addColorStop(1,   'rgba(255,230,180,0.08)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.4, 0.5);
  return tex;
}

// ────────────────────────────────────────────────────────────────────────────
// GLASSES MODEL
// ────────────────────────────────────────────────────────────────────────────
function createElvieGlasses() {
  glassesGroup  = new THREE.Group();
  floatingGroup = new THREE.Group();
  frameGroup    = new THREE.Group();
  lensesGroup   = new THREE.Group();
  templesGroup  = new THREE.Group();
  hingesGroup   = new THREE.Group();

  floatingGroup.add(frameGroup, lensesGroup, templesGroup, hingesGroup);
  glassesGroup.add(floatingGroup);
  scene.add(glassesGroup);

  const tortoiseMap = createTortoiseTexture();

  frameMaterial = new THREE.MeshPhysicalMaterial({
    map: tortoiseMap, metalness: 0.04, roughness: 0.1,
    clearcoat: 1.0, clearcoatRoughness: 0.04,
    transmission: 0.32, transparent: true, opacity: 0.98,
    ior: 1.48, thickness: 0.14,
  });

  lensMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7a4a22, roughness: 0.03,
    transmission: 0.58, transparent: true, opacity: 0.72,
    side: THREE.DoubleSide, ior: 1.52,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xc8a050, metalness: 0.95, roughness: 0.14,
  });

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8, metalness: 0.98, roughness: 0.12,
  });

  // Frame Shape
  const S = new THREE.Shape();
  S.moveTo(0, 0.36);
  S.quadraticCurveTo(0.2, 0.36, 0.4, 0.36);
  S.bezierCurveTo(0.68, 0.64, 1.5, 0.64, 1.75, 0.38);
  S.lineTo(2.05, 0.38); S.lineTo(2.05, 0.12); S.lineTo(1.75, 0.12);
  S.bezierCurveTo(1.6, -0.54, 0.68, -0.54, 0.4, -0.26);
  S.quadraticCurveTo(0, 0.16, -0.4, -0.26);
  S.bezierCurveTo(-0.68, -0.54, -1.6, -0.54, -1.75, 0.12);
  S.lineTo(-2.05, 0.12); S.lineTo(-2.05, 0.38); S.lineTo(-1.75, 0.38);
  S.bezierCurveTo(-1.5, 0.64, -0.68, 0.64, -0.4, 0.36);
  S.quadraticCurveTo(-0.2, 0.36, 0, 0.36);

  const lh = new THREE.Path();
  lh.absellipse(-1.08, 0.05, 0.63, 0.43, 0, Math.PI * 2, false);
  S.holes.push(lh);

  const rh = new THREE.Path();
  rh.absellipse(1.08, 0.05, 0.63, 0.43, 0, Math.PI * 2, false);
  S.holes.push(rh);

  const frameGeom = new THREE.ExtrudeGeometry(S, {
    depth: 0.09, bevelEnabled: true,
    bevelThickness: 0.022, bevelSize: 0.016, bevelSegments: 5,
  });
  const frontFrame = new THREE.Mesh(frameGeom, frameMaterial);
  frontFrame.position.z = -0.045;
  frameGroup.add(frontFrame);

  // Rivet Pins
  const pinG = new THREE.CylinderGeometry(0.017, 0.017, 0.025, 10);
  [[-1.95, 0.25], [-1.83, 0.25], [1.95, 0.25], [1.83, 0.25]].forEach(([x, y]) => {
    const pin = new THREE.Mesh(pinG, goldMat);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(x, y, 0.06);
    frameGroup.add(pin);
  });

  // Lenses
  [[-1.08, 0.05], [1.08, 0.05]].forEach(([cx, cy]) => {
    const ls = new THREE.Shape();
    ls.absellipse(cx, cy, 0.63, 0.43, 0, Math.PI * 2, false);
    const lg = new THREE.ExtrudeGeometry(ls, { depth: 0.025, bevelEnabled: false });
    const lm = new THREE.Mesh(lg, lensMaterial);
    lm.position.z = -0.012;
    lensesGroup.add(lm);
  });

  // Temple Arms
  const tS = new THREE.Shape();
  tS.moveTo(0, 0.065);
  tS.lineTo(1.15, 0.05);
  tS.quadraticCurveTo(1.65, 0.032, 1.88, -0.14);
  tS.lineTo(2.04, -0.44);
  tS.lineTo(1.96, -0.44);
  tS.lineTo(1.82, -0.17);
  tS.quadraticCurveTo(1.62, 0.005, 1.15, -0.028);
  tS.lineTo(0, -0.065);
  tS.closePath();

  const templeG = new THREE.ExtrudeGeometry(tS, {
    depth: 0.05, bevelEnabled: true,
    bevelThickness: 0.01, bevelSize: 0.005, bevelSegments: 2,
  });

  const leftArm = new THREE.Group();
  leftArm.position.set(-1.9, 0.25, -0.08);
  const lam = new THREE.Mesh(templeG, frameMaterial);
  lam.rotation.y = -Math.PI / 2;
  leftArm.add(lam);
  templesGroup.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(1.9, 0.25, -0.08);
  const ram = new THREE.Mesh(templeG, frameMaterial);
  ram.rotation.y = Math.PI / 2;
  rightArm.add(ram);
  rightArm.scale.x = -1;
  templesGroup.add(rightArm);

  // Hinges
  const cylG  = new THREE.CylinderGeometry(0.013, 0.013, 0.024, 16);
  const boxG  = new THREE.BoxGeometry(0.042, 0.032, 0.055);

  [[-1.9, 0.25, -0.08], [1.9, 0.25, -0.08]].forEach(([hx, hy, hz]) => {
    const hg = new THREE.Group();
    hg.position.set(hx, hy, hz);
    const bracket = new THREE.Mesh(boxG, goldMat);
    bracket.position.z = 0.025;
    hg.add(bracket);
    [[0, 0.032, 0], [0, -0.032, 0]].forEach(([bx, by, bz]) => {
      const barrel = new THREE.Mesh(cylG, silverMat);
      barrel.position.set(bx, by, bz);
      hg.add(barrel);
    });
    hingesGroup.add(hg);
  });

  glassesGroup.traverse(c => {
    if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
  });

  glassesGroup.rotation.set(0.15, -0.42, 0);
  glassesGroup.position.set(1.85, 0, 0.4);
  glassesGroup.scale.setScalar(1.22);
}

// ────────────────────────────────────────────────────────────────────────────
// SCROLL ANIMATIONS
// ────────────────────────────────────────────────────────────────────────────
function setupScrollAnimations() {
  if (!glassesGroup) return;

  scrollTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#ui-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.4,
      onUpdate: self => {
        if (Math.abs(self.velocity) > 150 && Math.floor(self.progress * 200) % 15 === 0) {
          if (window.techSynth) window.techSynth.playScrollTick();
        }
      },
    },
  });

  // 0→1: Hero → Anatomy
  scrollTimeline
    .fromTo(glassesGroup.position, { x: 1.85, y: 0, z: 0.4 }, { x: -1.65, y: 0, z: 0, duration: 1 }, 0)
    .fromTo(glassesGroup.rotation, { x: 0.15, y: -0.42, z: 0 }, { x: 0.28, y: 0.42, z: 0, duration: 1 }, 0)
    .to(lensesGroup.position,              { z: 1.6, duration: 1 }, 0)
    .to(templesGroup.children[0].position, { x: -2.6, z: -0.5, duration: 1 }, 0)
    .to(templesGroup.children[1].position, { x: 2.6,  z: -0.5, duration: 1 }, 0)
    .to(hingesGroup.position,              { y: 0.45, duration: 1 }, 0)

  // 1→2: Anatomy → Gallery
    .to(lensesGroup.position,              { z: 0, duration: 0.7 }, 1)
    .to(templesGroup.children[0].position, { x: -1.9, z: -0.08, duration: 0.7 }, 1)
    .to(templesGroup.children[1].position, { x: 1.9,  z: -0.08, duration: 0.7 }, 1)
    .to(hingesGroup.position,              { y: 0, duration: 0.7 }, 1)
    .to(glassesGroup.position,             { x: 0, y: -7.0, z: -0.5, duration: 1 }, 1.1)
    .to(glassesGroup.rotation,             { x: 0.18, y: 0, z: 0.04, duration: 1 }, 1.1)

  // 2→3: Gallery → Configurator
    .to(glassesGroup.position, { x: 1.85, y: 0, z: 1.4, duration: 1 }, 2)
    .to(glassesGroup.rotation, { x: 0.14, y: -0.38, z: 0, duration: 1 }, 2)
    .to(glassesGroup.scale,    { x: 1.42, y: 1.42, z: 1.42, duration: 1 }, 2)

  // 3→4: Configurator → Preorder
    .to(glassesGroup.position, { x: 1.85, y: 0, z: 0.7, duration: 1 }, 3)
    .to(glassesGroup.rotation, { x: 0.14, y: Math.PI * 2 - 0.38, z: 0, duration: 1 }, 3)
    .to(glassesGroup.scale,    { x: 1.22, y: 1.22, z: 1.22, duration: 1 }, 3);
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION OBSERVER
// ────────────────────────────────────────────────────────────────────────────
function setupSectionObserver() {
  const sections  = document.querySelectorAll('.scroll-section');
  const dots      = document.querySelectorAll('#section-dots .dot');
  const navLinks  = document.querySelectorAll('header nav a');
  const header    = document.getElementById('site-header');
  const sectionIds = ['hero-section','specs-section','gallery-section','customize-section','preorder-section'];

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = sectionIds.indexOf(entry.target.id);
      dots.forEach((d, i)    => d.classList.toggle('active', i === idx));
      navLinks.forEach(a     => a.classList.toggle('active', a.getAttribute('href').replace('#','') === entry.target.id));
    });
  }, { threshold: 0.45 });

  sections.forEach(s => io.observe(s));

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      document.getElementById(dot.dataset.section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ────────────────────────────────────────────────────────────────────────────
// ANATOMY SCROLL-IN
// ────────────────────────────────────────────────────────────────────────────
function setupAnatomyObserver() {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 120);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.anatomy-item').forEach(el => io.observe(el));
}

// ────────────────────────────────────────────────────────────────────────────
// GALLERY SCROLL-IN
// ────────────────────────────────────────────────────────────────────────────
function setupGalleryObserver() {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 160);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.gallery-card').forEach(el => io.observe(el));
}

// ────────────────────────────────────────────────────────────────────────────
// SPEC TICKER
// ────────────────────────────────────────────────────────────────────────────
function setupSpecTicker() {
  const inner = document.getElementById('ticker-inner');
  if (!inner) return;
  let idx = 0;
  const total = inner.querySelectorAll('.spec-ticker-item').length - 1;
  setInterval(() => {
    idx = (idx + 1) % total;
    inner.style.transform = `translateY(calc(-${idx} * 1.2em))`;
  }, 2400);
}

// ────────────────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ────────────────────────────────────────────────────────────────────────────
function setupProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
}

// ────────────────────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ────────────────────────────────────────────────────────────────────────────
function setupEventListeners() {
  setupAnatomyObserver();
  setupGalleryObserver();

  // Theme ripple
  document.getElementById('theme-toggle')?.addEventListener('click', e => {
    if (window.techSynth) window.techSynth.playClick();
    triggerCircularRipple(e.clientX, e.clientY);
  });

  // Sound toggle
  document.getElementById('sound-toggle')?.addEventListener('click', () => {
    if (!window.techSynth) return;
    const muted = window.techSynth.toggleMute();
    window.techSynth.playClick();
    document.getElementById('sound-toggle').style.opacity = muted ? '0.35' : '';
  });

  // Hero CTA → scroll to specs
  document.getElementById('hero-explore-btn')?.addEventListener('click', () => {
    if (window.techSynth) window.techSynth.playClick();
    document.getElementById('specs-section').scrollIntoView({ behavior: 'smooth' });
  });

  // Frame swatches
  document.querySelectorAll('#frame-swatches .swatch').forEach(sw => {
    sw.addEventListener('click', e => {
      if (window.techSynth) window.techSynth.playClick();
      document.querySelectorAll('#frame-swatches .swatch').forEach(s => s.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentFrameMode = e.currentTarget.dataset.color;
      document.getElementById('frame-name').textContent = e.currentTarget.dataset.name;
      updateFrameMaterials();
      updateCartText();
    });
  });

  // Lens swatches
  document.querySelectorAll('#lens-swatches .swatch').forEach(sw => {
    sw.addEventListener('click', e => {
      if (window.techSynth) window.techSynth.playClick();
      document.querySelectorAll('#lens-swatches .swatch').forEach(s => s.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentLensMode = e.currentTarget.dataset.color;
      document.getElementById('lens-name').textContent = e.currentTarget.dataset.name;
      updateLensMaterials();
      updateCartText();
    });
  });

  // Open cart
  ['header-reserve-btn','preorder-btn','config-add-btn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      if (window.techSynth) window.techSynth.playClick();
      openCart();
    });
  });

  // Close cart
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  // Checkout
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    if (window.techSynth) window.techSynth.playClick();
    closeCart();
    showToast('Reservation confirmed — Welcome to Jimmy Fairly.');
  });

  // Hover sounds
  document.querySelectorAll('.btn, .btn-icon, .swatch, nav a, .dot').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.techSynth) window.techSynth.playHover();
    });
  });

  window.addEventListener('resize', handleResize);
}

function openCart() {
  document.getElementById('cart-drawer').classList.add('active');
  document.getElementById('cart-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('active');
  document.getElementById('cart-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ────────────────────────────────────────────────────────────────────────────
// MATERIAL UPDATES
// ────────────────────────────────────────────────────────────────────────────
function updateFrameMaterials() {
  if (!frameMaterial) return;
  switch (currentFrameMode) {
    case 'honey':
      frameMaterial.map = createTortoiseTexture();
      frameMaterial.color.setRGB(1, 1, 1);
      frameMaterial.transmission = 0.32;
      frameMaterial.ior = 1.48;
      break;
    case 'black':
      frameMaterial.map = null;
      frameMaterial.color.setHex(0x111111);
      frameMaterial.transmission = 0.0;
      frameMaterial.ior = 1.55;
      break;
    case 'olive':
      frameMaterial.map = null;
      frameMaterial.color.setHex(0x4a6632);
      frameMaterial.transmission = 0.52;
      frameMaterial.ior = 1.48;
      break;
  }
  frameMaterial.needsUpdate = true;
}

function updateLensMaterials() {
  if (!lensMaterial) return;
  const colors = { brown: 0x7a4a22, green: 0x2a4f3f, blue: 0x3a6080 };
  lensMaterial.color.setHex(colors[currentLensMode] || 0x7a4a22);
  lensMaterial.needsUpdate = true;
}

function updateCartText() {
  const el = document.getElementById('cart-item-details');
  if (!el) return;
  const frame = document.querySelector('#frame-swatches .swatch.active')?.dataset.name || '';
  const lens  = document.querySelector('#lens-swatches .swatch.active')?.dataset.name || '';
  el.textContent = `${frame} / ${lens}`;
}

// ────────────────────────────────────────────────────────────────────────────
// DARK MODE RIPPLE
// ────────────────────────────────────────────────────────────────────────────
function triggerCircularRipple(cx, cy) {
  const canvas = document.getElementById('ripple-canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  const isDark   = document.body.classList.contains('dark-mode');
  const targetBg = isDark ? '#f4f1ea' : '#111009';

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const maxR = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
  let r = 0;
  const speed = 28;

  (function step() {
    ctx.fillStyle = targetBg;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    r += speed;
    if (r < maxR) { requestAnimationFrame(step); return; }

    document.body.classList.toggle('dark-mode');
    const dark = document.body.classList.contains('dark-mode');

    if (scene) {
      scene.traverse(c => {
        if (c.isDirectionalLight) c.intensity = dark ? 0.75 : 1.5;
        if (c.isAmbientLight) {
          c.intensity = dark ? 0.45 : 0.85;
          c.color.setHex(dark ? 0x1e2028 : 0xfff8f2);
        }
        if (c.isPointLight) c.intensity = dark ? 0.9 : 1.8;
      });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}

// ────────────────────────────────────────────────────────────────────────────
// TOAST
// ────────────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  const text  = document.getElementById('toast-message');
  if (!toast || !text) return;
  text.textContent = msg;
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 3800);
}

// ────────────────────────────────────────────────────────────────────────────
// RESIZE
// ────────────────────────────────────────────────────────────────────────────
function handleResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
