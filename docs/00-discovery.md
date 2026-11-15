# OUTRUN theme — Phase 0 discovery

Status: Phase 0 complete, waiting for answers to the questions in §8. No theme code has been written.
Date: 2026-11-07

## Summary

- **The handoff is a working single-page prototype**, not static mockups: `index.html` (all CSS), `app.js` (router, English/Arabic copy, behaviors, mock cart), `three-scenes.js` (Three.js 3D scenes) and 10 photos. There's no README and there are no screenshots.
- **I rendered reference screenshots myself.** They cover every screen at 375, 768, 1280 and 1440px, plus the interactive states and Arabic/RTL. They're in [`docs/design-reference/`](design-reference/) and will be the parity baseline for Phases 4 and 6.
- **The designer already mapped each section to a planned Shopify section file** (`data-section="or-…"` plus `SCHEMA`/`THEME_NOTES` in `app.js`). That's a good starting map, but several of those notes don't match how Shopify works (§6.3).
- **The biggest decisions are:** how the product is structured in Shopify (§8 Q3), which font English body text uses (the design contradicts the brand book, C1), how much 3D and motion to keep (§6.6), and which placeholder data needs real values before launch (§8 Q7).
- **The brand palette mostly passes contrast. There are 6 failures**, all fixable: focus rings, input borders, error text, and text over the steel end of the "night" gradient (§2.1.4).

### Project context as found

| Item | Value | Source |
|---|---|---|
| Brand | OUTRUN. Descriptor "Exclusive Motion Gear". Tagline "Drive the feeling." | Brand Foundation p.15 |
| Store URL | **Unknown, need it (Q1).** The Shopify connection in this session also needs you to sign in again (`/mcp`). | — |
| Languages | English plus Egyptian Arabic (RTL). The prototype ships full copy in both. | `app.js` `T.en` / `T.ar` |
| Currency / markets | EGP (prototype placeholders). Egypt at launch, Saudi/Gulf later through a local partner. | `app.js`, Foundation p.32, p.36 |
| Handoff | `./Outrun Store Design/` | — |
| Brand | `./OUTRUN Branding/` | — |
| Apps | Unknown (Q10) | — |
| Customer accounts | Unknown (Q9) | — |
| Theme name | `outrun-theme` (proposed) | — |
| Tooling on this machine | Node 22, Python 3.13 (fontTools, PyMuPDF, Pillow), Chrome and Edge. **Shopify CLI is not installed** (Q1). | checked |

---

## 1. File inventory

### 1.1 Design handoff: `Outrun Store Design/`

| File | What it is | How I'll use it |
|---|---|---|
| `index.html` (550 lines of inline CSS) | Every design token (`:root`, `.dark`), every component style, responsive rules, motion keyframes, Arabic overrides. Also the empty DOM shell: header, main, footer, drawer, mobile menu, sticky add-to-cart, toast, dev panel. | Tokens go to `snippets/css-variables.liquid` and `assets/base.css`. Component CSS is split per section. |
| `app.js` (77 KB) | Hash router for 6 "pages"; full EN/AR copy (about 230 keys); page templates; fitment, collection, product, cart, notify and menu behavior; mock data (`PRICE`, `STOCK`, `MODELS`); Shopify handoff notes (`SCHEMA`, `THEME_NOTES`). | Copy is split two ways: UI strings go to `locales/*.json`, merchant content goes to section defaults. Behavior is re-implemented as vanilla custom elements. Mock data is replaced by Liquid objects, settings and metafields. |
| `three-scenes.js` (28 KB) | Three.js r160 procedural 3D: wheel, floating cap (shell, bearing, counterweight, emblem plate), hero scroll story, editions showcase, product 360° viewer, client-side 360° thumbnail renderer. | Adapted into `assets/outrun-3d.js`, with three.js self-hosted as a theme asset. Treated as progressive enhancement (§6.6). |
| `img/*.jpg` (10 files) | Photos. All are crops of the brand-book mockup renders. | Optimized and exported to `_upload-to-shopify-files/` as placeholders (§8 Q8). |

**Photos, and where the design uses them:**

| File | Pixels | Used in | Problem |
|---|---|---|---|
| `wheelspin.jpg` | 1100×1078 | Home hero fallback (the **LCP image**, full viewport), Made Here step 02, reel 04 | Too small for a full-bleed desktop hero (needs about 2400px wide) |
| `workshop.jpg` | **1600×375** | Made Here hero (min-height 88vh, full bleed), craft "Design" (4:3), step 01 (4:3) | A 4.3:1 strip cropped to a tall hero and to 4:3. Severe upscaling and cropping. |
| `caliper.jpg` | 1000×851 | Product viewer fallback, craft "Build", step 03, reel 02 (9:16) | 9:16 crop of a near-square image |
| `boxcaps.jpg` | 1500×602 | Editions fallback, craft "Finish", gift-box feature, cart thumbnail fallback | 4:3 crop of a 2.5:1 image |
| `carrear.jpg` | 1100×1152 | Craft "Test", workshop film poster (16:9, up to 1288px wide) | Upscaled in the 16:9 film |
| `carrear2.jpg` | 1000×1053 | Step 04, reel 03 | — |
| `drop.jpg` | 600×916 | Reel 01 (9:16) | Low resolution |
| `box.jpg` | 1500×633 | Gift checkbox thumbnail (64×44), gift product card (1:1), cart line | Fine for thumbnails |
| `ride.jpg` / `kart.jpg` | 700×437 / 700×430 | "Coming next" silhouette cards (4:3 and 16:10, up to about 1290px wide) | About 1.8× upscaled |

### 1.2 Brand: `OUTRUN Branding/`

| File(s) | What it is | How I'll use it |
|---|---|---|
| `Brand book/OUTRUN - Brand Book.pdf` (57 pp, v1.0) | Visual identity: logo rules, palette, gradients, type hierarchy, visual elements (gradient pattern, light streak, glowing word), photography, applications | Source of truth #2 for color, type, logo and imagery rules |
| `Documents/OUTRUN · Brand Foundation.pdf` (48 pp, Egyptian Arabic, v1.1) | Strategy: positioning, product lines, audiences, trust drivers, sales channels, launch risks | Business rules the theme has to support: COD, trust content, fitment, shipping transparency, launch makes |
| `Documents/OUTRUN Social Moodboard.pdf` (11 pp) | Social art direction; repeats the palette percentages; "Headlines SemiBold–Bold, Body Light, labels in spaced caps"; "Drop 01 · 50 pieces · numbered" | Cross-check for type and color usage |
| `Logo Pack/` (4 lockups × 7 colorways, SVG + PNG) | Horizontal, Stacked, Wordmark, Symbol, each in Cloud White, Deep Black, Deep Navy, Ice Blue, Steel Blue, Outline Cloud White and Outline Deep Navy. **Solid SVGs are a single `<path>` with one fill; outline SVGs are one stroked path plus a clip path**, so converting to `currentColor` is trivial. The logo includes a small © mark. | Header and menu logo snippet (horizontal), footer outline logo, symbol for the favicon and password page |
| `outrun logo.png` (1920², white) / `symbol.png` (1000², white) | Square app-style marks | Favicon source (symbol) |
| `Fonts and Colors/Fonts/` | Chakra Petch: 10 TTFs (300–700 plus italics). Changa: 7 static TTFs plus a variable font (wght 200–800). Both SIL OFL 1.1. | Self-hosted woff2 (§3) |
| `Fonts and Colors/Color_Slides`, `Typography_Slides` (5 PNG) | Same content as brand book pp. 31–37 | Reference only |
| `Applications/Mockups/` (15 PNG) | Brand-world renders: caliper, centre cap, poster, box, unboxing, plates, tags, patch, badge, apparel, helmet, racers, **website**, Facebook | Reference. `14_Website.png` shows a *different* site layout (C18). |
| `Applications/Social_Media/` (5 PNG) | Facebook/Instagram profile and cover images | `Facebook_Cover_1640x624.png` can be the default share (OG) image |

---

## 2. Extracted design tokens

### 2.1 Color

#### Brand palette (Brand Book p.31): "Five colors and one spark"

| Token | Hex | Brand role | Role in the design |
|---|---|---|---|
| `--black` Deep Black | `#05070A` | Depth (10%) | "Black" stages: hero story, editions, made-here hero |
| `--navy` Deep Navy | `#0A1E2E` | Primary (25%) | Ink text on light; dark-scheme background; solid buttons; drawer header; mobile menu |
| `--steel` Steel Blue | `#3E6F8F` | Secondary (20%) | Eyebrows on light; hover states; selected accents; start of the night gradient |
| `--ice` Ice Blue | `#BFD8E8` | Soft light (10%) | Eyebrows on dark; button hover on dark; progress and stock bars |
| `--cloud` Cloud White | `#F7FAFC` | Canvas (35%) | Light background; text on dark |
| `--blue` OUTRUN Blue | `#7ED3F6` | **Spark only, never a fill, under 10%** | Streaks, focus ring, active indicators, glows, status dots |

#### Semantic tokens: light scheme (`:root`) vs dark scheme (`.dark`)

| Role | Light | Dark (`.dark`) |
|---|---|---|
| background `--bg` | `#F7FAFC` | `#0A1E2E`; `.dark.black` → `#05070A`; `.dark.night` → `--grad` |
| surface `--surface` | `#FFFFFF` | `rgba(5,7,10,.4)` |
| text `--fg` | `#0A1E2E` | `#F7FAFC` |
| muted `--muted` | `#3C5A70` | `rgba(191,216,232,.72)` |
| eyebrow `--eyebrow` | `#3E6F8F` | `#BFD8E8` |
| border `--hair` / strong border `--hair-2` | navy at 12% / 24% | `rgba(220,231,239,.12)` / `.24` |
| primary button bg / fg / hover | `#0A1E2E` / `#F7FAFC` / `#3E6F8F` | `#F7FAFC` / `#0A1E2E` / `#BFD8E8` |
| glass (header, filter bar, sticky add-to-cart) | `rgba(247,250,252,.88)` + blur 14px | `rgba(10,30,46,.86)` |
| accent | OUTRUN Blue (spark) | OUTRUN Blue (spark) |
| **sale** | **not defined** (no sale state in the design) | — |
| **success** | not defined on light | OUTRUN Blue glowing dot plus text (`.ok`) |
| **error** | **not defined.** The prototype uses OUTRUN Blue text, which fails contrast. | — |

**Literal colors that aren't palette tokens:** `#3C5A70` (muted), `#E4EEF5` (bottom of the Air pattern), `#4A7FA1` (steel button hover, unused), and the radial-stage stops `#0F2A40`, `#12304A`, `#0A1724` and `#16324A`. All are tints between Navy and Steel. `--navy-2`, `.pattern-night`, `.hairgrid` and `.btn.steel` are defined but never used.

#### Gradients and patterns

| Name | Value | Used on |
|---|---|---|
| `--grad` ("night") | `linear-gradient(165deg, #3E6F8F 0%, #0A1E2E 60%, #05070A 100%)` | Page heads (Shop, Coming next, Support), heat-test band |
| `.pattern-air` | Radial white arc line plus `linear-gradient(180deg, #F7FAFC, #E4EEF5)` | Fitment, policy cards, product FAQ |
| Stage radials | `radial-gradient(… #0F2A40 → #05070A)` at 70–90% | Hero story, editions stage, product viewer |
| Product shot | `radial-gradient(70% 60% at 50% 45%, #12304A, #0A1724 70%)` | Product card image area |
| Brand gradients (p.33), **not used as-is** | Horizon: Navy → Steel → Ice. Night run: Black → Navy → Cloud. Open air: Steel → Ice → Cloud. | — (C7) |

**Glows:** `.glow-word` text-shadow stack (`0 0 18px` Ice, `0 0 60px` Blue at 45%, `0 0 120px` Steel at 60%); `.glowing`; `0 0 8–10px` Blue on dots and indicators; `0 0 18px` Blue at 25% on the spin toggle; drop-shadow on streaks.

#### 2.1.4 Contrast check (WCAG 2.2 AA)

Needs 4.5:1 for normal text, 3:1 for large text and UI component boundaries. RGBA values are composited over the actual background.

| Pairing | Ratio | Result |
|---|---|---|
| Ink on Cloud White (body) | 16.18 | ✅ |
| Muted `#3C5A70` on Cloud White / on `#E4EEF5` | 6.94 / 6.18 | ✅ |
| Steel eyebrow on Cloud White / White / `#E4EEF5` | 5.17 / 5.42 / 4.61 | ✅ (the last one is tight) |
| Cloud on Navy (solid button) / on Steel (hover) | 16.18 / 5.17 | ✅ |
| Muted nav link on light glass header over the dark hero | 5.33 | ✅ |
| Dark-muted (Ice 72%) on Navy / Black | 6.53 / 7.20 | ✅ |
| Ice eyebrow on Navy | 11.47 | ✅ |
| OUTRUN Blue text on Navy | 10.13 | ✅ |
| Card label on product shot `#12304A` | 7.08 | ✅ |
| **OUTRUN Blue text on Cloud White** (notify error message) | **1.60** | ❌ |
| **OUTRUN Blue focus ring on Cloud White** | **1.60** | ❌ (needs 3:1) |
| **Input/select border** (navy 24%) on White or Cloud | **1.67** | ❌ (form-field boundary needs 3:1) |
| **Dark border** (24%) on Navy | **1.97** | ❌ for inputs on dark (the fitment "other car" input, the notify input on dark) |
| **Dark-muted text on Steel** (top of the night gradient, page heads) | **2.68** | ❌ where text overlaps the steel area |
| **Ice eyebrow on Steel** (same area) | **3.67** | ❌ (12px text) |
| Cloud on `#4A7FA1` (steel button hover) | 4.14 | ❌, but the class is unused |
| Footer giant outline logo (16%) on Navy | 1.54 | Decorative (`aria-hidden`), so not a WCAG failure. It does break the brand's "no low contrast" logo rule (C6). |

Chips, make tiles and option buttons keep their hairline borders. Their text labels identify them and the selected state is a solid fill, so they pass. Fixes are proposed in Q14.

### 2.2 Typography

**Families**
- Display: **Chakra Petch** for headings, eyebrows, labels, nav, buttons, prices and numbers.
- Body (in the prototype): **Changa**, used for both English and Arabic body text. This conflicts with the brand book (C1).
- Fallback stack: `"Segoe UI", system-ui, sans-serif`.

**Arabic rules** (`:root[lang=ar]`)
- Headings (except `.latin`), eyebrows, labels, buttons, nav and chips switch to Changa with `letter-spacing: 0` (`.02em` on eyebrows and labels).
- H1/H2 line-height becomes 1.25.
- Brand lines stay in Chakra Petch as isolated LTR runs (`.latin` plus `unicode-bidi: isolate`).

**Fixed sizes**

| Style | Font / weight | Size / line-height | Tracking / case |
|---|---|---|---|
| Body | Changa 400 | 16 / 1.55 | — |
| Lead | body | 18, max 52ch, muted | — |
| Hero subhead | body | 17 (15 at ≤700px) | — |
| Headings (base) | Chakra 600 | 1.02 | −.01em, `text-wrap: balance` |
| Hero H1 | Chakra 700; third line 300 | `--t-hero`, lh .88 | −.015em, UPPERCASE |
| Glow word | Chakra 700 | lh .8 | −.02em, UPPERCASE |
| Eyebrow | Chakra 500 | 12 | .32em, UPPERCASE, 64px leading rule |
| Label | Chakra | 11 | .24em, UPPERCASE |
| Nav link | Chakra 500 | 12 | .2em, UPPERCASE |
| Button / small button | Chakra 600 | 13 / 11 (height 52 / 40) | .2em, UPPERCASE |
| Text link | Chakra | 12, 1px underline | .2em, UPPERCASE |
| Chip | Chakra | 13 (12 at ≤700px), height 38 (34) | .06em |
| Make tile | Chakra 600 20 (name) / 12 (label) | — | label .14em caps |
| Card title / price | Chakra 600 18 (15 at ≤520px) / 15 | — | — |
| Product price | Chakra 600 | 30 | tabular numerals |
| Option card title / caption | Chakra 600 15 / body 12 lh 1.3 | — | — |
| Spec value | Chakra 600 | 18 | — |
| Trust title | Chakra 600 | 14 | .1em caps |
| FAQ question | Chakra 500 | clamp(17, 1.6vw, 20) | — |
| Drawer title | Chakra 600 | 20 | .14em caps |
| Footer heading | Chakra 500 | 11 | .24em caps |
| Mobile menu links | Chakra 600 | 40 / 1.15 | — |
| Copy micro-button | Chakra | **10** | .2em caps (too small, see §6.6) |

**Fluid sizes**, as computed at the four QA widths:

| Token | clamp() | 375 | 768 | 1280 | 1440 |
|---|---|---|---|---|---|
| `--t-hero` (home H1) | 48px, 8.4vw, 128px | 48 | 65 | 108 | 121 |
| `--t-h2` (section H2) | 32px, 4.6vw, 64px | 32 | 35 | 59 | 64 |
| `--t-h3` (edition tab) | 22px, 2.2vw, 30px | 22 | 22 | 28 | 30 |
| Page head H1 | 40px, 6.4vw, 96px | 40 | 49 | 82 | 92 |
| Made Here hero H1 | 44px, 7vw, 108px | 44 | 54 | 90 | 101 |
| Product H1 | 34px, 4vw, 52px | 34 | 34 | 51 | 52 |
| Gift H2 / Step H2 | 30 (28)px, 3.6vw, 48px | 30/28 | 30/28 | 46 | 48 |
| Silhouette card H3 | 28px, 3.4vw, 44px | 28 | 28 | 44 | 44 |
| Step number (outlined, 300) | 64px, 9vw, 140px | 64 | 69 | 115 | 130 |
| Heat counter | 48px, 6vw, 84px | 48 | 48 | 77 | 84 |
| Glow word: hero / page head / made hero | (110, 19vw, 360) / (110, 22vw, 340) / (80, 15vw, 240) | 110/110/80 | 146/169/115 | 243/282/192 | 274/317/216 |

Brand hierarchy (Brand Book p.37, slide sizes): Eyebrow Medium caps · Display SemiBold · Headline SemiBold · **Body Light** · Arabic Changa Medium. Numbers use `font-variant-numeric: tabular-nums` (`.num`).

### 2.3 Spacing, layout, radii, borders, shadows

| Token | Value |
|---|---|
| Container `--wrap` | 1320px max |
| Gutters `--gut` / `--gutR` | `max(16px, env(safe-area-inset-*))` |
| Header `--hdr` | 64px, sticky, glass |
| Section padding | `clamp(72px, 11vw, 148px)`: 72 / 84 / 141 / 148 |
| Section head | gap 24px × 48px; margin-bottom `clamp(32px, 5vw, 64px)` |
| Page head padding | `clamp(64px, 10vw, 128px)` top, `clamp(40px, 6vw, 72px)` bottom |
| Gap values in use | 1 (hairline grids), 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48 px |
| Component padding | cards 18–22 · fit/policy cards 28 · drawer 20×24 · product buy column 48 (desktop) |
| Proposed spacing scale | 4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 64 · 72 · 96, plus the fluid section tokens. Exact one-off values stay where they matter for pixel parity. |
| Radius `--r` | **4px** everywhere. 2px for thumbnails, checkbox, toggle and bars. 50% for dots, swatches and round play buttons. |
| Borders | 1px hairlines (`--hair`, `--hair-2`); 1px dashed (note, upload); "hairline grid" pattern = `gap: 1px` over a `--hair` background (craft, collection grid, specs, contact, counters) |
| Shadows | **No elevation shadows.** Only blue glows. Backdrop blur: 14px (header), 12px (filter bar, sticky add-to-cart), 8px / 6px (controls on images), 4px (scrim). |
| Breakpoints (max-width) | 460 · 480 · 520 · 700 · 760 · 820 · 860 · 900 · 960 (product; `min-width: 961`) · 980. The 3D camera switches at 600 and 700. Also uses `(hover: hover)`, `(hover: none)` and `prefers-reduced-motion`. |
| Drawer width | `min(460px, 100%)` |
| Product layout | `1.2fr 1fr`. Viewer is sticky at `100vh − 64px` on desktop and `min(112vw, 560px)` at ≤960px. |

**How each grid collapses:**
- Makes: 4 → 2 (520)
- Reels: 4 → horizontal snap scroller at 64% card width (900)
- Craft: 4 → 2 (900) → 1 (520)
- Trust: 4 → 2 (900), stacked at 460
- Collection: 3 → 2 (980)
- Product: 2 → 1 (960)
- Specs: 4 → 2 (860)
- Policies: 3 → 1 (860)
- Contact: 4 → 2 (860) → 1 (480)
- Counters: 3 → 1 (700)
- Coming next: 2 → 1 (760)
- Gift: 1.25fr/1fr → 1 (860)
- Fitment: 1.1fr/1fr → 1 (860)
- Steps and notify: 2 → 1 (820)
- Footer: 1.4/1/1/1.2 → 2 (860) → 1 (480)

### 2.4 Motion

| Token | Value | Where |
|---|---|---|
| `--ease-out` (main) | `cubic-bezier(.2,.7,.2,1)` | Reveals, word rise, tab indicator, image zoom, toast |
| `--ease-menu` | `cubic-bezier(.7,0,.2,1)` | Mobile menu slide |
| `--ease-drawer` | `cubic-bezier(.7,0,.15,1)` | Cart drawer |
| `--ease-sweep` | `cubic-bezier(.45,0,.15,1)` | Section "headlight sweep" |
| `--ease-spin` | `cubic-bezier(.15,.8,.25,1)` | Cart wheel spin (1080° on add) |
| `--ease-streak` | `cubic-bezier(.3,0,.1,1)` / `(.4,0,.15,1)` | Hero and card streaks |
| Durations | .15 (calm) · .2–.3 (hover) · .4–.45 (scrim, toast, sticky bar) · .5 (indicator) · .6 (menu) · .7 (button sheen, drawer) · .8–.9 (page-in, reveals) · 1.05 (sweep) · 1.1 (word rise) · 1.2–1.6 (canvas fade, image zoom, count-up) · 2–2.4 (glow-in, mask sweep, scroll cue) · 6–9s loops (streaks, reel/film Ken Burns) | — |

- **Keyframes:** `rise`, `fadeUp`, `rule`, `glowIn`, `maskSweep`, `heroStreak`, `sweep`, `cardStreak`, `cardStreak2`, `dstreak`, `wheelSpin`, `cue`, `pulse`, `kb`, `bar`, `pageIn`.
- **Interactive motion:**
  - Magnetic buttons (hover devices only)
  - Button sheen and arrow nudge (4px)
  - Card image zoom (1.06); step image settle (1.08 → 1)
  - Scroll reveals (24px rise, below the fold only)
  - Count-up (1.6s)
  - Silhouette "light sweep" tied to scroll position
  - Top scroll-progress bar
- **3D:**
  - Hero scroll story: 5 stages over a **520vh** section — slow, push in, explode with part labels, reassemble, spin up.
  - Editions: hover or tap morphs the emblem (1s).
  - Product viewer: drag with inertia, auto-rotate after 2.5s idle, "Spin the wheel" toggle.
- **Reduced motion:** `prefers-reduced-motion` sets the default for a **"Calm motion" switch in the footer** (saved per visitor). Calm mode stops animations, sweeps, 3D spin and smooth scroll.

### 2.5 Icons and imagery

- **Icons:** inline SVG line icons, stroke 1.2–1.3, no fill, 24 or 26px viewBox.
  - Present: box, swap, shield, chat, menu (two unequal lines), close, upload, arrow (22×10), play (filled), and **wheel**, which is the cart icon (with count).
  - Missing (needed): search, account, plus/minus (quantity), check, alert, chevron, WhatsApp, social icons.
  - Plan: one SVG sprite snippet in the same style.
- **Imagery rules** (Brand Book p.43, moodboard p.9): cold blue-white light, graphite and black machines, low angles, macro close-ups, logo on the object, haze. No stock photos, no warm grading, no clutter.
- **Treatments in the design:** `saturate(.9)` on craft; `brightness(.55)` plus a bottom gradient on the Made Here hero; dark and lit masks on silhouettes; bottom gradient scrim on reels and film.
- **Aspect ratios:** product card 1:1 · reel 9:16 · craft, step and silhouette 4:3 · tall silhouette 16:10 · film 16:9 · cart thumbnail 1:1 (72px) · gift thumbnail 64×44 · editions stage `clamp(380px, 48vw, 620px)` tall.

### 2.6 Logo

- **Variants** (p.24): primary horizontal, stacked, wordmark, symbol, outline logo, outline symbol.
- **Colorways** (p.25): always dark on light or light on dark. Navy on Cloud, White on Navy, White on Steel, Navy on Ice, Black on Cloud, White on Black, Ice on Navy, White on Night gradient.
- **Clear space:** x = height of the symbol, kept clear on every side.
- **Minimum size:** 120px digital for the logo, 32px for the symbol.
- **Misuse:** no stretching, rotating, off-palette colors, effects, rearranging parts or low-contrast backgrounds.
- **In the design:**
  - A hand-traced horizontal logo (viewBox 1730×258, **no © mark**) at 20px tall, about 134px wide (passes the 120px minimum), in the header and mobile menu. Header clear space: about 16px around a 16px-tall symbol. Passes.
  - A full-width outline logo at 16% stroke in the footer.
  - The symbol on the 3D cap emblem.

---

## 3. Fonts

| | Chakra Petch (English) | Changa (Arabic) |
|---|---|---|
| Files present | 10 TTF: 300, 400, 500, 600, 700 plus italics | 7 static TTF (200–800) plus 1 variable TTF (wght 200–800) |
| Web formats present | **No.** TTF only. | **No.** TTF only. |
| License | SIL OFL 1.1, `fsType 0` (installable) → **self-hosting allowed** | SIL OFL 1.1, `fsType 0` → **self-hosting allowed** |
| Needs woff2 conversion | Yes. fontTools is installed; the Python `brotli` module needs `pip install brotli`. | Yes |
| Subsetting | Drop the 87 Thai glyphs. Keep Latin, Latin-1, Latin Ext-A, punctuation, → and currency. | Keep Arabic plus Latin. The variable font covers every weight in one file. |
| In Shopify's font library? | **Yes** (`chakra_petch_n3` … `chakra_petch_i7`, verified in shopify.dev docs) | **No.** And the library only ships Latin ranges, so Arabic would not render even if it were. |
| Weights the design uses | 300 (hero line 3, step numbers), 400, 500, 600, 700. No italics. | 400 (body), 500 (emphasis), 600 (Arabic headings) |

**Recommendation:**
- Self-host both as woff2 with `font-display: swap`. Load Changa with `unicode-range` limited to Arabic, so English pages never download it.
- Preload two files: Chakra Petch 600 (headings) and the body weight. On Arabic pages, preload the Changa variable file instead of the second Chakra weight.
- I won't use `font_picker`. The brand fixes the type and the Arabic font can't come from Shopify. A `font_picker` override for headings can be added later if you want merchant control.

---

## 4. Screen inventory

Six routes in the prototype map to Shopify templates.

**Reference screenshots** (rendered from the prototype in headless Chrome, WebGL on):
- `docs/design-reference/pages/<route>-<width>/NN.jpg`: each page captured one viewport at a time while scrolling, at 375, 768, 1280 and 1440px. Arabic/RTL versions are in `ar-<route>-<width>/` (375 and 1440). Viewport frames are used because full-page captures misplace the sticky header and the sticky 3D stage.
- `docs/design-reference/states/*.jpg`: the interactive states listed below, at 375 and 1440.

| Screen (prototype route) | Sections in order (`data-section`) | Planned template |
|---|---|---|
| Home `#home` | `or-hero-story` (black, 3D, 520vh) → `or-editions` (black, 3D) → `or-fitment` (Air) → `or-customer-videos` → `or-craft-strip` → `or-trust-bar` → `or-ride-kart-teaser` (dark) → `or-gift-box` | `index.json` |
| Shop `#shop` | `or-collection-header` (night) → `or-collection-grid` (sticky filters + grid) → `or-trust-bar` | `collection.json` |
| Product `#floating-caps` | `or-product-main` (sticky 3D viewer + buy column) → `or-product-specs` → `or-customer-videos` → `or-faq` (Air) | `product.json` (or `product.floating-caps.json`) |
| Made Here `#made-here` | `or-made-hero` → `or-craft-steps` → `or-heat-test` (night) → `or-video-feature` → `or-trust-bar` | `page.made-here.json` |
| Coming next `#coming-next` | `or-next-header` → `or-silhouette-reveal` (dark) → `or-notify-signup` | `page.coming-next.json` |
| Support `#support` | `or-support-header` → `or-policy-cards` (Air) → `or-contact` → `or-faq` | `page.support.json` |
| Global | Header (logo, 4-link nav, EN/AR toggle, wheel cart with count, menu button at ≤900px), full-screen mobile menu, cart drawer, footer (giant outline logo, 4 columns, base row with Calm, dev and language toggles), mobile sticky add-to-cart, toast, scroll-progress bar, page "headlight sweep" | `sections/header-group.json`, `footer-group.json`, cart drawer snippet |

### States the design shows

The design shows these states (captured in `docs/design-reference/states/`):

- **Home**
  - Hero, plus story stages 1–4 (part labels: emblem plate, shell, sealed bearing, counterweight)
  - Editions: hover or tap moves the active tab and morphs the cap
  - Fitment: idle → make chosen → make and model "ready" card → "Other" (free-text car plus a WhatsApp deep link)
  - Reels: idle and playing (hover on desktop, tap on touch)
  - Craft cards: hover zoom and streak
- **Collection**
  - Loading placeholder (pulsing ring) → 360° thumbnails
  - Filter chips pressed
  - Make = "Other" changes the badge to "Made in about a day"
  - Card hover: title turns steel, frames spin
  - **Empty state ("Nothing matches. Clear filters.")**: designed, but can't be reached with the prototype's data
- **Product**
  - Default (Signature / Gloss)
  - Edition change morphs the 3D cap; Custom reveals the upload dropzone (empty, drag-over, uploaded with a thumbnail)
  - Finish swatch change
  - Make/model selects (Other → "Made in about a day")
  - Gift-box checkbox (price is added in the sticky bar)
  - **Add to cart without fitment** → toast, outline, scroll to the field
  - **Add success** → drawer opens, toast, cart wheel spins
  - "Spin the wheel" on and off
  - Mobile sticky add-to-cart
  - FAQ open and closed
- **Made Here:** step reveals, count-up, film idle and playing
- **Coming next:** scroll-bound silhouette reveal; line chips (Both / Ride / Kart); **form error**; **form success**
- **Support:** Copy → "Copied" on contact tiles; FAQ
- **Global**
  - Current-page nav underline (`aria-current`)
  - EN ↔ AR with full RTL
  - Mobile menu open with staggered links
  - Cart drawer: **empty**, with items, with gift upsell, with gift already added; checkout disabled when empty
  - Toast
  - Calm mode

### States the design does not show (I'll design them in the same language)

- Sold out
- On sale (compare-at price)
- Unavailable variant combination
- Add-to-cart loading and error
- Quantity stepper (cart lines only show "× n", and there's no quantity on the product page)
- Cart line update error
- Discount display
- Search results and zero results; predictive search
- 404, password, gift card, blog/article
- Account pages
- Pagination and sort
- Footer newsletter success and error
- Long titles, long menus
- Header search and account icons
- Announcement bar
- Country/currency selector

---

## 5. Component inventory

| Component | Variants / states | Planned file |
|---|---|---|
| Button `.btn` | outline (default), `solid` (primary), `sm`, `block`, with arrow icon; hover sheen, arrow nudge, magnetic on hover devices; disabled | `snippets/button.liquid` + base CSS |
| Text link `.link` | caps with underline; hover turns steel | base CSS |
| Icon button | 40px; language pill (`EN / AR`), cart wheel with count and spin, menu | `snippets/icon.liquid` (sprite) |
| Eyebrow / label / lead | eyebrow with 64px rule that animates in; Arabic tracking | base CSS |
| Section head | eyebrow + H2 on one side, lead or link on the other; wraps | `snippets/section-head.liquid` |
| Glow word | hero, page-head and made-hero sizes; mask-sweep reveal | `snippets/glow-word.liquid` |
| Light streak | hero (looping), card (looping), drawer (on open), page sweep | CSS utility |
| Chip | default, pressed, hover; scroll row on mobile | base CSS |
| Make tile | default, pressed (navy fill, blue label) | fitment section |
| Fit card (dark) | waiting, ready (blue status dot), "other" with WhatsApp | fitment section |
| Edition tabs | 3 tabs, active has a glowing top rule | editions section |
| Option cards `.seg` | edition picker with caption, pressed | product variant picker |
| Swatch pill `.sw` | finish with gradient dot, pressed | variant picker plus `swatch` snippet |
| Field / input / select | label above, 48px; custom chevron that flips in RTL | base CSS |
| Note callout | dashed border, icon, inline link | base CSS |
| Upload dropzone | empty, drag-over, uploaded (thumbnail plus message) | product form (Custom) |
| Check row `.check` | checkbox, thumbnail, title, caption, price; checked | gift upsell (product page and drawer) |
| Price | product (30px), card, cart line, total; "EGP 3,200" format | `snippets/price.liquid` (money filters) |
| Stock meter | "37 of 120 sets left in Run 01" plus a bar | `snippets/stock-meter.liquid` |
| Badges | card badge (label style), "360°" tag, reel tag, phase label, `.ok` status dot | `snippets/badge.liquid` |
| Product card | 1:1 shot on a radial background, badge, 360° tag, label, title, subtitle, price plus "Set of 4"; hover spins frames | `snippets/product-card.liquid` |
| Reel card | 9:16, play button, meta, progress bar; playing state | customer-videos section |
| Craft card | 4:3 image, number, title, text; hover zoom and streak | craft-strip section |
| Trust item / mini-trust / policy card / cash-on-delivery note | icon, title, caption | `snippets/trust-item.liquid` |
| Silhouette card `.veil` | 4:3 and tall 16:10; scroll-bound light sweep; phase, name, caption, Notify button | silhouette and teaser sections |
| Gift feature | split image and text dark card, occasion chips, add button | gift-box section |
| Specs grid | label and value tiles | specs section |
| FAQ accordion | `<details>` with a +/− icon; first item open | faq section |
| Step | alternating image and text, outlined number | craft-steps section |
| Counter tiles | value, unit, caption; count-up | heat-test section |
| Film | 16:9 poster with play button; playing | video-feature section |
| Contact tiles | label, value, Copy button / WhatsApp link | contact section |
| Page head | night background, glow word, eyebrow, H1, lead | `page-header` section (shared) |
| Header / mobile menu / footer | see §4 | group sections |
| Cart drawer | navy header with count, lines (thumbnail, title, variant, fitment, "× qty", remove, price), cash-on-delivery note, gift upsell, subtotal, checkout, fine print, empty state | `sections/cart-drawer.liquid` |
| Sticky add-to-cart | mobile only, appears after the main button scrolls away | product section |
| Toast | `role="status"` | `snippets/toast` + JS |
| 3D stage | canvas, fallback image, fade-in when ready | `snippets/stage-3d.liquid` + `outrun-3d.js` |
| Story overlays | part labels (dot, line, text), step indicator, scroll cue, drop tag | hero-story section |
| Switch `.toggle` | Calm motion | footer |

---

## 6. Data gaps and Shopify mapping

### 6.1 Where design content will come from

| Design content | Shopify source |
|---|---|
| Product title, price, compare-at price, availability | `product` / `variant` objects through money filters. No hardcoded "EGP". |
| Edition × Finish choices | Product options *Edition* and *Finish* → native variant picker (radio inputs inside `{% form 'product' %}`) |
| Edition captions ("Your car's own badge, floating level.") | Section blocks keyed by option value name (translatable). Shopify option values have no description field. |
| Finish swatches (gradient dots) | `product_option_value.swatch` (color or image) if set in admin; otherwise a theme block mapping finish name → image or color |
| Stock meter "37 of 120 sets left" | `variant.inventory_quantity` (needs inventory tracking) plus metafield `outrun.run_size` |
| "Drop 01", "Run 01 · Limited" | Product metafield `outrun.drop_label` or section settings |
| Make and model for fitment | **Metaobject `fitment_make`** (name, list of models, status: launch or on-request) → home fitment, product selects, collection make chips. Saved on the order as line-item properties `Make` and `Model`. |
| Custom design upload | Line-item property file upload (`properties[Design file]`). Shopify supports file uploads in the product form (verified). Only shown for the Custom edition. |
| Gift box | Separate product chosen in theme settings (`product` setting). Used by the gift section, the product-page checkbox (added in the same `/cart/add.js` call) and the drawer upsell. |
| Gift card message ("include a note for the card") | Cart note, or a line-item property on the gift box |
| Collection 360° spin frames | Variant metafield `outrun.spin_frames` (`list.file_reference`), pre-rendered (§6.6) |
| 3D cap and wheel | Procedural (current), with optional product 3D-model media (.glb). **There's no `file` setting type**, so the prototype's "model_3d (file .glb)" can't be a section setting. |
| Emblem art (Street per make, Signature symbol, Custom placeholder) | Section `image_picker` settings |
| Customer reels | Section blocks: `video` setting (Shopify-hosted), poster image, car label, edition |
| Craft steps, policies, specs, heat counters, coming-next lines | Section blocks |
| FAQ (on Product and Support) | Metaobject `faq_item` (question, rich-text answer) with a `metaobject_list` setting, so it's edited once and reused. Section blocks are the fallback. |
| Trust items (in 4 places) | Global theme settings, edited once |
| WhatsApp, phone, email, workshop address, hours | Global theme settings. Also used to build `wa.me` links. |
| Navigation | Menus `main-menu` (Shop, Made Here, Coming next, Warranty & FAQ), `footer-shop`, `footer-help` |
| Collection page copy | `collection.title` / `collection.description` plus section settings (eyebrow, glow word) |
| Collection filters | `collection.filters` (Search & Discovery): Edition and Finish as variant-option filters, plus availability and price |
| Notify-me (Ride/Kart) | `{% form 'customer' %}` with `contact[tags]` (`notify-ride`, `notify-kart`). **Email is required by Shopify** (Q18). |
| Language toggle | `{% form 'localization' %}` with `localization.available_languages`; `<html dir="{{ request.locale.direction }}">` (verified) |

### 6.2 Metafields and metaobjects you'll need to create (proposed; final list in Phase 1)

| Definition | Type | Owner | Used by |
|---|---|---|---|
| `outrun.run_size` | integer | Product | Stock meter |
| `outrun.drop_label` | single-line text | Product | Eyebrows, badges |
| `outrun.fitment_required` | boolean | Product | Make/model validation (true for caps, false for the gift box) |
| `outrun.spin_frames` | list of files (images) | Variant | Collection hover spin |
| `outrun.install_video` | file (video) | Product | Install-video block (brand trust driver, C11) |
| Metaobject `fitment_make` | name, models (list), status, sort | — | Fitment section, product selects, collection chips |
| Metaobject `faq_item` | question, answer (rich text) | — | FAQ sections |

### 6.3 Corrections to the designer's Shopify notes (`SCHEMA` / `THEME_NOTES` in `app.js`)

1. **"model_3d (file .glb)" as a section setting:** no such setting type exists. Use product 3D media or keep the procedural model.
2. **"Chakra Petch + Changa via font_face filters":** Changa isn't in Shopify's library and the library has no Arabic glyphs. Self-host both (§3).
3. **"three@0.160 from the Shopify CDN as a theme asset":** correct approach. It's 655 KB raw / 162 KB gzipped, so Theme Check will warn on asset size; I'll document the justification.
4. **"Open before you pay copy lives in checkout.liquid extensibility settings":** `checkout.liquid` is deprecated. Checkout content outside Plus checkout extensibility is limited to the checkout editor and the payment method's *additional details* text.
5. **"Cash on delivery via Shopify Payments manual method":** COD is a *manual payment method*, separate from Shopify Payments. Please confirm Shopify Payments availability for an Egypt-based store in your admin; I believe card payments will need a third-party gateway (Q6).
6. **"Search & Discovery filters (make, edition, finish metafields)":** edition and finish are variant options (filterable natively). In the design every set fits every make, so "make" isn't a product attribute. It works as fitment context rather than a filter (Q21).
7. **"Gift box … (bundle in checkout)":** it's simply a second line item. No bundle app is needed.
8. **"Notify: customer form + WhatsApp opt-in field":** the customer form requires `contact[email]`; a WhatsApp-only signup isn't supported (Q18).

### 6.4 Areas Shopify hosts, where the theme can't fully control the design

| Area | What we can do |
|---|---|
| Checkout (including the thank-you and order status pages) | Brand through **Settings → Checkout** (logo, colors, button style, fonts; check that Chakra Petch is offered in the checkout font list). The cash-on-delivery "Open before you pay" text goes in the COD method's *additional details*. Custom blocks need Shopify Plus checkout extensibility. |
| New customer accounts | Hosted by Shopify. Branded in the same checkout/accounts editor. |
| Notification emails | Admin → Notifications (not part of the theme) |
| Arabic in checkout and accounts | Follows the published languages. Please verify RTL rendering once Arabic is published. |
| Arabic merchant content (section text) | `ar.json` covers theme UI strings only. Arabic versions of section text are entered in **Translate & Adapt**, or pushed with the Translations API if you give me access. |

### 6.5 Templates Shopify needs that the design doesn't cover

All will be designed in the same visual language:
- 404
- Search (results and empty), plus predictive search in the header
- Cart page `/cart` (needed for no-JS and as the drawer fallback)
- `list-collections`
- Generic `collection`, `product` (e.g. the gift box's own page) and `page`
- `page.contact` (a contact form; Support only lists contact details)
- Blog and article
- Password
- `gift_card.liquid`
- `customers/*` only if you choose classic accounts (Q9)

### 6.6 Design behavior I'd adapt for Shopify, and why

| # | In the design | Problem | Proposal |
|---|---|---|---|
| A1 | Single-page hash router with an animated "sweep" between pages | Shopify is multi-page | The sweep and page-in animation play on page load. Optionally add cross-document View Transitions (progressive). |
| A2 | Lenis smooth scroll from a CDN | External CDN (not allowed), extra JS, hurts accessibility and sticky behavior | Drop it and use native scrolling |
| A3 | Three.js (162 KB gzipped) on Home and Product, WebGL on mobile | Performance (Lighthouse mobile), battery | Keep as progressive enhancement: self-hosted, loaded only on templates that use it, after first paint, when near the viewport. The poster image is the LCP. Static image for reduced motion or no WebGL. |
| A4 | Collection thumbnails rendered in the browser (9 caps × 12 WebGL frames on every visit) | Heavy CPU before the grid is useful | Pre-render the frames once into images (I can do this with the prototype's own renderer) and store them as variant media or metafield |
| A5 | 520vh scroll story | About 5 screens of scrolling before any product; on mobile the content sits behind a long animation | Keep as designed, plus a visible "Skip intro" link and a merchant setting for story length |
| A6 | Many light streaks per page (looping hero, every section entry, looping fit card, craft hover, drawer) | Brand rule "one streak per layout" (C3); distracting | Keep the hero streak and the drawer streak; per-section sweeps off by default (setting) |
| A7 | "Reels" are photos with a Ken Burns zoom | Not real video; brand requires real customer footage | Real `video` blocks: muted, `playsinline`, play on hover or tap, visible pause control (WCAG 2.2.2) |
| A8 | Edition, finish, make, model and gift controls are `<button aria-pressed>` outside a form | No-JS add-to-cart fails; weaker semantics | Native radios, selects and checkbox inside `{% form 'product' %}`. Same visual design. |
| A9 | Edition tabs use `role="tablist"` without tab panels or arrow-key support | Incorrect ARIA | Full tabs pattern (arrow keys, `aria-controls`), or plain buttons |
| A10 | Cart drawer and mobile menu have no dialog role, focus trap or inert background | Keyboard and screen-reader users get lost | `<dialog>`/`aria-modal`, focus trap, Escape to close, return focus (already a non-negotiable) |
| A11 | 10–11px uppercase labels (Copy button at 10px) | Legibility | Minimum 11px; Copy at 11px |
| A12 | `body { overflow-x: hidden }` | Can break `position: sticky` in some browsers | Use `overflow-x: clip` |
| A13 | "Shopify sections" dev toggle in the footer | Prototype tool | Drop it. Keep the Calm motion switch (it's a good accessibility feature). |
| A14 | Header has no search or account | Required by the build plan | Add search (predictive overlay) and account icon buttons in the same style |
| A15 | No quantity selector anywhere | Customers can't buy 2 sets or fix the quantity in the cart | Add a quantity stepper on cart lines; product page quantity is a theme setting, off by default to match the design |
| A16 | Custom-design upload box at 375px | The text column collapses to one word per line beside the button (`states/pdp-custom-upload-375.jpg`) | Stack the button under the text below about 420px |
| A17 | Notify error message in OUTRUN Blue on a light background | Hard to read (`states/notify-error-375.jpg`, 1.6:1) | Ink text with an alert icon (Q15) |

---

## 7. Contradictions between the design and the brand guidelines

| # | Topic | Design | Brand guidelines | My recommendation |
|---|---|---|---|---|
| **C1** | **Body typeface** | Changa for all body text, English included | "Changa: **for Arabic only**. English always stays in Chakra Petch." Body = Chakra Petch **Light** (Brand Book p.36–37; moodboard p.8) | Follow the brand: Chakra Petch for all Latin text; Changa renders only Arabic glyphs through a font-stack fallback (Q5) |
| C2 | Launch fitment | Mercedes, BMW **and MG** | Mercedes and BMW at launch (Foundation p.20, Brand Book p.14) | Data-driven via metaobject; you decide (Q4) |
| C3 | Light streaks | Several per page (hero loop, every section entry, fit card loop, craft hover, drawer) | "**One streak per layout.** Flows left to right, rising. Never crosses the logo." (p.40) | Hero and drawer only; section sweeps off by default (A6) |
| C4 | Streak direction in Arabic | Kept left-to-right (`direction: ltr`) | Left to right (no RTL rule) | Keep left-to-right like the logo symbol; mirror only UI arrows, drawer side and carousels (Q13) |
| C5 | Logo artwork | Hand-traced logo, no © mark | Official artwork (Logo Pack), © included | Use the official SVGs |
| C6 | Footer outline logo | Outline logo at 16% stroke on navy (1.5:1) | "Don't place it on low contrast"; outline logo is White on dark | Keep the giant watermark (decorative) but raise the stroke so it reads, or confirm the design's intent (Q20) |
| C7 | Night gradient | Steel → Navy → Black at 165° | Brand gradients are Horizon, Night run and Open air (p.33) | Keep the design's version as the "Night" surface (in palette, close to the brand's Night pattern); offer the three brand gradients as color-scheme options |
| C8 | Off-palette tints | `#3C5A70`, `#E4EEF5`, `#0F2A40`, `#12304A`, `#0A1724`, `#4A7FA1` | "Five colors and one spark" | Keep them as documented palette mixes (they're Navy/Steel/Ice blends) |
| C9 | Light vs dark balance | Dark-led (hero, editions, teaser, footer dark; fitment, craft and FAQ light) | "Mostly light (35% Cloud White)" (p.32), yet the website page says "**Dark**, wide and fast to scan" (p.54) | The brand book contradicts itself; follow the design |
| C10 | Shipping transparency | "Taxes and delivery at checkout." | "Show the total early or include shipping in the price; hidden shipping fees kill the sale" (Foundation p.24, p.44) | Editable shipping message in the cart drawer and product page (Q6) |
| C11 | Trust content | No install video, no close-up finish video, no fitment table | "Short install video on every product page", "close-up video of every finish", "clear fitment table" (Foundation p.28) | Add optional product-page blocks: install video and finish close-ups (from product media) |
| C12 | Payment methods | Copy says cash on delivery only | Card **and** COD (Foundation p.32, p.43) | Copy stays editable; confirm gateways (Q6) |
| C13 | Drop size and numbering | "Run 01 · 37 of 120 sets left" | "Drop 01 · 50 pieces · numbered"; Signature editions numbered (Foundation p.13) | Real inventory drives the meter; numbering is out of scope unless you want it (Q19) |
| C14 | Descriptor | Meta description "floating wheel center caps" | Always "Exclusive Motion Gear" next to the name (Foundation p.15); moodboard says "Exclusive Auto Gear · Cairo"; packaging says "Automotive Accessories" | Use "Exclusive Motion Gear" in default SEO and footer copy |
| C15 | Imagery | Brand-mockup renders presented as "customer clips" and workshop photos | "No stock", "Prove it before you post it", "real customer videos on real cars" | Ship as placeholders only; replace before launch (Q8) |
| C16 | English lines kept in Arabic | Also keeps "Performance looks better here." and "Details move differently." in English | Fixed English brand lines: Drive the feeling. / Always ahead. Always noticed. / Nobody else has it. / Distinction in motion. / Exclusive Motion Gear | Minor. The merchant decides per field in Translate & Adapt. |
| C17 | Hero weight | Bold 700, with the last line Light 300 | Display = SemiBold (p.37); moodboard allows "SemiBold–Bold" and brand mockups show the same Bold/Light hero | No change |
| C18 | Website mockup | Handoff layout | Brand Book p.54 / `14_Website.png` shows a different site (light-blue hero, search bar, SHOP/CATEGORIES/ABOUT nav, trust icons) | Handoff wins on layout. I'll take only the header **search** from the mockup (A14). |

---

## 8. Open questions

### Need your answer before Phase 1

1. **Store and tools.** What's the store's `.myshopify.com` URL? The Shopify connection in this session needs you to sign in again (`/mcp`), and **Shopify CLI isn't installed** here.
   *Default:* I install `@shopify/cli` globally and only ever work on an unpublished development theme.
2. **Languages.** Launch with English plus Arabic (RTL)?
   *Default:* yes. English is the default language, Arabic second (Egyptian copy from the prototype). I ship `en.default.json`, `ar.json` and both schema locale files. Arabic section text is entered via Translate & Adapt.
3. **Product structure.**
   *Default:*
   - **One product**, "Floating Center Caps", with options *Edition* (Street / Signature / Custom) × *Finish* (Gloss Black / Satin Steel / Ice Chrome) = **9 variants**, priced per variant.
   - **Gift Box** as a separate product.
   - The collection grid shows **one card per variant**, as designed.
   - Make and Model are saved as line-item properties, validated against the fitment metaobject.
   - The Custom design upload is a file line-item property.

   The alternative is 9 or 3 separate products. That's simpler in admin but doesn't match the single product page in the design.
4. **Launch makes.** The brand says Mercedes and BMW; the design adds MG.
   *Default:* seed all three with the prototype's model lists; you edit the metaobject entries.
5. **Body font (C1).**
   *Default:* follow the brand. Chakra Petch for all English text: 400 for body at 16px, Light 300 only for leads at 18px and above, so small text stays readable. Changa only for Arabic.
6. **Payments and shipping.** Which payment methods: COD only, or COD plus a card gateway (e.g. Paymob)? Flat-rate, free or per-city shipping?
   *Default:* editable "Open before you pay" copy in the theme plus COD *additional details* in admin. An editable shipping line in the drawer so the total isn't a surprise.
7. **Real data.** Prices (EGP 3,200 / 3,900 / 250), run size (120 in the design vs 50 in the moodboard), heat-test figures (68 °C / 1,000 km / 0 lost), WhatsApp, phone, email, workshop address and hours are all placeholders.
   *Default:*
   - Everything becomes a setting or metafield, prefilled with the prototype values as clearly marked placeholders.
   - The stock meter reads real inventory.
   - Heat-test counters stay hidden until you enter real numbers (brand rule: no untested claims).
8. **Imagery.** Do higher-resolution originals or real product photos and videos exist?
   *Default:* ship the 10 current images optimized as placeholders in `_upload-to-shopify-files/` and list the sizes needed: hero ≥ 2400px wide, Made Here hero ≥ 2400×1350, reels as 1080×1920 MP4.
9. **Customer accounts.**
   *Default:* new customer accounts, so no `customers/*` templates; the account icon links to `/account`.
10. **Apps.** Reviews, WhatsApp chat, anything else?
    *Default:* none assumed. `@app` blocks in the product, featured-product, collection and cart-drawer sections, plus the footer.

### I'll go with these defaults unless you object

11. **3D:** keep it as described in A3. I pre-render the collection spin frames and poster images from the prototype's own renderer (A4).
12. **Motion:** drop Lenis; one hero streak plus the drawer streak; section sweeps off (setting); keep the Calm switch; drop the dev toggle.
13. **RTL:** streaks stay left-to-right like the logo. The drawer slides from the left, arrows flip, carousels and the progress bar mirror.
14. **Contrast fixes (visible changes):**
    - Focus ring becomes 2px Steel Blue on light backgrounds (OUTRUN Blue stays on dark).
    - Input and select borders darken to ≥ 3:1.
    - Error text never uses OUTRUN Blue on light.
    - Page-head text gets a soft scrim, or the night gradient's steel stop moves so text sits on navy.
15. **Status colors with no new hues:**
    - Error: ink text, alert icon, Steel border.
    - Sale: compare-at price struck through, plus a Navy badge with Ice text.
    - Sold out: muted badge and a disabled button saying "Sold out".
    - Success: OUTRUN Blue dot plus text.
16. **Header:** add search (predictive) and account icons; the language switch uses Shopify's localization form; the currency selector stays hidden until there's more than one market.
17. **Dynamic checkout button:** included under Add to cart, styled as the outline button; merchants can turn it off.
18. **Notify-me form:** email (required; creates a subscriber tagged `notify-ride` / `notify-kart`) plus a "Prefer WhatsApp? Message us" link, because Shopify's form requires an email.
19. **Signature numbering:** out of scope for now.
20. **Logo:** official SVG with © as an inline `currentColor` snippet, with an `image_picker` override in settings. The footer watermark uses the official outline logo, slightly stronger than 16%.
21. **Collection controls:**
    - Make chips set fitment context (badge text and the product page's prefilled make), as in the prototype.
    - Edition and Finish chips are real Search & Discovery filters.
    - I add a compact Sort select.
    - Pagination appears only when needed.
22. **Repo layout (Phase 1 detail):** `D:\Outrun` becomes the git root. The theme lives in `theme/` and docs in `docs/`. The handoff and brand folders stay read-only and are ignored by git (about 70 MB of binaries).
