# BH Key Distribuidora — site v3 (estático, pt-BR)

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
| `node scripts/design-qa.mjs` | QA de contraste, raio, tipografia, alvo de toque e sombra |
| `node scripts/viewport-check.mjs` | 360/390/430/768/1024/1440: rolagem, menu, fontes e fotos |
| `node scripts/verifica-fixes.mjs` | Esc/foco do menu, deep links, alvos, único WhatsApp (com `serve`) |

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
├── scripts/              # build/QA (serve, shot-mobile, design-qa, viewport-check…)
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
  "img": "img/produtos/v2-chave-canivete-2-botoes.jpg",
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
| **Motion** | microinteração | Transições de 150–200ms e elevação de card de no máximo 2px, com gating em `prefers-reduced-motion`. Nada que esconda conteúdo. |
| **Embla Carousel** | row de destaque | Arrasto no toque, sem dependência de CSS de scroll-snap, com fallback para scroll nativo se o JS falhar. |
| **Phosphor Icons** | ícones | SVG inline no build (via `Icon.astro`): sem CDN, sem emoji, herda a cor por `currentColor`. |
| **Fontshare** | tipografia | Satoshi (títulos 700 e corpo 400/500) + Azeret Mono (códigos) — **auto-hospedado em `public/fonts/`, sem CDN em runtime**. Clash Display saiu no v3. |
| **esbuild** | bundle do JS | Bundle minificado de `main.js` (filtro, busca, carrossel) em um só arquivo. |
| **Playwright** | QA | Screenshots 390×844 e as verificações de interação/a11y. Só em dev. |

### Lenis (smooth scroll) — deliberadamente fora

O site é destino de QR code em celular e a faixa de destaque já usa arrasto.
Uma camada de smooth scroll **briga com o arrasto do carrossel**, adiciona
latência no primeiro toque e não melhora nada em página de catálogo. Scroll
nativo do navegador + Embla cobre o caso de uso; por isso Lenis ficou de fora.

---

## Verificação

`node scripts/design-qa.mjs` → **TUDO OK** nas 20 páginas (todas as 14 de
produto incluídas; contraste AA, alvo de toque ≥48px com exceção única do botão
de menu (44×44, especificação da direção), corpo 16px, h1 32px, raio dentro da
escala 8/12/16/24/pill, títulos em Satoshi 700 com tracking −0.02em, sem peso
600, sem faixa clara full-bleed, sem matriz `gap-px`, a única sombra do site e
`text-wrap: balance`).

`node scripts/viewport-check.mjs` → **VIEWPORT: TUDO OK**: sem rolagem
horizontal em 360/390/430/768/1024/1440, botão de menu some no desktop, folha
do menu com raio 16 e alvos ≥48px (menu 44), fontes Satoshi/Azeret carregadas e
nenhuma requisição falha.

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

As fotos são de catálogos públicos de distribuidoras/lojas de chaves
brasileiras, usadas como ilustração de demonstração — **não é o estoque da
BH Key**. Foram normalizadas para fundo branco, 1000×1000 (categorias 1200×900,
capa 2100×700) e recebem o prefixo `v2-`:

| Arquivo | Uso |
|---|---|
| `public/img/produtos/v2-<slug>.jpg` | card e página de produto (14), hero da home, figura da página Sobre, bloco "Condição especial" |
| `public/img/categorias/v2-<categoria>.jpg` | cards de categoria da home (4) |
| `public/img/v2-hero.jpg` | capa 3:1 da v2 — **mantido no `public/` mas não é mais usado** no layout v3 |

Origem de cada foto documentada em `v2-arte/ARTE.md` (na pasta do projeto da
v2). Ao chegar as fotos do cliente, basta substituir os arquivos **com os
mesmos nomes** e rebuildar. Os recortes do Instagram da v1 foram removidos por
inteiro — nem `public/` nem `dist/` os têm mais.

---

## Conteúdo real × placeholder

| Status | Item |
|---|---|
| ✅ Real | Missão, visão e valores (literal do cliente) |
| ✅ Real | Categorias (4) e textos de página em pt-BR |
| ✅ Real | Ícones, fontes, logo, cores da marca |
| ⏳ Amostra | 14 itens de catálogo (marcados `amostra: true`) |
| ⏳ Amostra | Fotos (catálogo de distribuidoras — ver "Amostras de imagem") |
| ⛔ Placeholder | Número do WhatsApp (`5531999999999`) |
| ⛔ Placeholder | Endereço, horário, pedido mínimo, regras de frete |

---

## v1.1 — correções da revisão independente (QA)

- Menu do celular fecha com a tecla Esc e devolve o foco ao botão.
- Título do card e links do contato com área de toque de 48px.
- Filtro e busca do catálogo passam a aparecer no endereço (`?cat=carcasas&q=chave`),
  então dá para mandar o link já filtrado; o campo vem preenchido ao abrir.
- Bloco de destaque deixou de falar em "oferta da semana" (a loja não confirmou
  esse programa); virou "Condição especial".
- `public/styles.css` regerado no build.

---

## v2 — fotos reais + acabamento

Pedido do cliente sobre a v1.1 aprovada. **Não é redesign de marca**: identidade
preto/verde, tipografia forte, códigos em monoespaçada e a estrutura de 5
páginas continuam iguais.

- **Fotos**: os 14 itens, as 4 categorias, a capa da home e a página Sobre
  passam a usar fotos reais de catálogo (fundo branco, prefixo `v2-`).
  Nenhum recorte do Instagram sobra em `public/` nem em `dist/`.
  `v2-braco-chave-em-branco.jpg` teve o fundo de papel cinza normalizado para
  branco por segmentação de silhueta (mesmo recorte, mesma geometria).
- **Acabamento**: sistema de espaçamento em múltiplos de 8, escala de tipografia
  fixa, padrão único de componentes (card, chip, botão, busca, régua de seção,
  rodapé) e responsivo conferido em 360/390/768/1024/1440.
- **Removidos**: `scripts/crop-photos.mjs`, `scripts/detect-bands.mjs` e
  `scripts/detect-grid.mjs` — ferramentas da v1 que geravam os recortes.

---

## v3 — reformulação visual (mobile-first, premium)

Troca de camada visual por cima do v2 aprovado: **estrutura, textos, URLs,
comportamento e integrações não mudaram** — as 20 páginas e o catálogo são os
mesmos, e os testes de `shot-mobile.mjs`/`verifica-fixes.mjs` seguem verdes.

- **Cor — grafite**: base `#0b0d10`, superfícies `#12161a` / `#171c21`, fios
  `rgba(255,255,255,.08)`, texto `#f5f5ee` / `#a3abb4`, verde `#85b339`
  (pressionado `#4f7119`). Fora as duas faixas off-white ("Condição especial"
  na home e "Missão e visão" em Sobre), que viraram **card grafite com a cópia
  oficial intacta**. Único gradiente do site: o scrim escuro da foto da hero.
- **Raio**: tokens `--radius-sm/md/lg/xl/pill` (8/12/16/24/9999) — card,
  painel, chip, busca e CTAs arredondados. As matrizes `gap-px` do v2 viraram
  cards com respiro real de 12/16px. Uma única sombra no site
  (`--shadow-sheet`, cabeçalho + folha do menu).
- **Tipo**: Clash Display removida (`public/fonts/ClashDisplay-*.woff2`
  apagados). Satoshi 700 com −0.02em nos títulos, 400/500 no corpo, Azeret Mono
  só em códigos e rótulos; pesos usados: 400/500/700.
- **Header**: fixo, translúcido com `backdrop-blur(12px)`; botão de menu
  redondo 44px com SVG de traço 1.5 (ícone troca por CSS conforme
  `aria-expanded`); menu mobile em folha arredondada recuada 16px.
- **Hero**: composição única com **uma** foto de produto real em ladrilho
  branco dentro de card 24 (a faixa `img/v2-hero.jpg` saiu da home e do Sobre)
  + dois CTAs pill. Toda foto de fundo branco passa a morar em ladrilho branco
  dentro de card grafite.
- **Catálogo**: grade de 2 colunas no celular / 3 no tablet / 4 no desktop,
  busca pill de 48px, chips pill de 48px — os IDs e a lógica de filtro/busca
  são os mesmos da v2.
- **Motion**: 150–200ms, elevação de card ≤2px, tudo sob
  `prefers-reduced-motion`.
- **QA v3**: `design-qa.mjs` passou a cobrir as regras novas (escala de raio,
  tracking dos títulos, sem peso 600, sem faixa clara, sem `gap-px`, sombra
  única) e `scripts/viewport-check.mjs` é novo (larguras 360→1440, menu,
  fontes, requisições).
