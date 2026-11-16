// <product-info>: variant picker, 3D viewer, fitment, custom design upload, gift box and add to cart.
// Ported from mountPDP() in design-handoff/app.js, rebuilt on Shopify's product form:
// the form still works without JS (variant <select>, required make/model, file upload).
import { lazy3D, isCalm, toast, addToCart, openCart, editionKey, finishKey } from 'outrun';

class ProductInfo extends HTMLElement {
  connectedCallback() {
    this.variants = JSON.parse(this.querySelector('[data-variants]').textContent);
    this.cfg = JSON.parse(this.querySelector('[data-product-config]').textContent);
    this.form = this.querySelector('form.buy-form');
    this.form.noValidate = true; // we validate, with friendlier messages than the browser's

    // The no-JS variant <select> becomes a hidden input driven by the option radios.
    const noJs = this.form.querySelector('[data-no-js-variant]');
    this.idInput = Object.assign(document.createElement('input'), { type: 'hidden', name: 'id', value: noJs.querySelector('select').value });
    noJs.replaceWith(this.idInput);

    this.fieldsets = [...this.querySelectorAll('[data-option]')];
    this.atc = this.querySelector('[data-atc]');
    this.upload = this.querySelector('[data-upload]');
    this.uploadInput = this.querySelector('[data-upload-input]');
    this.customImage = null;

    this.addEventListener('change', (e) => {
      if (e.target.closest('[data-option]')) this.update(true);
      else if (e.target.matches('[data-make]')) this.onMake();
      else if (e.target.matches('[data-upload-input]')) this.onFile(e.target.files[0]);
    });
    this.form.addEventListener('submit', (e) => this.onSubmit(e));

    this.setupViewer();
    this.setupFitment();
    this.setupUploadDrop();
    this.setupStickyBar();
    this.update(false);
  }

  disconnectedCallback() {
    this.viewer?.dispose();
    this.stickyObserver?.disconnect();
  }

  /* ---------- Variants ---------- */
  selected() {
    return this.fieldsets.map((fs) => fs.querySelector('input:checked')?.value);
  }

  variantFor(options) {
    return this.variants.find((v) => v.options.every((o, i) => o === options[i]));
  }

  update(userChange) {
    const options = this.selected();
    // Products with no options (e.g. the gift box) have a single variant and no pickers.
    const variant = this.fieldsets.length ? this.variantFor(options) : this.variants[0];
    const s = this.cfg.strings;

    this.idInput.value = variant ? variant.id : '';
    const canBuy = !!variant && variant.available;
    this.atc.disabled = !canBuy;
    this.querySelector('[data-atc-label]').textContent = !variant ? s.unavailable : variant.available ? s.add : s.soldOut;
    const sticky = this.querySelector('[data-sticky-button]');
    if (sticky) sticky.disabled = !canBuy;

    if (variant) {
      this.querySelector('[data-price]').textContent = variant.price;
      const stickyPrice = this.querySelector('[data-sticky-price]');
      if (stickyPrice) stickyPrice.textContent = variant.price;
      const compare = this.querySelector('[data-compare]');
      compare.hidden = !variant.compare;
      if (variant.compare) compare.textContent = variant.compare;
      this.updateStock(variant);
      if (userChange) {
        const url = new URL(location.href);
        url.searchParams.set('variant', variant.id);
        history.replaceState(history.state, '', url);
      }
    }

    // Strike through values that would land on a sold-out or missing variant.
    this.fieldsets.forEach((fs, i) => {
      fs.querySelectorAll('input').forEach((input) => {
        const probe = [...options];
        probe[i] = input.value;
        const v = this.variantFor(probe);
        input.nextElementSibling?.classList.toggle('is-unavailable', !v || !v.available);
      });
      const name = fs.querySelector('[data-selected-name]');
      if (name) name.textContent = options[i] || '';
    });

    // Custom edition: show the design upload and send the file only for that edition.
    const edition = this.cfg.editionIndex >= 0 ? options[this.cfg.editionIndex] : null;
    const isCustom = edition === this.cfg.customValue;
    if (this.upload) {
      this.upload.hidden = !isCustom;
      this.uploadInput.disabled = !isCustom;
    }

    // 3D viewer follows edition and finish.
    const api = this.viewer?.api();
    if (api && userChange) {
      if (edition) api.setEdition(editionKey(edition), isCustom ? this.customImage : null);
      if (this.cfg.finishIndex >= 0) api.setFinish(finishKey(options[this.cfg.finishIndex]));
    }
  }

  updateStock(variant) {
    const stock = this.querySelector('[data-stock]');
    if (!stock || !this.cfg.runSize) return;
    const qty = variant.inventory;
    stock.hidden = qty === null || qty <= 0;
    if (stock.hidden) return;
    stock.querySelector('[data-stock-count]').textContent = qty;
    stock.querySelector('[data-stock-bar]').style.width = `${Math.min(100, Math.max(0, (qty / this.cfg.runSize) * 100))}%`;
  }

  /* ---------- 3D viewer ---------- */
  setupViewer() {
    const options = this.selected();
    const edition = this.cfg.editionIndex >= 0 ? editionKey(options[this.cfg.editionIndex]) : 'signature';
    const finish = this.cfg.finishIndex >= 0 ? finishKey(options[this.cfg.finishIndex]) : 'gloss';
    this.viewer = lazy3D(this.querySelector('.viewer .cv-wrap'), (S, canvas) => S.mountViewer(canvas, { edition, finish, calm: isCalm() }));

    const spin = this.querySelector('[data-spin]');
    const live = this.querySelector('[data-live]');
    spin?.addEventListener('click', () => {
      const on = spin.getAttribute('aria-pressed') !== 'true';
      spin.setAttribute('aria-pressed', String(on));
      if (live) live.hidden = !on;
      this.viewer.api()?.setSpin(on);
    });
  }

  /* ---------- Fitment ---------- */
  setupFitment() {
    this.makeSelect = this.querySelector('[data-make]');
    if (!this.makeSelect) return;
    this.modelSelect = this.querySelector('[data-model]');
    this.modelField = this.querySelector('[data-model-field]');
    this.otherField = this.querySelector('[data-other-field]');
    this.otherInput = this.querySelector('[data-other-input]');
    this.chooseLabel = this.modelSelect.querySelector('option[value=""]').textContent;
    const data = JSON.parse(this.querySelector('[data-fitment-data]').textContent);
    this.makes = Object.fromEntries(data.makes.map((m) => [m.name, m]));
    this.onMake();

    // Prefill from the home page picker (?make=&model=) or the last choice on this device.
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('or_fit')) || {}; } catch (e) { /* optional */ }
    const params = new URLSearchParams(location.search);
    const make = params.get('make') || saved.make;
    const model = params.get('model') || saved.model;
    if (make && this.makes[make]) {
      this.makeSelect.value = make;
      this.onMake();
      if (model && this.makes[make].models.includes(model)) this.modelSelect.value = model;
    }
  }

  onMake() {
    const make = this.makeSelect.value;
    const isOther = make === 'Other';
    this.modelField.hidden = isOther;
    this.modelSelect.disabled = isOther || !make;
    this.otherField.hidden = !isOther;
    this.otherInput.disabled = !isOther;
    this.querySelector('[data-fitment]')?.classList.remove('invalid');
    // Only this make's models (the no-JS markup lists every make's models in groups).
    const models = this.makes[make]?.models || [];
    const placeholder = new Option(this.chooseLabel, '');
    this.modelSelect.replaceChildren(placeholder, ...models.map((m) => new Option(m, m)));
    if (isOther) this.otherInput.focus();
  }

  fitmentProblem() {
    if (!this.cfg.fitmentRequired || !this.makeSelect) return null;
    if (!this.makeSelect.value) return this.makeSelect;
    if (this.makeSelect.value === 'Other') return this.otherInput.value.trim() ? null : this.otherInput;
    return this.modelSelect.value ? null : this.modelSelect;
  }

  /* ---------- Custom design upload ---------- */
  onFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const thumb = this.querySelector('[data-upload-thumb]');
      const img = new Image();
      img.alt = '';
      img.src = reader.result;
      thumb.replaceChildren(img);
      this.querySelector('[data-upload-msg]').textContent = this.cfg.strings.uploadDone;
      img.onload = () => {
        this.customImage = img;
        this.viewer?.api()?.setEdition('custom', img);
      };
    };
    reader.readAsDataURL(file);
  }

  setupUploadDrop() {
    if (!this.upload) return;
    ['dragenter', 'dragover'].forEach((t) => this.upload.addEventListener(t, (e) => { e.preventDefault(); this.upload.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((t) => this.upload.addEventListener(t, () => this.upload.classList.remove('over')));
    this.upload.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file || this.uploadInput.disabled) return;
      const dt = new DataTransfer();
      dt.items.add(file);
      this.uploadInput.files = dt.files;
      this.onFile(file);
    });
  }

  /* ---------- Add to cart ---------- */
  async onSubmit(e) {
    e.preventDefault();
    const s = this.cfg.strings;

    const missing = this.fitmentProblem();
    if (missing) {
      toast(s.needFit);
      const fieldset = this.querySelector('[data-fitment]');
      fieldset.classList.add('invalid');
      fieldset.scrollIntoView({ behavior: isCalm() ? 'auto' : 'smooth', block: 'center' });
      missing.focus({ preventScroll: true });
      return;
    }
    if (this.cfg.uploadRequired && this.uploadInput && !this.uploadInput.disabled && !this.uploadInput.files.length) {
      toast(s.needUpload);
      this.upload.scrollIntoView({ behavior: isCalm() ? 'auto' : 'smooth', block: 'center' });
      this.uploadInput.focus({ preventScroll: true });
      return;
    }

    const label = this.querySelector('[data-atc-label]');
    this.atc.setAttribute('aria-busy', 'true');
    label.textContent = s.adding;
    try {
      await addToCart(new FormData(this.form));
      const gift = this.querySelector('[data-gift]');
      if (gift?.checked) await addToCart([{ id: Number(gift.value), quantity: 1 }]);
      await openCart();
      toast(s.added);
    } catch (err) {
      toast(err.message);
    } finally {
      this.atc.removeAttribute('aria-busy');
      this.update(false);
    }
  }

  /* ---------- Mobile sticky add to cart: appears once the main button scrolls away ---------- */
  setupStickyBar() {
    const bar = this.querySelector('[data-sticky-atc]');
    if (!bar) return;
    this.stickyObserver = new IntersectionObserver(([entry]) => {
      const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle('on', past);
      bar.inert = !past;
    });
    this.stickyObserver.observe(this.atc);
  }
}

if (!customElements.get('product-info')) customElements.define('product-info', ProductInfo);
