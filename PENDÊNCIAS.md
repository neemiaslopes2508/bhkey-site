# Pendências — BH Key Distribuidora (v4)

O que precisa vir do cliente **antes de publicar**. Nada disso foi inventado no
site: aparece como "A definir" / "sobre consulta" / aviso de amostra.

> **Nota v4 (lista de pedidos):** a v4 acrescentou a lista com quantidade,
> gaveta/folha, barra no celular e mensagem única de WhatsApp. A lista fica no
> navegador e **não reserva estoque**; ela é uma mensagem de orçamento. Nenhum
> preço, endereço, horário ou dado comercial novo foi inventado. As pendências
> abaixo continuam todas valendo.

## 1. Número do WhatsApp — 🔴 bloqueia publicação

- **Onde:** `src/config/site.js` → `WHATSAPP_NUMERO`
- **Valor atual:** `5531999999999` (placeholder, não é um número real)
- **Formato:** `55` + DDD + número, sem espaços, sem `+`, sem traços
- **Impacto:** todos os 102 links do build (header, rodapé, cards, páginas de
  produto e botão “Enviar pedido no WhatsApp” da lista) apontam para esse
  valor. Enquanto estiver errado, **nenhum pedido chega ao cliente**.

Depois de trocar: `npm run build`.

## 2. Endereço físico — 🟡

- **Onde:** `src/pages/contato.astro`, `src/pages/sobre.astro` e rodapé
- **Situação:** marcado como "A definir"
- **Mapa:** hoje é uma busca do Google Maps pelo nome "BHKEY Distribuidora".
  Com o endereço real, trocar por link direto (`https://maps.google.com/?q=…`).

## 3. Horário de funcionamento — 🟡

- **Onde:** `src/pages/contato.astro`, `src/pages/sobre.astro` e rodapé
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

- **Hoje:** fotos reais de catálogos públicos de distribuidoras, com fundo
  branco e 1000×1000, prefixo `v2-` em `public/img/produtos/` (14) e
  `public/img/categorias/` (4), sempre exibidas em ladrilho branco dentro de
  card grafite. Origem de cada uma em `v2-arte/ARTE.md`.
- **Necessário:** fotos próprias da loja. Ao chegar, substituir os arquivos
  **com os mesmos nomes** e rodar `npm run build` — nada mais muda.
- **Nota (foto errada):** `v2-controle-remoto-2-botoes-dobravel.jpg` mostra um
  remoto de **3 botões** para um item "2 botões com chave dobrável". É a foto
  mais próxima que existe na pasta; trocar quando a loja mandar a foto real.
- **Nota (normalização):** `v2-braco-chave-em-branco.jpg` tinha fundo de papel
  cinza; foi segmentado para branco preservando o recorte e a geometria.

## 8. Dados da lista de pedidos — 🟢 decisão do cliente

- A lista não pede nome, e-mail ou telefone: o contato acontece na conversa do
  WhatsApp. Se o cliente quiser identificar o pedido (nome da loja, cidade),
  isso entra como campo opcional na gaveta — não foi inventado.
- A lista fica no navegador de quem visita. Não há painel, banco de dados nem
  pedido armazenado no servidor. Se o cliente quiser receber os pedidos em
  outro canal além do WhatsApp, é um projeto à parte.

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
| 7 | Fotos reais | 🟡 foto placeholder do controle dobrável |
| 8 | Dados opcionais do pedido | 🟢 decisão do cliente |
