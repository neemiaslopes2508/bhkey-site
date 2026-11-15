# Pendências — BH Key Distribuidora (v3)

O que precisa vir do cliente **antes de publicar**. Nada disso foi inventado no
site: aparece como "A definir" / "sobre consulta" / aviso de amostra.

> **Nota v3 (camada visual):** a reformulação visual (grafite, raio
> arredondado, Satoshi, header fixo, hero com foto única) mexeu **só em cor,
> tipografia e forma**. Nenhum texto, dado, número, link ou aviso foi alterado:
> missão/visão/valores continuam literais, o número do WhatsApp é o mesmo
> placeholder, os 14 itens seguem marcados como amostra e "sob consulta" não
> virou preço em lugar nenhum. As pendências abaixo continuam todas valendo.

## 1. Número do WhatsApp — 🔴 bloqueia publicação

- **Onde:** `src/config/site.js` → `WHATSAPP_NUMERO`
- **Valor atual:** `5531999999999` (placeholder, não é um número real)
- **Formato:** `55` + DDD + número, sem espaços, sem `+`, sem traços
- **Impacto:** todos os botões "Pedir no WhatsApp" do site (103 links) apontam
  para esse valor. Enquanto estiver errado, **nenhum pedido chega ao cliente**.

Depois de trocar: `npm run build`.

## 2. Endereço físico — 🟡

- **Onde:** `src/pages/contato.astro` e rodapé (footer)
- **Situação:** marcado como "A definir"
- **Mapa:** hoje é uma busca do Google Maps pelo nome "BHKEY Distribuidora".
  Com o endereço real, trocar por link direto (`https://maps.google.com/?q=…`).

## 3. Horário de funcionamento — 🟡

- **Onde:** `src/pages/contato.astro`, seção "Horário"
- **Situação:** "A definir"

## 4. Pedido mínimo — 🟡

- **Onde:** `src/pages/como-comprar.astro`, resumo do fluxo
- **Situação:** "A definir". O brief manda **não inventar valor**.

## 5. Regras de envio e prazo de entrega — 🟡

- **Onde:** `src/pages/como-comprar.astro`
- **Situação:** o site diz apenas "envio para todo o Brasil" e que prazo/custo
  são combinados no atendimento. Falta confirmar: prazo, custo de frete e
  se há faixa de valor para frete grátis.

## 6. Catálogo real — 🔴 bloqueia publicação

- **Onde:** `src/data/catalogo.json`
- **Situação:** os **14 itens são fictícios** (códigos `BK-CV-*`, `BK-CR-*`,
  `BK-CC-*`, `BK-CA-*`), criados só para demonstrar o layout. Todos marcados
  com `"amostra": true`, e há um aviso fixo no catálogo e em cada produto.
- **Precisamos:** lista real com código, nome, categoria, descrição e foto de
  cada item.
- **Ao trocar:** mude `amostra` para `false` e remova o campo `_aviso` do topo
  do JSON (ele é o que gera o aviso de amostra nas páginas).

## 7. Fotos dos produtos — 🟡

- **Hoje (v3):** fotos reais de catálogos públicos de distribuidoras, com fundo
  branco e 1000×1000, prefixo `v2-` em `public/img/produtos/` (14) e
  `public/img/categorias/` (4), sempre exibidas em ladrilho branco dentro de
  card grafite. `public/img/v2-hero.jpg` (capa 3:1 da v2) continua no projeto,
  mas a home e o Sobre passaram a usar uma foto de produto cada. Origem de cada
  uma em `v2-arte/ARTE.md`.
- **Necessário:** fotos próprias da loja. Ao chegar, substituir os arquivos
  **com os mesmos nomes** e rodar `npm run build` — nada mais muda.
- **Nota (foto errada):** `v2-controle-remoto-2-botoes-dobravel.jpg` mostra um
  remoto de **3 botões** para um item "2 botões com chave dobrável". É a foto
  mais próxima que existe na pasta (a chave dobrável está correta); trocar quando
  a loja mandar a foto do item real.
- **Nota (normalização):** `v2-braco-chave-em-branco.jpg` tinha fundo de papel
  cinza; foi segmentado para branco preservando o recorte e a geometria.

## 8. Bloco de destaque — 🟢 opcional

- **Onde:** `src/pages/index.astro`, bloco "Condição especial" (no v3 é um
  card grafite arredondado)
- **Situação:** o texto não promete mais uma "oferta da semana" (não havia
  confirmação de que a loja tenha esse programa). Hoje diz "condição especial,
  preço sob consulta" e leva ao WhatsApp. Se quiserem destacar um item
  específico, é só indicar qual — mantendo "sob consulta".

---

## Resumo

| # | Item | Status |
|---|---|---|
| 1 | Número do WhatsApp | 🔴 sem isso nada funciona |
| 6 | Catálogo real (itens/códigos) | 🔴 hoje é tudo amostra |
| 2 | Endereço | 🟡 "A definir" |
| 3 | Horário | 🟡 "A definir" |
| 4 | Pedido mínimo | 🟡 "A definir" |
| 5 | Prazo e frete | 🟡 "A definir" |
| 7 | Fotos reais | 🟡 placeholder do Instagram |
| 8 | Bloco de destaque | 🟢 opcional |
