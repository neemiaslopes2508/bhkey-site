# Pendências — BH Key Distribuidora (v1)

O que precisa vir do cliente **antes de publicar**. Nada disso foi inventado no
site: aparece como "A definir" / "sobre consulta" / aviso de amostra.

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

- **Hoje:** recortes dos prints do Instagram do cliente (`public/img/produtos/`),
  usados como placeholder.
- **Necessário:** fotos reais dos produtos, fundo neutro, boa resolução.
- **Nota:** dois recortes atuais são fracos — `det-remotos-2.jpg` (aparece um
  dedo) e `det-maos-pacotes.jpg` (borrado). Vale substituir junto.

## 8. Bloco de destaque — 🟢 opcional

- **Onde:** `src/pages/index.astro`, bloco "Condição especial"
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
