# BH Key Distribuidora — site v4 (estático, pt-BR)

Site institucional + catálogo B2B da BH Key Distribuidora (material para
chaveiro). É o destino do QR code dos displays de balcão: abre em celular,
com navegação curta, botões grandes e pedido montado no próprio site.

O fluxo é **catálogo → lista com quantidade → WhatsApp**. Não é e-commerce:
não há checkout, login, pagamento online nem preço publicado. O valor e a
disponibilidade são confirmados no atendimento.

> **Dados de amostra:** os 14 itens do catálogo são fictícios, criados para
> demonstrar o layout. Estão marcados com `"amostra": true` no JSON e com um
> aviso visível no catálogo e em cada página de produto.
> O que falta vir do cliente está em [`PENDÊNCIAS.md`](PENDÊNCIAS.md).

---

## O que a v4 acrescenta

- **Lista de pedidos** com quantidade por item, removê-los, limpar e enviar
  tudo em uma mensagem só de WhatsApp. A lista fica no `localStorage` do
  navegador (chave `bhkey:lista:v1`), sobrevive à troca de página e ao reload
  e não passa por servidor.
- **Adicionar à lista** nos cards do catálogo, nos destaques da home e na
  página do produto, com estado “Na lista · N” e aviso de confirmação.
- **Gaveta no desktop / folha inferior no celular**, com edição de quantidade
  e resumo do pedido. A mensagem leva código, nome e quantidade de cada item.
- **Barra fixa no celular** quando há itens, com contador e atalho para a lista.
- **Contador no cabeçalho** em todas as 20 páginas.
- **Busca por código tolerante a hífen**: `bkcv101`, `BK CV 101` e `BK-CV-101`
  chegam ao mesmo item; continua aceitando nome sem acento.
- **Acabamento v4**: raio 10/14/18/20, header com “Minha lista”, hero com
  faixa de confiança, categorias em 2 colunas no celular, seção de três passos
  e bloco institucional na home.

---

## Como rodar

### A) Abrir direto da pasta

O `dist/` usa **caminhos relativos**, então funciona com duplo clique, sem
servidor e sem instalar nada:

1. Copie a pasta `dist/` para o PC do cliente (ou descompacte o zip lá).
2. Abra `dist/index.html` no navegador.

Ao abrir por `file://`, alguns navegadores isolam o `localStorage`; a lista
funciona durante a visita, mas a persistência entre páginas é garantida mesmo
quando o site é servido (GitHub Pages, hospedagem normal).

### B) Servidor local (opcional)

```bash
npm install     # só na primeira vez
npm run build   # regenera CSS, JS e o dist/
npm run serve   # http://localhost:4173
```

No Windows, `abrir-site.bat` abre o `dist/index.html` direto; com `serve`,
sobe o servidor.

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm run build` | `build:css` → `build:js` → `astro build`. Gera o `dist/`. |
| `npm run build:css` | Tailwind v4 CLI → `public/styles.css` (minificado) |
| `npm run build:js` | esbuild → `public/app.js` (bundle IIFE, minificado) |
| `npm run serve` | servidor estático em `dist/` (porta 4173) |
| `npm run dev` | Astro dev server (hot reload) |
| `node scripts/qa-v4.mjs` | 20 páginas em 360/390/430, fluxo completo da lista, busca, deep links, links/assets e console. Precisa do `serve` na porta 4188. |
| `node scripts/qa-v4-visual.mjs` | screenshots de home/catálogo/produto e da gaveta (390 e 1440). |
| `node scripts/design-qa.mjs` | contraste, raio, tipografia, alvo de toque e sombra nas 20 páginas (file://). |
| `node scripts/viewport-check.mjs` | 360→1440: rolagem, menu, fontes e requisições. |
| `node scripts/shot-mobile.mjs` | screenshots 390×844 + verificações de interação e no-JS. |
| `node scripts/verifica-fixes.mjs` | Esc/foco do menu, deep links, alvos, único WhatsApp (com `serve`). |

---

## Estrutura

```
bhkey-site/
├── src/
│   ├── pages/            # index, catalogo, sobre, como-comprar, contato, 404
│   │   └── produto/[slug].astro   # 14 páginas de produto (geradas do JSON)
│   ├── layouts/Base.astro         # header, footer, botão da lista, <ListaPedido/>
│   ├── components/       # Regua, ProdutoCard, AvisoAmostra, ListaPedido, Icon
│   ├── config/site.js    # ← ÚNICA fonte do WhatsApp/Instagram e das mensagens
│   ├── data/catalogo.json# catálogo (14 itens de amostra)
│   ├── js/main.js        # menu, lista, busca, quantidade, carrossel
│   ├── js/lista.js       # estado da lista (localStorage) e link do WhatsApp
│   ├── lib/paths.js      # auxiliar de caminhos relativos
│   └── styles/main.css   # tokens Tailwind v4 + componentes
├── public/               # copiados sem mudança para dist/ (css, js, img, fonts)
├── scripts/              # build/QA
├── dist/                 # ← build estático final (entrega)
├── docs/                 # espelho do dist/ publicado no GitHub Pages
└── screenshots/          # 390×844 por página (gerado pelo shot-mobile)
```

---

## Onde mexer no dia a dia

### Número do WhatsApp

**Um valor, em um lugar só:** [`src/config/site.js`](src/config/site.js)

```js
export const WHATSAPP_NUMERO = '5531999999999';  // ← PLACEHOLDER
```

Formato: `55` + DDD + número, **sem espaços, sem `+`, sem traços**.
Depois rode `npm run build`. Todos os 102 links `wa.me` do build saem desse
valor, inclusive o da lista.

### Mensagens do WhatsApp

No mesmo arquivo:

- `WHATSAPP_MENSAGEM_PADRAO` — conversa geral.
- `MENSAGEM_PRODUTO(codigo, nome)` — pedido de um item.
- `MENSAGEM_LISTA(itens)` — lista completa, um item por linha:
  `• 2x BK-CV-101 — Chave canivete 2 botões com lâmina`.
- `linkWhatsApp(mensagem)` — monta o `wa.me` já codificado.

### Conteúdo do catálogo

[`src/data/catalogo.json`](src/data/catalogo.json) — uma entrada por item:

```json
{
  "slug": "chave-canivete-2-botoes",
  "codigo": "BK-CV-101",
  "nome": "Chave canivete 2 botões com lâmina",
  "categoria": "chaves-canivete",
  "descricao": "…",
  "img": "img/produtos/v2-chave-canivete-2-botoes.jpg",
  "amostra": true
}
```

`slug` é a URL da página; `img` é o caminho a partir de `public/`. O botão de
adicionar lê esses campos do próprio card — não há segunda lista de produtos.

`amostra: true` mantém o item marcado como demonstração. Ao trocar pelo
catálogo real, mude para `false` e apague o `_aviso` do topo.

### Textos fixos

Missão, visão e valores de `src/pages/sobre.astro` são **cópia literal do
cliente** — não reescreva.

---

## Como a lista funciona

- Estado em `src/js/lista.js`; UI em `src/js/main.js` e
  `src/components/ListaPedido.astro`.
- Cada linha guarda `slug`, `codigo`, `nome`, `categoria`, `img` e `qtd`
  (1 a 999). Itens com o mesmo `slug` somam quantidade.
- `localStorage` pode falhar (modo privado antigo, `file://` restrito); nesse
  caso a lista segue em memória durante a visita, sem quebrar a página.
- Abrir a gaveta usa `role="dialog"`, `aria-modal`, foco preso, Esc para
  fechar e devolução do foco ao botão de origem. A barra inferior some com a
  gaveta aberta e volta ao fechar.
- A lista **não reserva estoque**: é uma mensagem de orçamento.

---

## Bibliotecas e por que estão aqui

| Biblioteca | Papel | Justificativa |
|---|---|---|
| **Astro 7** | gerador estático | HTML plano, sem JS de framework; roda de `file://`. |
| **Tailwind CSS v4** | estilos | Tokens no `@theme`, CSS compilado no build, zero runtime. |
| **Embla Carousel** | destaques | Arrasto no toque com fallback para scroll nativo. |
| **Phosphor Icons** | ícones | SVG inline no build, sem CDN, herda `currentColor`. |
| **Satoshi / Azeret Mono** | tipografia | Auto-hospedadas em `public/fonts/`, sem CDN em runtime. |
| **esbuild** | bundle do JS | Um `app.js` minificado com menu, lista, busca e carrossel. |
| **Playwright** | QA | Fluxos, screenshots e auditoria de design. Só em dev. |

Sem framework de UI, sem biblioteca de estado, sem dependência nova para a
lista: `localStorage` + DOM resolve o caso de 14 itens.

---

## Verificação (v4)

- `node scripts/qa-v4.mjs` → **0 falhas**: 20 páginas em 360/390/430 sem
  rolagem horizontal e com um `h1`; fluxo de adicionar, somar, diminuir,
  remover, limpar, persistir no reload e montar a mensagem com os dois itens;
  busca `bkcv101`; filtro `?cat=` + `?q=`; estado vazio; 0 erro de console ou
  requisição falha; 0 link/asset quebrado.
- `node scripts/design-qa.mjs` → **TUDO OK** nas 20 páginas (contraste AA,
  alvos ≥48px com menu 44, raio 10–20/pill, Satoshi 700 com tracking −0.02em,
  sem peso 600, sem faixa clara, sombra única, `text-wrap: balance`).
- `node scripts/viewport-check.mjs` → **TUDO OK** em 360/390/430/768/1024/1440.
- `node scripts/shot-mobile.mjs` → **todas as verificações passaram**,
  inclusive carrossel, menu, foco e a passagem com JavaScript desabilitado.
- Build: **20 páginas**, 102 links de WhatsApp em um único número, **0 “R$”**,
  aviso de amostra em 15 páginas, `dist/` com 2,2 MB.

---

## Amostras de imagem

As fotos são de catálogos públicos de distribuidoras/lojas de chaves
brasileiras, usadas como ilustração de demonstração — **não é o estoque da
BH Key**. Fundo branco, 1000×1000 (categorias 1200×900), prefixo `v2-`.

| Arquivo | Uso |
|---|---|
| `public/img/produtos/v2-<slug>.jpg` | card, página do produto, hero da home e figura do Sobre |
| `public/img/categorias/v2-<categoria>.jpg` | cards de categoria da home |
| `public/img/v2-hero.jpg` | capa 3:1 antiga — mantida, não usada no layout |

Origem de cada foto em `v2-arte/ARTE.md` (pasta da v2). Ao chegar as fotos do
cliente, substitua os arquivos **com os mesmos nomes** e rode `npm run build`.

**Foto errada conhecida:** `v2-controle-remoto-2-botoes-dobravel.jpg` mostra um
remoto de 3 botões para o item “2 botões com chave dobrável”.

---

## Conteúdo real × placeholder

| Status | Item |
|---|---|
| ✅ Real | Missão, visão e valores (literal do cliente) |
| ✅ Real | Categorias (4), textos de página e identidade preto/verde |
| ✅ Real | Ícones, fontes, logo |
| ✅ Funcional | Lista, quantidades, busca, filtros, deep links, WhatsApp |
| ⏳ Amostra | 14 itens de catálogo (marcados `amostra: true`) |
| ⏳ Amostra | Fotos (catálogo de distribuidoras) |
| ⛔ Placeholder | Número do WhatsApp (`5531999999999`) |
| ⛔ Placeholder | Endereço, horário, pedido mínimo, regras de frete |

---

## Histórico curto

- **v1/v1.1** — site estático, catálogo, busca, WhatsApp.
- **v2** — fotos reais de catálogo, grid de 8 pontos, componentes únicos.
- **v3** — reformulação visual: grafite + verde, raio em tudo, Satoshi,
  header fixo, hero de foto única.
- **v4** — lista de pedidos com quantidade, gaveta/folha, barra mobile,
  contador no header, busca por código sem hífen e acabamento 14–20.
