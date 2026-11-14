# BH Key v1 — Brief para Pixel (design + frontend)

Você é dono de design e frontend. Ada construiu e validou a fundação; estenda, não reconstrua.
(Mensagens entre bots em inglês — este arquivo é o brief completo; responda ao Ada em inglês.)

## Locais (caminhos absolutos)
- Raiz do projeto (construir AQUI): `/home/ubuntu/.openmausbot/workspaces/7bef41fa-aeeb-44dd-8f9d-fa27f19a47ae/bhkey-site`
- Brief completo do cliente: `/home/ubuntu/.openmausbot/workspaces/7559e3de-1437-4d9c-bdf6-a92bb92549b9/bhkey/BRIEF.md` (LER PRIMEIRO)
- Imagens de referência (logo, prints do Instagram, copy Sobre): `/home/ubuntu/.openmausbot/workspaces/7559e3de-1437-4d9c-bdf6-a92bb92549b9/bhkey/references/`
- Se não conseguir escrever na raiz do projeto, construa no seu próprio workspace e reporte o caminho absoluto.

## O que já existe (validado — `npm run build` passa, 15 páginas, zero caminhos absolutos)
- Astro 7 static, `build.format=file` (HTML flat), Tailwind v4 CLI → `public/styles.css`, esbuild → `public/app.js`. Scripts: `npm run build`, `npm run serve` (serve dist/ na :4173).
- `src/styles/main.css`: tokens de design (`@theme`) — ink `#0d1015`, verde de marca `#85b339` (amostrado do logo do cliente), verde-ink `#4f7119` (AA sobre papel), papel `#f2f0e9`; fontes Clash Display (display) / Satoshi (corpo) / Azeret Mono (códigos), todas self-hosted em `public/fonts`. Inclui utilitários `label-caps` + `rule-hairline`, `focus-visible`, guarda `prefers-reduced-motion`.
- `src/config/site.js`: ÚNICA fonte do número de WhatsApp (placeholder `5531999999999`), mensagem de pré-preenchimento, URL do Instagram. `linkWhatsApp(msg)` monta links wa.me. NUNCA hardcode o número em outro lugar.
- `src/data/catalogo.json`: 14 itens de amostra em 4 categorias (chaves-canivete, controles-remotos, carcasas, chaves-automotivas), cada item com slug/codigo/nome/categoria/descricao/img/amostra:true, `_aviso` no topo marca como dado de amostra. Fotos já recortadas dos prints do cliente em `public/img/produtos/` (20 arquivos) + `editorial-*.jpg` para gente/estoque.
- `src/lib/paths.js`: `prefixFor(pathname)` — prefixo relativo por profundidade (`./` ou `../`). Todo link de asset/nav DEVE passar por ele (Base.astro mostra o padrão). Nunca caminho absoluto `/...` — o site tem que abrir via `file://`.
- `src/layouts/Base.astro`: header (logo, nav, CTA WhatsApp, botão Menu mobile), footer, skip link, slot. Você pode reestilizar — mantenha a lógica de paths, imports de config, lógica aria-current e landmarks.
- `src/js/main.js` (empacotado em app.js): menu mobile, filtro do catálogo (chips `data-filtro`) + busca (`#catalogo-busca`, ignora acentos, casa `data-nome` E `data.codigo`), contador (`#catalogo-contador`), estado vazio (`#catalogo-vazio`), reveals de motion (`[data-reveal]`) + hover de card, tudo com gate de `prefers-reduced-motion`.
- `src/pages/index.astro` e `src/pages/produto/[slug].astro` são STUBS de teste — substitua.
- Páginas de produto já funcionam: `getStaticPaths` do catalogo.json → `dist/produto/<slug>.html` com prefixes `../` corretos.

## Páginas a construir (pt-BR real, sem lorem, sem afirmações inventadas)
1. **Home**: hero com lockup da marca; ações rápidas (WhatsApp / Instagram / mapa — use busca do Google Maps por "BHKEY Distribuidora" pois endereço é TBD); categorias em destaque (4); UM bloco de oferta em destaque (sem preço — ofertas da semana no WhatsApp; preços "sob consulta"); CTA "Ver catálogo"; trust strip ESTÁTICO (Atende todo o Brasil · Envio · Pagamento via PIX — NÃO é marquee auto-rolante, isso é slop); row de produtos em destaque com Embla carousel.
2. **Catálogo**: chips de filtro (Todos + 4 categorias, ligados ao JS existente), input de busca, grid de cards (foto, código mono, nome, link "Pedir no WhatsApp" wa.me por item via `linkWhatsApp` com código+nome do item na mensagem), contador, estado vazio. Cards linkam para `produto/<slug>.html`.
3. **Produto** (14 páginas): foto, código, nome, categoria, descrição, aviso de dado de amostra, CTA grande "Pedir no WhatsApp", link de volta ao catálogo.
4. **Sobre**: CÓPIA EXATA do brief (missão/visão/valores verbatim — não reescreva):
   - Missão: "Fornecer produtos e soluções de alta qualidade no ramo de distribuição de material para chaveiro atuando com agilidade, confiança e compromisso com o cliente, sempre pautados na ética, no respeito e na busca contínua pela excelência."
   - Visão: "Ser reconhecida em todo o Brasil como a principal distribuidora de material para chaveiro, destacando-se pela inovação, confiabilidade e excelência no atendimento, promovendo relações duradouras e de valor com nossos clientes e parceiros."
   - Valores: Agilidade · Confiança · Compromisso com o cliente · Ética · Respeito · Sustentabilidade · Inovação.
5. **Como comprar**: passo a passo (navegar catálogo → enviar lista pelo WhatsApp → confirmar disponibilidade → pagar PIX → envio para todo o Brasil); pedido mínimo = "a definir" (TBD, NÃO invente valor); envio e pagamento via PIX (sem custos ou prazos de frete inventados).
6. **Contato**: CTA WhatsApp (da config), link Instagram, endereço e horário = marcadores "A definir" (TBD), link do mapa como acima.
7. **404** (pt-BR) com links para início/catálogo. Garanta `src/pages/404.astro`.
8. Header/footer consistentes em todas as páginas (Base.astro).

## Direção de design (do brief — estude antes de desenhar)
Catálogo industrial técnico com qualidade editorial: preto quase puro + verde de marca + papel off-white, fios hairline (1px), grid/labels de catálogo de peças, labels condensados uppercase, códigos monospaced, fotografia de produto grande e honesta. Precisa parecer o catálogo de uma distribuidora REAL — não uma landing de SaaS, não uma cópia do restaurante (aquele só mostra o padrão de card de uma tela).
Referências obrigatórias: https://www.inspora.design/ · https://impeccable.style/gallery/ · https://impeccable.style/slop (leia as 62 checks) · https://impeccable.style/neo-mirai/index.html
Libraries (obrigatórias, já instaladas): Astro, Tailwind v4 com tokens custom (sem look shadcn), Motion (motion.dev) para micro-interações contidas, Embla Carousel (row de destaque), Phosphor icons (SVGs de `@phosphor-icons/core` inline — sem emoji, sem CDN), Fontshare fonts (feito: Clash Display/Satoshi/Azeret Mono). Lenis: pule, a menos que smooth scroll realmente se pague neste site mobile de QR; justifique no README de qualquer forma.

## Regras anti-slop (de impeccable.style/slop — auto-check antes de terminar)
Sem gradientes roxo/azul, sem glassmorphism, sem halos com glow, sem texto em gradiente, sem hero genérico + três feature cards, sem card com ícone-tile acima do heading, sem badge/pílula acima do headline, sem hero headline gigante, sem ícones emoji, sem grid de cards flutuantes arredondados por toda parte (fios hairline e seções flat combinam com este catálogo), sem marquee auto-rolante, sem dot pulsante, sem Inter, sem centralizar-tudo, sem texto justificado, sem corpo em caixa-alta, sem lorem, sem números/testemónias/ratings inventados, contraste AA (4.5:1 corpo / 3:1 grande), focus visível, landmarks semânticos, headings em ordem (h1 por página, sem pular níveis), corpo >= 16px, `text-wrap: balance` nos headings.

## Restrições
- Mobile-first, tem que ficar bom em 390x844 (Poco X7 Pro). Destino de QR: touch targets grandes, CTAs ao alcance do polegar.
- Só estático, sem Cloudflare, sem deploy. Abre de pasta local (`file://`) — só caminhos relativos.
- Nenhum preço: apenas "sob consulta".
- Dados de amostra do catálogo continuam marcados como amostra (mantenha `_aviso` + flags `amostra`).
- Depois de construir: rode `npm run build` e corrija todos os erros. Verifique que dist/ não tem caminhos absolutos.

## Entrega
Reporte: o que construiu página a página, o tail exato da saída do `npm run build`, confirmação de zero caminhos absolutos, decisões de design tomadas, e o que deixou como placeholder de propósito. NÃO escreva README.md nem PENDÊNCIAS.md (Ada faz esses). Não toque em `C:\Projetos\bhkey`.
