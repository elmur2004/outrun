// <editions-showcase>: three caps in 3D, morphing the emblem of the one in front.
// Tabs are plain toggle buttons (aria-pressed): they drive the stage and the link, there are no tab panels.
import { lazy3D, isCalm } from 'outrun';

class EditionsShowcase extends HTMLElement {
  connectedCallback() {
    this.tabs = [...this.querySelectorAll('[data-ed-tab]')];
    this.link = this.querySelector('[data-ed-link]');
    const active = Math.max(0, this.tabs.findIndex((t) => t.getAttribute('aria-pressed') === 'true'));
    const editions = this.tabs.map((t) => t.dataset.emblem);

    this.scene = lazy3D(this.querySelector('.cv-wrap'), (S, canvas) =>
      S.mountEditions(canvas, { editions, active, calm: isCalm(), onActive: (i) => this.select(i, false) }));

    this.tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => this.select(i, true));
      tab.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') this.select(i, true); });
    });
  }

  disconnectedCallback() { this.scene?.dispose(); }

  select(i, moveStage) {
    this.tabs.forEach((t, j) => t.setAttribute('aria-pressed', String(i === j)));
    const tab = this.tabs[i];
    if (this.link && tab) {
      this.link.textContent = tab.dataset.linkLabel;
      this.link.href = tab.dataset.url;
    }
    if (moveStage) this.scene?.api()?.setActive(i);
  }
}

if (!customElements.get('editions-showcase')) customElements.define('editions-showcase', EditionsShowcase);
