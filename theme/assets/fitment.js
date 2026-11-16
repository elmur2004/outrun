// <fitment-picker>: make → model → a card that links to the product with ?make=&model=,
// or, for "Other", a WhatsApp request prefilled with the car the visitor types.
// The choice is remembered (localStorage 'or_fit') so the product page can prefill it.

class FitmentPicker extends HTMLElement {
  connectedCallback() {
    this.data = JSON.parse(this.querySelector('script[data-fitment]').textContent);
    this.models = this.querySelector('[data-models]');
    this.card = this.querySelector('[data-card]');
    this.make = '';
    this.model = '';
    this.addEventListener('click', (e) => {
      const make = e.target.closest('[data-make]');
      if (make) { this.make = make.dataset.make; this.model = ''; this.draw(true); return; }
      const model = e.target.closest('[data-model]');
      if (model) { this.model = model.dataset.model; this.draw(false); }
    });
  }

  tpl(name) {
    return this.querySelector(`template[data-tpl="${name}"]`).content.cloneNode(true);
  }

  waLink(car) {
    return `https://wa.me/${this.data.whatsapp}?text=${encodeURIComponent(this.data.whatsappMessage + car)}`;
  }

  draw(makeChanged) {
    this.querySelectorAll('[data-make]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.make === this.make)));

    if (this.make === 'other') {
      this.models.replaceChildren(this.tpl('other-input'));
      this.card.replaceChildren(this.tpl('other'));
      const input = this.models.querySelector('input');
      const wa = this.card.querySelector('[data-wa]');
      wa.href = this.waLink('');
      input.addEventListener('input', () => { wa.href = this.waLink(input.value); });
      if (makeChanged) input.focus();
      return;
    }

    const make = this.data.makes[this.make];
    if (makeChanged) {
      if (make) {
        this.models.replaceChildren(...make.models.map((m) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'chip latin';
          b.dataset.model = m;
          b.textContent = m;
          b.setAttribute('aria-pressed', 'false');
          return b;
        }));
      }
    } else {
      this.models.querySelectorAll('[data-model]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.model === this.model)));
    }

    if (!make || !this.model) {
      this.card.replaceChildren(this.tpl('wait'));
      return;
    }

    const car = `${make.name} ${this.model}`;
    const card = this.tpl('ready');
    card.querySelectorAll('[data-car]').forEach((el) => { el.textContent = car; });
    const shop = card.querySelector('[data-shop]');
    const url = new URL(shop.getAttribute('href'), location.origin);
    url.searchParams.set('make', make.name);
    url.searchParams.set('model', this.model);
    shop.href = url.pathname + url.search;
    this.card.replaceChildren(card);
    try { localStorage.setItem('or_fit', JSON.stringify({ make: make.name, model: this.model })); } catch (e) { /* optional */ }
  }
}

if (!customElements.get('fitment-picker')) customElements.define('fitment-picker', FitmentPicker);
