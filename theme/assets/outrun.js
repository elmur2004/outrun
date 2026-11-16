// OUTRUN global behaviors. Loaded on every page as a module; sections import helpers from 'outrun'.
// Ported from design-handoff/app.js (mountCommon, cart helpers, boot). No framework, no external CDN.

const root = document.documentElement;
const config = window.OUTRUN_CONFIG || { routes: {}, strings: {} };
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
// Elements not yet wired for a behavior (the theme editor re-runs behaviors after re-rendering a section).
const fresh = (sel, key) => $$(sel).filter((el) => !el.dataset[key] && (el.dataset[key] = '1'));

/* ---------- Calm motion ---------- */
export const isCalm = () => root.classList.contains('calm');

function setCalm(on) {
  root.classList.toggle('calm', on);
  try { localStorage.setItem('or_calm', JSON.stringify(on)); } catch (e) { /* storage blocked: still applies this visit */ }
  $$('[data-calm-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
  document.dispatchEvent(new CustomEvent('outrun:calm', { detail: { calm: on } }));
}

/* ---------- Toast ---------- */
let toastTimer;
export function toast(message) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2600);
}

/* ---------- Cart ---------- */
export async function refreshCartCount() {
  try {
    const cart = await fetch(`${config.routes.cart}.js`, { headers: { Accept: 'application/json' } }).then((r) => r.json());
    $$('[data-cart-count]').forEach((el) => { el.textContent = cart.item_count; });
    $$('[data-cart-button]').forEach((b) => {
      b.classList.remove('spin');
      void b.offsetWidth; // restart the wheel spin
      b.classList.add('spin');
    });
    return cart;
  } catch (e) {
    return null;
  }
}

export async function addToCart(items) {
  const res = await fetch(`${config.routes.cartAdd}.js`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).description || 'Add to cart failed');
  await refreshCartCount();
  document.dispatchEvent(new CustomEvent('outrun:cart-added', { detail: { items } }));
  return res.json();
}

// Progressive enhancement: any <form data-cart-add> works without JS (posts to /cart/add).
document.addEventListener('submit', async (e) => {
  const form = e.target.closest('form[data-cart-add]');
  if (!form) return;
  e.preventDefault();
  const button = form.querySelector('[type="submit"]');
  button?.setAttribute('aria-busy', 'true');
  try {
    const data = new FormData(form);
    await addToCart([{ id: Number(data.get('id')), quantity: Number(data.get('quantity') || 1) }]);
    toast(config.strings.added);
  } catch (err) {
    toast(err.message || config.strings.error);
  } finally {
    button?.removeAttribute('aria-busy');
  }
});

/* ---------- 3D: load three.js only when a 3D stage is about to be seen ---------- */
export const webgl = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) {
    return false;
  }
})();

let scenes;
// Returns a handle: handle.api() is the scene's API once mounted, handle.dispose() tears it down.
export function lazy3D(wrap, mount) {
  let api = null;
  let dead = false;
  let io = null;
  const handle = { api: () => api, dispose: () => { dead = true; io?.disconnect(); api?.dispose?.(); } };
  if (!wrap) return handle;
  if (!webgl || root.dataset.enable3d === 'false') {
    wrap.classList.add('no-3d');
    return handle;
  }
  io = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    try {
      scenes ??= import('outrun-3d');
      const S = await scenes;
      if (dead) return;
      api = mount(S, wrap.querySelector('canvas'));
      wrap.classList.add('ready');
    } catch (err) {
      console.warn('[OUTRUN] 3D unavailable, showing the image instead.', err);
      wrap.classList.add('no-3d');
    }
  }, { rootMargin: '300px' });
  io.observe(wrap);
  return handle;
}

/* ---------- Page behaviors ---------- */
function scrollProgress() {
  const bar = document.querySelector('[data-progress]');
  if (!bar) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const h = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  addEventListener('scroll', () => { raf ||= requestAnimationFrame(update); }, { passive: true });
  update();
}

// Reveal only what starts below the fold, so the first frame is always complete.
function reveals() {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.remove('pre');
    io.unobserve(e.target);
  }), { threshold: 0.12 });
  $$('.rv').forEach((el) => {
    if (!isCalm() && el.getBoundingClientRect().top > innerHeight * 0.95) el.classList.add('pre');
    io.observe(el);
  });
}

// Optional headlight sweep when a new section enters (Theme settings → Motion).
function sectionSweeps() {
  if (root.dataset.sweeps !== 'true') return;
  const sweep = document.querySelector('[data-sweep]');
  if (!sweep) return;
  let last = 0;
  const seen = new WeakSet();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting || seen.has(e.target)) return;
    seen.add(e.target);
    const now = performance.now();
    if (isCalm() || now - last < 1100) return;
    last = now;
    sweep.classList.remove('go');
    void sweep.offsetWidth;
    sweep.classList.add('go');
  }), { threshold: 0.22 });
  $$('main .shopify-section').forEach((s, i) => (i === 0 ? seen.add(s) : io.observe(s)));
}

function magneticButtons() {
  if (root.dataset.magnetic === 'false' || !matchMedia('(hover: hover)').matches) return;
  fresh('.mag', 'magBound').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      if (isCalm()) return;
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
    });
    b.addEventListener('pointerleave', () => {
      b.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)';
      b.style.transform = '';
      setTimeout(() => { b.style.transition = ''; }, 500);
    });
  });
}

// Reels: hover plays on desktop, tap toggles on touch. Real <video> plays; photo placeholders get a slow zoom.
function reels() {
  const setPlaying = (reel, on) => {
    reel.classList.toggle('playing', on);
    reel.setAttribute('aria-pressed', String(on));
    const video = reel.querySelector('video');
    if (video) on ? video.play().catch(() => {}) : video.pause();
  };
  fresh('[data-reel]', 'reelBound').forEach((reel) => {
    reel.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !isCalm()) setPlaying(reel, true); });
    reel.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') setPlaying(reel, false); });
    reel.addEventListener('click', () => {
      const on = !reel.classList.contains('playing');
      $$('[data-reel].playing').forEach((r) => setPlaying(r, false));
      setPlaying(reel, on);
    });
  });
}

// Silhouettes: a light sweep across the image, bound to scroll position.
function veils() {
  const items = fresh('[data-veil]', 'veilBound');
  if (!items.length) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    items.forEach((v) => {
      if (isCalm()) return v.style.setProperty('--rev', 1);
      const r = v.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.9 + r.height * 0.5)));
      v.style.setProperty('--rev', p.toFixed(3));
    });
  };
  addEventListener('scroll', () => { raf ||= requestAnimationFrame(update); }, { passive: true });
  document.addEventListener('outrun:calm', update);
  update();
}

// Mobile menu: native modal <dialog>, slid in with a class so the close can animate too.
function mobileMenu() {
  const dialog = document.getElementById('MobileMenu');
  if (!dialog || dialog.dataset.menuBound) return;
  dialog.dataset.menuBound = '1';
  const openers = $$('[data-menu-open]');
  const close = () => {
    if (!dialog.open) return;
    dialog.classList.remove('open');
    openers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    setTimeout(() => dialog.close(), isCalm() ? 150 : 600);
  };
  openers.forEach((b) => b.addEventListener('click', () => {
    dialog.showModal();
    requestAnimationFrame(() => dialog.classList.add('open'));
    b.setAttribute('aria-expanded', 'true');
  }));
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); }); // Escape
  dialog.addEventListener('click', (e) => { if (e.target.closest('[data-menu-close], a')) close(); });
  addEventListener('resize', () => { if (innerWidth > 900) close(); });
}

function calmToggles() {
  fresh('[data-calm-toggle]', 'calmBound').forEach((b) => {
    b.setAttribute('aria-pressed', String(isCalm()));
    b.addEventListener('click', () => setCalm(!isCalm()));
  });
}

calmToggles();
mobileMenu();
scrollProgress();
reveals();
sectionSweeps();
magneticButtons();
reels();
veils();

// Theme editor: re-run per-section behaviors when a section is re-rendered.
document.addEventListener('shopify:section:load', () => { reveals(); magneticButtons(); reels(); veils(); calmToggles(); mobileMenu(); });
