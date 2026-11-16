# OUTRUN Shopify theme

Custom Online Store 2.0 theme for OUTRUN ("Exclusive Motion Gear"): English + Egyptian Arabic (RTL), EGP.

## Layout

| Folder | What it is | In git |
|---|---|---|
| `theme/` | **The Shopify theme.** The only folder that gets pushed to the store. Standard theme structure (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`, `blocks/`). | yes |
| `design-handoff/` | The designer's working prototype (`index.html`, `app.js`, `three-scenes.js`, `img/`). Read-only reference. Open `index.html` through a local server to view it. | yes |
| `docs/` | `00-discovery.md` (tokens, inventory, Shopify mapping, open questions), `design-reference/` (prototype screenshots at 375/768/1280/1440, EN + AR, used for design-parity checks), `licenses/` (font licenses). | yes |
| `store-files/` | Images that go into **Admin → Content → Files** or admin settings, not into the theme. | yes |
| `tools/` | Build scripts. | yes |
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

Setup:

- Install Shopify CLI: `npm i -g @shopify/cli` (Node 18+). The first command opens a browser sign-in.
- Optional: the Shopify plugin for Claude Code, `claude plugin install shopify-ai-toolkit@claude-plugins-official` (on some machines the marketplace is named `anthropic-plugin-directory`). It adds Shopify docs search and Liquid/GraphQL validation. It sends usage telemetry, including your prompt, to shopify.dev by default; opt out with `touch ~/.config/shopify-ai-toolkit/opt-out`.

Day-to-day, from the repo root (`shopify.theme.toml` holds the store, path and theme):

- `shopify theme dev -e dev`: local preview with hot reload. It asks for the storefront password.
- `shopify theme push -e dev`: upload to OUTRUN dev.
- `shopify theme check -e dev`: lint before pushing.
- Never push to the live theme while building. Publish only after sign-off.
