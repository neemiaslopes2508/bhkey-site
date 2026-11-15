# BH Key Distribuidora — v3 visual reformulation (Pixel brief)

Owner: Pixel (design + build). Lead: Ada. QA: Rigel (independent, after build).
Source: copy of v2 in this folder. **v2 and v1 must not be modified. Never touch `C:\Projetos\bhkey`.**

Goal: same site, higher visual level — mobile-first, modern, elegant, premium
automotive-accessory e-commerce feel (Apple Store product presentation quality),
keeping the approved v2 structure, content and behaviour.

---

## 1. Colour — dark graphite

Keep `preto + verde` identity, move off pure black to graphite.

| Role | Value |
|---|---|
| Base / page background | `#0B0D10` |
| Surface 1 (cards, panels) | `#12161A` |
| Surface 2 (raised / inner) | `#171C21` |
| Hairline | `rgba(255,255,255,0.08)` default, `0.10` where a line must read |
| Text primary | `#F5F5EE` |
| Text secondary | `#A3ABB4` (8.4:1 on base — AA safe) |
| Accent green | `#85B339` (7.9:1 on base) |
| Green deep (pressed) | `#4F7119` |
| Focus ring | `2px solid #85B339`, offset 4px |

- **No purple / blue gradients.** The only gradient allowed is a soft dark
  scrim on the hero photo card (`linear-gradient` over black, ≤ 55% alpha).
- The two full-bleed off-white sections (`index.astro` "Condição especial",
  `sobre.astro` "Missão e visão") become **graphite surface cards** — a white
  full-width band is a hole in a dark premium layout. Official copy stays
  verbatim, only its colours change.
- Product photos are pure-white 1000×1000: mount them on a **white tile inside
  a graphite card**, so white never punches a hole straight into the page.

## 2. Radius — rounded everywhere

Radius scale (document as CSS tokens `--radius-sm/md/lg/xl/pill`):

| Token | Value | Use |
|---|---|---|
| sm | 8px | chips, small thumbs, inputs |
| md | 12px | buttons (non-pill), inputs, inner tiles |
| lg | 16px | cards, panels, menu sheet |
| xl | 20–24px | product cards, hero photo card (24), big panels |
| pill | 9999px | CTAs, chips, badges, search field |

- Photos in rounded frames; cards 16–20; hero photo card 24; buttons pill or 12.
- v2's radius 0 + hairline box grid (`gap-px` / `border border-ink-line`
  matrices) is the industrial look being removed → replace with real gaps
  (12/16px) and rounded cards.
- Shadows: **one soft shadow for the whole site** — header / mobile menu sheet
  only (`0 8px 32px rgba(0,0,0,.45)`). Everything else flat, separation by
  surface colour + hairline.

## 3. Type

- **Drop Clash Display** (the industrial display face) entirely.
- Headlines: **Satoshi 700, letter-spacing −0.02em**, `text-wrap: balance`.
- Body / controls: **Satoshi 400**, emphasis **Satoshi 500**.
- Mono (Azeret Mono) **only** for codes, eyebrow labels and small meta.
- Available weights are 400/500/700 only — do not request 600 (not shipped).
- Type scale unchanged: 12 / 14 / 16 / 20 / 24 / 32 / 40 / 48.
- Eyebrow labels (`Regua`, `label-caps`) may stay, **without** the full-width
  hairline rules — keep the label + optional right-side meta, drop the rule, or
  make it a short 24px accent tick.

## 4. Section-by-section

**Header (Base.astro)**
- Sticky, translucent graphite with `backdrop-filter: blur(12px)` and a
  hairline bottom border.
- Mobile: **44×44 round menu button** (`border-radius: 9999px`), inline SVG
  icon, stroke 1.5.
- Mobile menu becomes a **rounded sheet** (radius 16, inset 16px from the
  edges, surface-1, the one soft shadow), not a full-width bordered list.
- Keep: skip link, `aria-expanded`/`aria-controls`, Esc → close + focus
  return, WhatsApp pill CTA, current-page `aria-current`.

**Hero (index)**
- One product-led composition: large photo card, radius 24, soft dark
  gradient, headline + **two pill CTAs**.
- **Remove the 3-photo strip** (`img/v2-hero.jpg`, the grey-of-three shot).
  Use one real product photo (e.g. `img/produtos/v2-chave-canivete-2-botoes.jpg`)
  on a white tile inside the graphite card.
- Same for the `sobre.astro` figure that reuses `v2-hero.jpg`.

**Atalhos / Categorias / Destaques (index)**
- Cards radius 16–20, gap 12–16, hover lift `translateY(-2px)` max, 150–200ms ease.
- Category tiles: rounded photo frame, white tile behind the white-bg photo.
- Keep the Embla carousel, arrows become 48px round buttons.

**Catálogo**
- Mobile: **2-column card grid, square photos**; tablet 3; desktop 4.
- Search field: pill, radius 12–pill, 48px tall.
- Chips: pill, 48px, `aria-pressed` still drives the colour only.
- Empty state and counter stay exactly where they are (same IDs).

**Produto**
- Photo in a rounded (24) white tile inside a surface card; breadcrumb,
  code label, WhatsApp CTA unchanged in meaning.

**Como comprar / Contato / Sobre / 404**
- Same card + radius language; no layout or copy changes beyond colour/type.

**Footer**
- Surface-1 panel, hairline separators, same links and content.

**Motion**
- All transitions 150–200ms ease (or `cubic-bezier(.2,.8,.3,1)`), hover lift
  ≤ 2px, everything gated by the existing `prefers-reduced-motion` block.

**Spacing**
- 8pt grid for margins, paddings, gaps, heights: 8/16/24/32/40/48.
  4px only for optical adjustment. Mobile container padding 16–20px.
- Document the token scale in `src/styles/main.css` comments (v2 already has
  this habit — keep it, updated).

---

## 5. Hard constraints (do not break)

1. **Same 20 pages and URLs**: `index`, `catalogo`, `sobre`, `como-comprar`,
   `contato`, `404` + the 14 `src/data/catalogo.json` product pages.
2. **Catalog behaviour intact** (src/js/main.js): accent-insensitive search,
   category filter, counter, empty state, `?cat=` / `?q=` deep links,
   `history.replaceState` sync, WhatsApp prefilled links.
   IDs that must survive: `catalogo-busca`, `catalogo-grid`,
   `catalogo-contador`, `catalogo-vazio`, `[data-produto]`, `[data-filtro]`,
   `menu-toggle`, `menu-mobile`.
3. **One WhatsApp number** from `src/config/site.js` (`5531999999999`,
   placeholder). No prices anywhere — "sob consulta" only.
4. **Sample warnings** on `catalogo` and every product page (`AvisoAmostra`).
5. Static, relative paths, opens from `file://`; **fonts self-hosted**, no
   runtime CDN, no new npm dependencies.
6. Only the real v2 product photos in `public/img/`. No stock imagery, no
   invented claims, no copy or integration changes.
7. A11y: **one `<h1>` per page**, AA contrast, visible focus ring, keyboard
   menu, alt text kept, ≥48px touch targets (menu button stays 44×44 per direction §5), no horizontal scroll at 360px.

## 6. Done when

- `npm run build` exits 0 with **20 pages**.
- All seven design rules above visibly applied on every page.
- No console/page/request errors from `file://`.
- Screenshots at 360/390/430 taken by Rigel with no horizontal scroll.
- README + PENDÊNCIAS updated; zip `bhkey-site-v3.zip` produced.
