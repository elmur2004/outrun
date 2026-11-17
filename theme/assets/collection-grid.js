// <collection-grid>: filter chips (edition, finish, make as fitment context), sort, and spinning 3D cards.
// Ported from mountShop() in design-handoff/app.js. Every variant card is a real link, so the grid works without JS.
import { can3D, afterLoad, isCalm, editionKey, finishKey, streetEmblem } from 'outrun';

const FRAMES = 12; // turntable steps per card: frame 0 up front, the other 11 only when the card is about to spin

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
    this.thumbs?.dispose();
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

  // One offscreen renderer, kept while the page is open, draws the caps once the page has loaded and the grid is near.
  setup3D() {
    this.capCards = this.cards.filter((c) => c.hasAttribute('data-card-3d'));
    if (!this.capCards.length) return;
    if (!can3D()) {
      this.grid.classList.add('no-3d');
      return;
    }
    this.timers = [];
    this.io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      this.io.disconnect();
      try {
        await afterLoad;
        const S = await import('outrun-3d');
        this.thumbs = S.createThumbnailer(320);
        await this.renderFirst(this.capCards);
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

  itemFor(card, street) {
    const edition = editionKey(card.dataset.edition);
    const face = edition === 'street' ? street || {} : {};
    return { id: card.dataset.variant, edition, finish: finishKey(card.dataset.finish), img: face.img || null, label: face.label || null };
  }

  // Frame 0 of every card: 9 renders instead of 108. The other frames wait until a card is about to spin.
  async renderFirst(cards) {
    const token = (this.renderToken = (this.renderToken || 0) + 1);
    this.renderedMake = this.state.make;
    const street = await this.streetFor(this.state.make);
    this.street = street;
    const out = await this.thumbs.render(cards.map((c) => this.itemFor(c, street)), { frames: FRAMES, from: 0, to: 1 });
    const outdated = token !== this.renderToken; // a newer make choice is redrawing the Street cards
    cards.forEach((c) => {
      if (outdated && editionKey(c.dataset.edition) === 'street') return;
      c.frames = out[c.dataset.variant];
      c.frame = 0;
      c.faceToken = token; // spin frames must be drawn with the same face
      this.showFrame(c, 0);
      this.bindSpin(c);
    });
  }

  // The other 11 frames for one card, the first time it's about to spin.
  async spinFrames(card) {
    if (!card.frames || card.frames.length >= FRAMES || card.loadingSpin) return;
    card.loadingSpin = true;
    const token = card.faceToken;
    try {
      const out = await this.thumbs.render([this.itemFor(card, this.street)], { frames: FRAMES, from: 1, to: FRAMES });
      if (token === card.faceToken) card.frames = [card.frames[0], ...out[card.dataset.variant]];
    } finally {
      card.loadingSpin = false;
    }
  }

  // After a make chip changes, redraw only the Street cards (frame 0; their spin frames follow on demand).
  rerenderStreet() {
    if (!this.thumbs || this.renderedMake === this.state.make) return;
    const streetCards = this.capCards.filter((c) => editionKey(c.dataset.edition) === 'street');
    if (streetCards.length) this.renderFirst(streetCards).catch(() => {});
  }

  showFrame(card, i) {
    const img = card.querySelector('.card-img');
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = card.frames[i];
    card.classList.add('has-frames');
  }

  bindSpin(card) {
    if (card.dataset.spinBound) return; // listeners read card.frames, so a redraw needs no new ones
    card.dataset.spinBound = '1';
    const img = card.querySelector('.card-img');
    let timer = 0;
    const start = async () => {
      if (isCalm()) return;
      card.wantsSpin = true;
      await this.spinFrames(card);
      if (!card.wantsSpin || !card.frames || card.frames.length < 2) return;
      clearInterval(timer);
      timer = setInterval(() => { card.frame = (card.frame + 1) % card.frames.length; img.src = card.frames[card.frame]; }, 70);
      this.timers.push(timer);
    };
    const stop = () => { card.wantsSpin = false; clearInterval(timer); };
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
