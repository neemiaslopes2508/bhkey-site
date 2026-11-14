// Verificação visual + funcional do build (mobile 390x844).
// Uso: node scripts/shot-mobile.mjs   (roda depois de npm run build)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const out = path.resolve('screenshots');
fs.mkdirSync(out, { recursive: true });
const base = `file://${root}/`;

const PAGES = [
  ['home', 'index.html'],
  ['catalogo', 'catalogo.html'],
  ['produto', 'produto/chave-canivete-2-botoes.html'],
  ['sobre', 'sobre.html'],
  ['como-comprar', 'como-comprar.html'],
  ['contato', 'contato.html'],
  ['404', '404.html'],
];

const problemas = [];
const nota = (ok, msg) => {
  console.log(`${ok ? 'OK  ' : 'FALHA'}  ${msg}`);
  if (!ok) problemas.push(msg);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'pt-BR',
});

for (const [nome, arquivo] of PAGES) {
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  page.on('pageerror', (e) => erros.push(String(e)));

  await page.goto(base + arquivo, { waitUntil: 'load' });
  // percorre a página para disparar as imagens lazy antes de checar
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        y += 500;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) requestAnimationFrame(step);
        else {
          window.scrollTo(0, 0);
          resolve();
        }
      };
      step();
    });
  });
  await page
    .waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 6000 })
    .catch(() => {});
  await page.waitForTimeout(250);

  const dados = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: document.documentElement.clientWidth,
    h1: document.querySelectorAll('h1').length,
    titulo: document.title,
    imgQuebradas: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length,
  }));

  nota(dados.h1 === 1, `${nome}: exatamente um h1 (achou ${dados.h1})`);
  nota(dados.scrollW <= dados.innerW, `${nome}: sem rolagem horizontal (doc ${dados.scrollW}px em viewport ${dados.innerW}px)`);
  nota(dados.imgQuebradas === 0, `${nome}: nenhuma imagem quebrada (${dados.imgQuebradas})`);
  nota(erros.length === 0, `${nome}: sem erro de console${erros.length ? ' → ' + erros.join(' | ') : ''}`);

  await page.screenshot({ path: path.join(out, `mobile-${nome}.jpg`), fullPage: true, type: 'jpeg', quality: 85 });
  await page.close();
}

// ---- catálogo: filtro, busca, estado vazio, contador ----
{
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  await page.goto(base + 'catalogo.html', { waitUntil: 'load' });

  const visiveis = () =>
    page.$$eval('#catalogo-grid [data-produto]', (els) => els.filter((e) => !e.classList.contains('hidden')).length);

  nota((await visiveis()) === 14, `catálogo: 14 itens visíveis no carregamento`);

  await page.click('[data-filtro="controles-remotos"]');
  nota((await visiveis()) === 4, `catálogo: chip "Controles remotos" mostra 4 itens (mostrou ${await visiveis()})`);
  nota(
    (await page.getAttribute('[data-filtro="controles-remotos"]', 'aria-pressed')) === 'true',
    'catálogo: aria-pressed atualizado no chip ativo'
  );
  nota((await page.textContent('#catalogo-contador')).includes('4 de 14'), `catálogo: contador "4 de 14" (mostrou "${(await page.textContent('#catalogo-contador')).trim()}")`);

  await page.click('[data-filtro="todos"]');
  await page.fill('#catalogo-busca', 'bk-cr-201');
  nota((await visiveis()) === 1, `catálogo: busca por código sem acento/case (mostrou ${await visiveis()})`);

  await page.fill('#catalogo-busca', 'remoto');
  nota((await visiveis()) === 5, `catálogo: busca por nome "remoto" (mostrou ${await visiveis()}, esperado 5)`);

  await page.fill('#catalogo-busca', 'zzzzz');
  nota(await page.isVisible('#catalogo-vazio'), 'catálogo: estado vazio aparece');
  nota((await visiveis()) === 0, 'catálogo: zero itens no estado vazio');

  await page.fill('#catalogo-busca', '');

  // deep link ?cat= via file://
  await page.goto(base + 'catalogo.html?cat=carcasas', { waitUntil: 'load' });
  const viaQuery = await visiveis();
  nota(viaQuery === 3, `catálogo: ?cat=carcasas abre filtrado em 3 itens (mostrou ${viaQuery})`);
  nota(erros.length === 0, `catálogo: sem erro de JS${erros.length ? ' → ' + erros.join(' | ') : ''}`);
  await page.close();
}

// ---- home: carrossel + menu mobile ----
{
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  await page.goto(base + 'index.html', { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const posicao = () =>
    page.$eval('[data-embla-container]', (el) => {
      const t = getComputedStyle(el).transform;
      if (!t || t === 'none') return 0;
      return new DOMMatrixReadOnly(t).m41;
    });

  const antes = await posicao();
  nota(await page.isDisabled('[data-embla-prev]'), 'home: seta anterior desabilitada no primeiro item');
  await page.click('[data-embla-next]');
  await page.waitForTimeout(600);
  const depois = await posicao();
  nota(depois < antes, `home: seta próxima avança o carrossel (translate ${antes} → ${depois}px)`);
  nota(
    (await page.$eval('[data-embla-viewport]', (el) => getComputedStyle(el).overflowX)) === 'hidden',
    'home: Embla assume a faixa (overflow-x hidden após o JS)'
  );
  nota(!(await page.isDisabled('[data-embla-prev]')), 'home: seta anterior habilita depois de avançar');

  await page.click('#menu-toggle');
  nota(await page.isVisible('#menu-mobile'), 'home: menu mobile abre');
  nota(
    (await page.getAttribute('#menu-toggle', 'aria-expanded')) === 'true',
    'home: aria-expanded=true no botão do menu'
  );
  await page.click('#menu-toggle');
  nota(!(await page.isVisible('#menu-mobile')), 'home: menu mobile fecha');

  nota(erros.length === 0, `home: sem erro de JS${erros.length ? ' → ' + erros.join(' | ') : ''}`);
  await page.close();
}

// ---- foco visível por teclado ----
{
  const page = await ctx.newPage();
  await page.goto(base + 'index.html', { waitUntil: 'load' });
  await page.keyboard.press('Tab');
  const foco = await page.evaluate(() => {
    const el = document.activeElement;
    const s = getComputedStyle(el);
    return { texto: (el.textContent || '').trim().slice(0, 40), outline: s.outlineStyle + ' ' + s.outlineWidth };
  });
  nota(foco.outline.startsWith('solid') && !foco.outline.includes('0px'), `foco: contorno visível no primeiro Tab ("${foco.texto}" · ${foco.outline})`);
  await page.close();
}

// ---- sem JavaScript: a página e o carrossel continuam usáveis ----
{
  const ctxNoJs = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  const page = await ctxNoJs.newPage();
  await page.goto(base + 'index.html', { waitUntil: 'load' });
  const estado = await page.$eval('[data-embla-viewport]', (el) => ({
    overflow: getComputedStyle(el).overflowX,
    rola: el.scrollWidth > el.clientWidth,
    altura: document.documentElement.scrollHeight,
  }));
  nota(
    estado.overflow === 'auto' && estado.rola,
    `sem JS: carrossel continua rolando na mão (overflow-x ${estado.overflow}, conteúdo maior que a caixa: ${estado.rola})`
  );
  nota(estado.altura > 844, `sem JS: página inteira renderiza (${estado.altura}px de altura)`);
  const menuAberto = await page.$eval(
    '#menu-mobile',
    (el) => getComputedStyle(el).display !== 'none'
  );
  nota(menuAberto, 'sem JS: menu mobile aberto — navegação utilizável');
  await ctxNoJs.close();
}

await browser.close();

console.log('');
console.log(problemas.length ? `${problemas.length} FALHA(S)` : 'TODAS AS VERIFICAÇÕES PASSARAM');
process.exit(problemas.length ? 1 : 0);
