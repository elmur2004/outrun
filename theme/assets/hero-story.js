// <hero-story>: scroll-driven stages (independent of 3D, so lines still show without WebGL)
// plus the 3D wheel, mounted lazily. Ported from mountHome() in design-handoff/app.js.
import { lazy3D, isCalm } from 'outrun';

// Stage boundaries match the 3D timeline in outrun-3d.js mountHero().
const stageAt = (p) => (p < 0.14 ? 0 : p < 0.4 ? 1 : p < 0.7 ? 2 : p < 0.86 ? 3 : 4);

class HeroStory extends HTMLElement {
  connectedCallback() {
    this.lines = [...this.querySelectorAll('.story-line')];
    this.steps = [...this.querySelectorAll('.story-steps i')];
    this.stage = -1;
    this.raf = 0;
    this.onScroll = () => { this.raf ||= requestAnimationFrame(() => { this.raf = 0; this.update(); }); };
    addEventListener('scroll', this.onScroll, { passive: true });
    addEventListener('resize', this.onScroll);
    this.update();

    const labels = {};
    this.querySelectorAll('.plabel').forEach((el) => { labels[el.dataset.part] = el; });
    this.scene = lazy3D(this.querySelector('.cv-wrap'), (S, canvas) => S.mountHero(canvas, this, { labels, calm: isCalm() }));
  }

  disconnectedCallback() {
    removeEventListener('scroll', this.onScroll);
    removeEventListener('resize', this.onScroll);
    cancelAnimationFrame(this.raf);
    this.scene?.dispose();
  }

  update() {
    const r = this.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    const st = stageAt(p);
    if (st === this.stage) return;
    this.stage = st;
    this.dataset.stage = st;
    this.lines.forEach((l) => l.classList.toggle('on', Number(l.dataset.st) === st));
    this.steps.forEach((d, i) => d.classList.toggle('on', i === st));
  }
}

if (!customElements.get('hero-story')) customElements.define('hero-story', HeroStory);
