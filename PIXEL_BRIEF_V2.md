# BH Key v2 — passe de acabamento visual (brief para Pixel)

## Contexto

O cliente aprovou a v1.1 e pediu duas coisas: **fotos de produto reais** (feito,
por mim) e **acabamento profissional** (este é o seu trabalho). Não é redesign
de marca: a identidade preto+verde, a tipografia forte, os códigos em
monoespaçada e a estrutura de 5 páginas + 14 produtos + 404 continuam.

- Projeto: `/home/ubuntu/.openmausbot/workspaces/7bef41fa-aeeb-44dd-8f9d-fa27f19a47ae/bhkey-site-v2`
- Brief do cliente (leia primeiro): `/home/ubuntu/.openmausbot/workspaces/7559e3de-1437-4d9c-bdf6-a92bb92549b9/bhkey/v2-arte/BRIEF-V2.md`
- Stack: Astro 7 (output `build.format: 'file'`, HTML flat) + Tailwind v4 CLI
  (`src/styles/main.css` → `public/styles.css`) + esbuild (`src/js/main.js` →
  `public/app.js`). Build: `npm run build`.

## Já está pronto — não refaça nem desfaça

- `public/img/produtos/v2-<slug>.jpg` (14), `public/img/categorias/v2-<cat>.jpg` (4),
  `public/img/v2-hero.jpg` — fundo branco, finais. **Não edite nenhuma imagem.**
- `src/data/catalogo.json` já aponta para `img/produtos/v2-<slug>.jpg`.
- `src/pages/index.astro` (capa, grid de categorias, bloco "Condição especial") e
  `src/pages/sobre.astro` já usam as fotos novas.
- `scripts/crop-photos.mjs`, `detect-bands.mjs`, `detect-grid.mjs` foram removidos.
- `README.md` e `PENDÊNCIAS.md` são meus — não edite.
- Build está verde: 20 páginas.

## Sua tarefa: o passe de acabamento

### 1. Espaçamento em pontos de 8

- Declare os tokens no CSS (`--space-1: 8px` … `--space-8: 64px`, no `@theme` ou
  em `:root`) e use-os em todo lugar.
- Nada de 10px, 14px, 18px soltos. Com Tailwind isso significa: passos ímpares
  (`mt-9`=36, `gap-7`=28, `mt-5`=20, `py-7`=28, `mt-3`=12, `gap-5`=20) estão
  fora da escala e precisam virar o passo par mais próximo (`mt-8`/`mt-10`,
  `gap-8`, `mt-4`/`mt-6`, `py-8`, `mt-2`/`mt-4`, `gap-4`/`gap-6`).
  4px só em ajuste fino (deslocamento de ícone, offset de linha), nunca como
  espaço de layout.

### 2. Tipografia com escala fixa

- Escala alvo: **12 / 14 / 16 / 20 / 24 / 32 / 40 / 48** px.
- Hoje existem tamanhos fora dela: `label-caps` 11px, `text-lg` 18px,
  `text-3xl` 30px, `text-4xl` 36px, `text-[2.375rem]` 38px, `text-[2.75rem]` 44px,
  `text-[3.1rem]` 49.6px. Traga tudo para a escala, mantendo a hierarquia
  (h1 > h2 > corpo) e a diferença percebida entre os níveis.
- Alturas de linha coerentes por nível e **no máximo 2 pesos por tela**
  (hoje convivem 400/500/600/700 em várias páginas).

### 3. Alinhamento e coluna única

- Tudo alinhado na mesma coluna `.shell`, sem elementos "quase" alinhados
  (margens laterais, bordas de seção e réguas têm que cair na mesma linha).

### 4. Cantos, bordas e sombras — uma regra só

- A v1 é reta. **Mantenha reta** (raio 0) ou adote um raio único para o site
  inteiro — o que não pode é misturar. Hoje há `rounded` residual em nenhum
  lugar óbvio; confirme e documente a escolha no seu relatório.
- Uma regra de sombra só (provavelmente: nenhuma). Nada de sombra difusa em tudo.

### 5. Padrão único de componentes

Cards de produto, chips de filtro, botões, campo de busca, lista de itens,
menu e rodapé com o **mesmo** padrão de padding, altura e estados
(hover / focus / active / disabled). Hoje:
- `.btn` min-height 48px, `.btn-chip` 44px, input de busca 48px — ok, mas
  conferir se a régua é a mesma em todas as variantes.
- **Alvo de toque ≥ 44px em tudo que é clicável**: os links do rodapé estão em
  `min-h-10` (40px) e precisam subir para 44; mesmo checagem para links de menu,
  setas do carrossel, chips e qualquer `py-` que fique abaixo.
- Atualize o limiar de `scripts/design-qa.mjs` de 40px para 44px, para o check
  refletir o requisito da v2.

### 6. Hierarquia

- **Um `h1` por página** (já é verdade — mantenha).
- Seções com o mesmo par: régua (`Regua.astro`) + título + texto de apoio, com
  as mesmas margens em todas as seções.

### 7. Menos ruído

Corte texto repetido, ícone decorativo sem função e borda duplicada. Sem
inventar conteúdo novo.

### 8. Responsivo de verdade

Conferir **360, 390, 768, 1024 e 1440**: sem rolagem horizontal, sem texto
cortado ou sobreposto, alvos de toque ≥ 44px.

## Direção de design

Manter preto + verde, tipografia forte, códigos em monoespaçada. Combinar:
**Mobbin** (padrões reais de SaaS: navegação, filtros, listas, tabelas),
**Linear** (hierarquia, densidade, disciplina de espaçamento e estados),
**Refero** (organização de informação e microcomponentes), **Inspora**
(composição, cor e acabamento) e **Dribbble** (só detalhe de card). Nunca copiar
um deles. Evitar look de site gerado: gradiente roxo, glassmorphism, card
flutuante genérico, sombra em tudo, ícone colorido sem motivo, animação que
atrasa leitura.

## Não pode mudar

- 5 páginas + 14 páginas de produto + 404; estático, abrindo por `file://`
  (caminhos relativos, sem `/` absoluto no HTML).
- Busca sem acento, filtro por categoria, contador, estado vazio,
  `?cat=`/`?q=` na URL, carrossel com setas, menu mobile com Esc.
- Um único número de WhatsApp vindo de `src/config/site.js` (não edite esse
  arquivo). Nada de preço publicado.
- Copy em pt-BR; missão/visão/valores literais de `sobre.astro` — não reescreva.
- Sem carrinho, login, painel, Cloudflare, deploy.
- Continua valendo "DADOS DE AMOSTRA" no catálogo e nos produtos.

## O que é seu e o que é meu

- **Seu:** `src/**` (páginas, componentes, `src/styles/main.css`, `src/js/main.js`),
  `public/styles.css` e `public/app.js` regenerados pelo build,
  `scripts/design-qa.mjs` (limiar 44px).
- **Meu (não toque):** `README.md`, `PENDÊNCIAS.md`, `public/img/**`,
  `src/data/catalogo.json`, `src/config/site.js`, `screenshots/`, `dist/` (eu
  reviso), e o QA independente do Rigel depois.

## Critério de aceite para você

1. `npm run build` sai com **exit 0** e **20 páginas**.
2. `node scripts/design-qa.mjs` passa (com o limiar de toque em 44px).
3. `node scripts/shot-mobile.mjs` passa (390×844, sem erro de console, um h1
   por página, sem rolagem horizontal).
4. Relatório em inglês: o que mudou, arquivo por arquivo (ou por grupo), a
   escolha de raio/borda/sombria, o que ficou fora do passe e o que você não
   conseguiu verificar.
