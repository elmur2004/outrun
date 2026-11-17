# OUTRUN Shopify theme

Custom Online Store 2.0 theme for OUTRUN ("Exclusive Motion Gear"): English + Egyptian Arabic (RTL), EGP.

## Layout

| Folder | What it is | In git |
|---|---|---|
| `theme/` | **The Shopify theme.** The only folder that gets pushed to the store. Standard theme structure (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`, `blocks/`). | yes |
| `design-handoff/` | The designer's working prototype (`index.html`, `app.js`, `three-scenes.js`, `img/`). Read-only reference. Open `index.html` through a local server to view it. | yes |
| `docs/` | `00-discovery.md` (tokens, inventory, Shopify mapping, open questions), `design-reference/` (prototype screenshots at 375/768/1280/1440, EN + AR, used for design-parity checks), `licenses/` (font licenses). | yes |
| `store-files/` | Images that go into **Admin → Content → Files** or admin settings, not into the theme. | yes |
| `tools/` | Build scripts (brand assets, Arabic translations). | yes |
| `src/3d/` | Source of the 3D scenes. Built into `theme/assets/outrun-3d.js` (see "3D scenes" below). | yes |
| `brand/` | The client's brand pack (Brand Book, Brand Foundation, Logo Pack, fonts, mockups). Confidential, about 67 MB. Copy it in by hand. | **no** |

## Brand assets

`theme/` never reads from `brand/` at runtime. `tools/build-brand-assets.py` converts what the theme needs, and the outputs are committed:

| Output | From |
|---|---|
| `theme/assets/chakra-petch-{300…700}.woff2` | Chakra Petch TTFs, trimmed to Latin characters (Thai dropped). About 12 KB each. |
| `theme/assets/changa-arabic.woff2` | Changa variable font (weights 200–800), trimmed to Arabic characters. 22 KB. Only downloaded when Arabic text is on the page. |
| `theme/snippets/font-faces.liquid` | `@font-face` rules + preloads. Render once in `<head>`. |
| `theme/snippets/logo.liquid`, `logo-outline.liquid`, `logo-symbol.liquid` | Official Logo Pack SVGs as inline SVG in `currentColor` (style them with CSS `color`). |
| `theme/assets/favicon.svg`, `apple-touch-icon.png` | Symbol on Deep Navy. |
| `store-files/og-share-image.jpg` | Facebook cover. Upload in Online Store → Preferences → Social sharing image. |

Rebuild after the brand pack changes:

```sh
python3 -m venv .venv
.venv/bin/pip install -r tools/requirements.txt
.venv/bin/python tools/build-brand-assets.py
```

Font stack, used everywhere: `"Chakra Petch", "Changa", "Segoe UI", system-ui, sans-serif`. Chakra Petch has no Arabic letters, so the browser uses Changa for Arabic text and keeps Latin text in Chakra Petch, which is what the brand book asks for.

## 3D scenes

`src/3d/outrun-3d.js` holds the hero wheel, the editions showcase, the product viewer and the Shop page thumbnails (ported from `design-handoff/three-scenes.js`). `theme/assets/outrun-3d.js` is a **build output**: esbuild bundles the source with only the parts of three.js r160 it uses (about 134 KB gzipped, against 173 KB for the full library plus the source). Don't edit the built file; edit the source and rebuild:

```sh
npm install          # once: esbuild + three, pinned in package.json
npm run build:3d     # writes theme/assets/outrun-3d.js, then push the theme
```

How 3D loads:

- Only after the page has loaded and gone idle, and only when a 3D section is near the viewport. The photo underneath is what loads first.
- Not at all with Data Saver on, on devices with 2 GB of memory or less, or with Theme settings → Motion → Show 3D scenes off. The photo stays.
- With calm motion on, the 3D still loads but nothing spins, and Shop cards don't turn.
- Shop page: one offscreen renderer draws frame 0 of every card up front. A card's other 11 turntable frames are drawn the first time it's about to spin (hover, keyboard focus, or mostly in view on touch screens).

## Sharing and search

`snippets/meta-tags.liquid` adds Open Graph and Twitter tags to every page, including the password page. The image is the page's own (product, collection), or the store's social sharing image from Online Store → Preferences, falling back to `assets/og-default.jpg`. Product pages also output schema.org structured data from Shopify's `structured_data` filter.

## Connecting to Shopify

| | |
|---|---|
| Store | `vjukkp-ct.myshopify.com` (storefront is password-protected) |
| Working theme | **OUTRUN dev**, unpublished, ID `170183491941` |
| Live theme | Horizon (`170182803813`). Don't push to it. |
| Editor | https://vjukkp-ct.myshopify.com/admin/themes/170183491941/editor |

Store data the theme relies on (created through the Admin API, 2026-11-16; values are placeholders until launch):

| What | Details |
|---|---|
| Product `floating-center-caps` | Options **Edition** (Street, Signature, Custom) × **Finish** (Gloss Black, Satin Steel, Ice Chrome). The theme matches these option names; they're set in the product section's settings. |
| Product `gift-box` | Single variant, inventory not tracked. Chosen in Theme settings → Cart → Gift box product. |
| Product metafields `outrun.*` | `run_size` (integer, stock meter total), `drop_label` (run name), `fitment_required` (boolean; `false` hides make/model, e.g. on the gift box) |
| Metaobject `fitment_make` ("Fitment make") | Fields `name`, `models` (list), `badge` (image), `position`. Storefront-readable. Entries: Mercedes, BMW, MG. One source for the home fitment tiles, the product page make/model dropdowns and the Shop page make chips; `badge` is the Street edition's 3D face (the make's name is lettered on the cap until artwork is uploaded). Theme settings → Fitment is only a fallback when no entries exist. |

### Arabic

Arabic is published at `/ar/` (right-to-left; `<html dir>` follows the locale). Three layers:

| What | Where it lives | How to change it |
|---|---|---|
| Theme interface text (buttons, labels, fitment card, cart) | `theme/locales/ar.json` | Edit the file, push |
| Section copy and stored theme settings (headings, trust items, FAQ…) | Shopify translations on the OUTRUN dev theme | Translate & Adapt app, or re-run the script below |
| Store content (page titles, menu items, product text) | Shopify translations | Translate & Adapt app |

- The Arabic is the designer's own Egyptian copy from the prototype (`design-handoff/app.js`, `T.ar`).
- Brand lines stay in English, as in the prototype: Drive the feeling., Details move differently., Built for a different road., Performance looks better here., and the footer's Always ahead. Always noticed.
- Option names (Edition, Finish, Custom) and URL handles aren't translated: the theme matches on the option names.
- Only *stored* values can be translated. That's why `settings_data.json` and `footer-group.json` spell out values that equal their defaults.
- When the English copy in a template changes, Shopify marks its Arabic as outdated. To refresh from the prototype copy:

```sh
node tools/i18n/extract-prototype-copy.mjs design-handoff/app.js /tmp/T.json
shopify store execute --store vjukkp-ct.myshopify.com --query-file tools/i18n/theme-content.graphql --output-file /tmp/theme-content.json
python3 tools/i18n/build-theme-ar.py /tmp/theme-content.json /tmp/T.json /tmp/theme-ar.json   # lists anything it couldn't match
# then register /tmp/theme-ar.json in batches of 50 with tools/i18n/register-translations.graphql
# (variables: {"id": "gid://shopify/OnlineStoreTheme/170183491941", "t": [...]}, add --allow-mutations)
```

Setup:

- Install Shopify CLI: `npm i -g @shopify/cli` (Node 18+). The first command opens a browser sign-in.
- Optional: the Shopify plugin for Claude Code, `claude plugin install shopify-ai-toolkit@claude-plugins-official` (on some machines the marketplace is named `anthropic-plugin-directory`). It adds Shopify docs search and Liquid/GraphQL validation. It sends usage telemetry, including your prompt, to shopify.dev by default; opt out with `touch ~/.config/shopify-ai-toolkit/opt-out`.

Day-to-day, from the repo root (`shopify.theme.toml` holds the store, path and theme):

- `shopify theme dev -e dev`: local preview with hot reload. It asks for the storefront password.
- `shopify theme push -e dev`: upload to OUTRUN dev.
- `shopify theme check -e dev`: lint before pushing.
- Never push to the live theme while building. Publish only after sign-off.
