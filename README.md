# BH Key Distribuidora — site v1 (estático, pt-BR)

Site institucional + catálogo B2B da BH Key Distribuidora (chaves automóticas e
material para chaveiro). É o destino do QR code dos displays de balcão: abre em
celular, um só nível de scroll, botões grandes. O canal de pedido é o WhatsApp.

**Nada de e-commerce no v1:** sem carrinho, sem checkout, sem login, sem preços
na página (preço é "sobre consulta").

> **Dados de amostra:** os 14 itens do catálogo são fictícios, criados para
> demonstrar o layout. Estão marcados com `"amostra": true` no JSON e com um
> aviso visível no catálogo e em cada página de produto.
> O que falta vir do cliente está em [`PENDÊNCIAS.md`](PENDÊNCIAS.md).

---

## Como rodar

### A) Abrir direto da pasta (é o fluxo principal)

O `dist/` usa **caminhos relativos**, então funciona com duplo clique, sem
servidor e sem instalar nada:

1. Copie a pasta `dist/` para o PC do cliente (ou descompacte o zip lá).
2. Abra `dist/index.html` no navegador.

### B) Servidor local (opcional)

Útil para testar a rota de 404 e o comportamento de menu em celular real:

```bash
npm install     # só na primeira vez
npm run build   # regenera CSS, JS e o dist/
npm run serve   # http://localhost:4173
```

No Windows, `abrir-site.bat` faz 2 em 1: abre o `dist/index.html` direto, e se
você preferir servidor, `abrir-site.bat serve`.

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm run build` | `build:css` → `build:js` → `astro build`. Gera o `dist/`. |
| `npm run build:css` | Tailwind v4 CLI → `public/styles.css` (minificado) |
| `npm run build:js` | esbuild → `public/app.js` (bundle IIFE, minificado) |
| `npm run serve` | servidor estático em `dist/` (porta 4173) |
| `npm run dev` | Astro dev server (hot reload) |
| `node scripts/shot-mobile.mjs` | screenshots 390×844 + verificações (precisa de Playwright) |
| `node scripts/design-qa.mjs` | QA de contraste, alvo de toque, tipografia e foco |

---

## Estrutura

```
bhkey-site/
├── src/
│   ├── pages/            # 6 rotas: index, catalogo, sobre, como-comprar, contato, 404
│   │   └── produto/[slug].astro   # 14 páginas de produto (geradas do JSON)
│   ├── layouts/Base.astro
│   ├── components/       # Regua, ProdutoCard, AvisoAmostra, Icon
│   ├── config/site.js    # ← ÚNICA fonte do WhatsApp/Instagram
│   ├── data/catalogo.json# ← catálogo (14 itens de amostra)
│   ├── js/main.js        # filtro + busca + carrossel + motion
│   ├── lib/paths.js      # auxiliar de caminhos relativos
│   └── styles/main.css   # tokens Tailwind v4 (tema)
├── public/               # copiados sem mudança para dist/ (css, js, img, fonts)
├── scripts/              # build/QA (serve, shot-mobile, design-qa, crop-photos…)
├── dist/                 # ← build estático final (entrega)
└── screenshots/          # 390×844 por página
```

---

## Onde mexer no dia a dia

### Número do WhatsApp

**Um valor, em um lugar só:** [`src/config/site.js`](src/config/site.js)

```js
export const WHATSAPP_NUMERO = '5531999999999';  // ← PLACEHOLDER
```

Formato: `55` + DDD + número, **sem espaços, sem `+`, sem traços**.
Depois rode `npm run build`. Não há outro `wa.me` espalhado pelo código —
todos os 103 links saem desse valor via `linkWhatsApp()`.

### Conteúdo do catálogo

[`src/data/catalogo.json`](src/data/catalogo.json) — uma entrada por item:

```json
{
  "codigo": "BK-CV-101",
  "nome": "Chave canivete 2 botões com lâmina",
  "categoria": "chaves-canivete",
  "descricao": "…",
  "imagem": "det-chave-2.jpg",
  "amostra": true
}
```

`amostra: true` mantém o item marcado como dado de demonstração.
Ao trocar pelo catálogo real, mude para `false` e apague o `_aviso` do topo.

### Textos fixos

Missão, visão e valores de `src/pages/sobre.astro` são **cópia literal do
cliente** — não reescreva.

---

## Bibliotecas e por que estão aqui

| Biblioteca | Papel | Justificativa de uma linha |
|---|---|---|
| **Astro 7** | gerador estático | Output flat HTML sem JS de framework por padrão — o QR abre rápido no celular e o site roda de `file://`. |
| **Tailwind CSS v4** | estilos | Tokens custom no `@theme` (nada de look shadcn); CLI compilada no build, zero CSS em runtime. |
| **Motion** | microinteração | Um reveal contido + hover de card, com gating em `prefers-reduced-motion`. Nada que esconda conteúdo. |
| **Embla Carousel** | row de destaque | Arrasto no toque, sem dependência de CSS de scroll-snap, com fallback para scroll nativo se o JS falhar. |
| **Phosphor Icons** | ícones | SVG inline no build (via `Icon.astro`): sem CDN, sem emoji, herda a cor por `currentColor`. |
| **Fontshare** | tipografia | Clash Display (display) + Satoshi (texto) + Azeret Mono (códigos) — pareamento não-default, **auto-hospedado em `public/fonts/`, sem CDN em runtime**. |
| **esbuild** | bundle do JS | Bundle minificado de `main.js` (filtro, busca, carrossel) em um só arquivo. |
| **Playwright** | QA | Screenshots 390×844 e as verificações de interação/a11y. Só em dev. |

### Lenis (smooth scroll) — deliberadamente fora

O site é destino de QR code em celular e a faixa de destaque já usa arrasto.
Uma camada de smooth scroll **briga com o arrasto do carrossel**, adiciona
latência no primeiro toque e não melhora nada em página de catálogo. Scroll
nativo do navegador + Embla cobre o caso de uso; por isso Lenis ficou de fora.

---

## Verificação

`node scripts/design-qa.mjs` → **TUDO OK** (contraste AA, alvo de toque ≥40px,
corpo 16px, h1 32px, raio ≤8px, tracking, `text-wrap: balance`).

`node scripts/shot-mobile.mjs` → **todas as verificações passaram**:
screenshots 390×844 de home, catálogo, produto, sobre, como comprar, contato e
404, mais asserções de um `h1` por página, sem rolagem horizontal, sem imagem
quebrada, sem erro de console, filtro + busca + contador + estado vazio +
deep-link `?cat=`, setas do carrossel, menu mobile, anel de foco visível e uma
passagem **com JavaScript desabilitado**.

Build: 20 páginas, **zero caminhos absolutos** em `dist/` — o site abre
direto da pasta. Páginas aninhadas (`produto/`) usam prefixos `../`.

---

## Amostras de imagem

As fotos são recortes dos prints do Instagram do cliente, servindo como
placeholder até chegarem as fotos reais. Recortes com preço ou legenda
queimados na imagem foram excluídos.

---

## Conteúdo real × placeholder

| Status | Item |
|---|---|
| ✅ Real | Missão, visão e valores (literal do cliente) |
| ✅ Real | Categorias (4) e textos de página em pt-BR |
| ✅ Real | Ícones, fontes, logo, cores da marca |
| ⏳ Amostra | 14 itens de catálogo (marcados `amostra: true`) |
| ⏳ Amostra | Fotos (recortes do Instagram) |
| ⛔ Placeholder | Número do WhatsApp (`5531999999999`) |
| ⛔ Placeholder | Endereço, horário, pedido mínimo, regras de frete |

---

## v1.1 — correções da revisão independente (QA)

- Menu do celular fecha com a tecla Esc e devolve o foco ao botão.
- Título do card e links do contato com área de toque de 44px.
- Filtro e busca do catálogo passam a aparecer no endereço (`?cat=carcasas&q=chave`),
  então dá para mandar o link já filtrado; o campo vem preenchido ao abrir.
- Bloco de destaque deixou de falar em "oferta da semana" (a loja não confirmou
  esse programa); virou "Condição especial".
- `public/styles.css` regerado no build.
