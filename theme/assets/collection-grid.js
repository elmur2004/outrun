// <collection-grid>: filter chips (edition, finish, make as fitment context), sort, and spinning 3D cards.
// Ported from mountShop() in design-handoff/app.js. Every variant card is a real link, so the grid works without JS.
import { webgl, threeDEnabled, isCalm, editionKey, finishKey, streetEmblem } from 'outrun';

const KEYS = ['make', 'edition', 'finish'];

class CollectionGrid extends HTMLElement {
  connectedCallback() {
    this.grid = this.querySelector('[data-grid]');
    this.cards = [...this.querySelectorAll('.card')];
    this.empty = this.querySelector('[data-empty]');
    this.strings = JSON.parse(this.dataset.strings);

    const params = new URLSearchParams(location.search);
    this.state = {};
    KEYS.forEach((k) => {
      const v = params.get(k);
      this.state[k] = v && this.chip(k, v) ? v : 'all';
    });

    this.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-f]');
      if (chip) { this.state[chip.dataset.f] = chip.dataset.v; this.apply(true); return; }
      if (e.target.closest('[data-clear]')) { this.state.edition = 'all'; this.state.finish = 'all'; this.apply(true); }
    });
    this.querySelector('[data-sort]')?.addEventListener('change', (e) => e.target.form.submit());

    this.apply(false);
    this.setup3D();
  }

  disconnectedCallback() {
    this.io?.disconnect();
    this.timers?.forEach(clearInterval);
  }

  chip(key, value) {
    return this.querySelector(`[data-f="${key}"][data-v="${CSS.escape(value)}"]`);
  }

  apply(remember) {
    const { make, edition, finish } = this.state;
    this.querySelectorAll('[data-f]').forEach((c) => c.setAttribute('aria-pressed', String(this.state[c.dataset.f] === c.dataset.v)));
    const makeName = make !== 'all' && make !== 'other' ? this.chip('make', make)?.dataset.name : null;

    let shown = 0;
    this.cards.forEach((card) => {
      const isCap = card.hasAttribute('data-card-3d');
      const match = isCap
        ? (edition === 'all' || card.dataset.edition === edition) && (finish === 'all' || card.dataset.finish === finish)
        : edition === 'all' && finish === 'all';
      card.hidden = !match;
      if (match) shown += 1;
      if (!isCap) return;
      const badge = card.querySelector('[data-card-badge]');
      if (badge) badge.textContent = make === 'other' ? this.strings.madeDay : this.strings.inRun;
      // Carry the make to the product page, which preselects it.
      const url = new URL(card.href, location.origin);
      if (makeName) url.searchParams.set('make', makeName); else url.searchParams.delete('make');
      card.href = url.pathname + url.search;
    });
    if (this.empty) this.empty.hidden = shown > 0;
    this.rerenderStreet();

    if (remember) {
      const url = new URL(location.href);
      KEYS.forEach((k) => (this.state[k] === 'all' ? url.searchParams.delete(k) : url.searchParams.set(k, this.state[k])));
      history.replaceState(history.state, '', url);
      if (makeName) {
        try { localStorage.setItem('or_fit', JSON.stringify({ make: makeName })); } catch (e) { /* optional */ }
      }
    }
  }

  // One offscreen renderer draws every cap's turntable frames when the grid is near the viewport.
  setup3D() {
    this.capCards = this.cards.filter((c) => c.hasAttribute('data-card-3d'));
    if (!this.capCards.length) return;
    if (!webgl || !threeDEnabled()) {
      this.grid.classList.add('no-3d');
      return;
    }
    this.timers = [];
    this.io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      this.io.disconnect();
      try {
        this.S = await import('outrun-3d');
        await this.render(this.capCards);
      } catch (err) {
        console.warn('[OUTRUN] 3D cards unavailable, showing product photos.', err);
        this.grid.classList.add('no-3d');
      }
    }, { rootMargin: '300px' });
    this.io.observe(this.grid);
  }

  // Street caps wear the selected make's badge: the first make for "All", a neutral face for "Other".
  streetFor(make) {
    if (make === 'other') return Promise.resolve({ img: null, label: null });
    return streetEmblem(make === 'all' ? undefined : this.chip('make', make)?.dataset.name);
  }

  async render(cards) {
    const token = (this.renderToken = (this.renderToken || 0) + 1);
    this.renderedMake = this.state.make;
    const street = await this.streetFor(this.state.make);
    const items = cards.map((c) => {
      const edition = editionKey(c.dataset.edition);
      const face = edition === 'street' ? street : {};
      return { id: c.dataset.variant, edition, finish: finishKey(c.dataset.finish), img: face.img || null, label: face.label || null };
    });
    const frames = await this.S.renderThumbs(items, isCalm() ? 1 : 12, 320);
    const outdated = token !== this.renderToken; // a newer make choice is redrawing the Street cards
    cards.forEach((c) => {
      if (outdated && editionKey(c.dataset.edition) === 'street') return;
      this.attachFrames(c, frames[c.dataset.variant]);
    });
  }

  // After a make chip changes, redraw only the Street cards.
  rerenderStreet() {
    if (!this.S || this.renderedMake === this.state.make) return;
    const streetCards = this.capCards.filter((c) => editionKey(c.dataset.edition) === 'street');
    if (streetCards.length) this.render(streetCards).catch(() => {});
  }

  attachFrames(card, frames) {
    if (!frames?.length) return;
    card.frames = frames;
    card.frame = 0;
    const img = card.querySelector('.card-img');
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = frames[0];
    card.classList.add('has-frames');
    if (card.dataset.spinBound) return; // listeners read card.frames, so a redraw needs no new ones
    card.dataset.spinBound = '1';
    let timer = 0;
    const start = () => {
      if (isCalm() || !card.frames || card.frames.length < 2) return;
      clearInterval(timer);
      timer = setInterval(() => { card.frame = (card.frame + 1) % card.frames.length; img.src = card.frames[card.frame]; }, 70);
      this.timers.push(timer);
    };
    const stop = () => clearInterval(timer);
    card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') start(); });
    card.addEventListener('pointerleave', stop);
    card.addEventListener('focus', start);
    card.addEventListener('blur', stop);
    // Touch screens: spin the card that's mostly in view.
    if (matchMedia('(hover: none)').matches) {
      new IntersectionObserver(([e]) => (e.intersectionRatio > 0.7 ? start() : stop()), { threshold: [0, 0.7] }).observe(card);
    }
  }
}

if (!customElements.get('collection-grid')) customElements.define('collection-grid', CollectionGrid);
