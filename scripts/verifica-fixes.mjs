import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173';
const falhas = [];
const ok = (cond, msg, extra = '') => {
  console.log(`${cond ? 'OK  ' : 'FALHA'} ${msg}${extra ? ' — ' + extra : ''}`);
  if (!cond) falhas.push(msg);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

/* 1. Esc fecha o menu e devolve o foco */
await page.goto(`${base}/index.html`);
await page.click('#menu-toggle');
ok(await page.isVisible('#menu-mobile'), 'menu abre');
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
ok(!(await page.isVisible('#menu-mobile')), 'Esc fecha o menu');
ok((await page.getAttribute('#menu-toggle', 'aria-expanded')) === 'false', 'aria-expanded volta a false');
const focado = await page.evaluate(() => document.activeElement?.id);
ok(focado === 'menu-toggle', 'foco volta ao botão do menu', `foco=${focado}`);

/* 2. Filtro e busca sincronizam com o endereço */
await page.goto(`${base}/catalogo.html`);
await page.click('[data-filtro="carcasas"]');
await page.waitForTimeout(120);
let url = new URL(page.url());
ok(url.searchParams.get('cat') === 'carcasas', 'chip grava ?cat= no endereço', page.url().split('/').pop());
await page.fill('#catalogo-busca', 'carcaça');
await page.waitForTimeout(120);
url = new URL(page.url());
ok(url.searchParams.get('q') === 'carcaça', 'busca grava ?q= no endereço', page.url().split('/').pop());
await page.goto(`${base}/catalogo.html?cat=controles-remotos&q=3`);
await page.waitForTimeout(250);
const vis = await page.locator('[data-produto]:visible').count();
ok(vis >= 1, 'link com cat+q abre já filtrado', `${vis} itens`);
ok((await page.inputValue('#catalogo-busca')) === '3', 'campo de busca vem preenchido do endereço');

/* 3. Alvos de toque >= 40px nos links de texto antes pequenos */
await page.goto(`${base}/catalogo.html`);
const alturas = await page.evaluate(() =>
  [...document.querySelectorAll('[data-produto] h3 a')].slice(0, 4).map((a) => Math.round(a.getBoundingClientRect().height))
);
ok(alturas.every((h) => h >= 40), 'título do card do catálogo com alvo >= 40px', alturas.join('/'));

await page.goto(`${base}/contato.html`);
const h2 = await page.evaluate(() =>
  [...document.querySelectorAll('a')]
    .filter((a) => !a.classList.contains('btn') && !a.querySelector('svg[width="26"]'))
    .filter((a) => a.closest('main'))
    .map((a) => Math.round(a.getBoundingClientRect().height))
);
ok(h2.every((h) => h >= 40), 'links do contato com alvo >= 40px', h2.join('/'));

/* 4. Bloco de destaque sem prometer oferta semanal */
await page.goto(`${base}/index.html`);
const texto = await page.textContent('body');
ok(!/oferta da semana/i.test(texto), 'home não promete mais "oferta da semana"');
ok(/Condição especial/.test(texto), 'bloco de destaque usa "Condição especial"');

/* 5. Um único número de WhatsApp */
const wa = await page.evaluate(() => [...document.querySelectorAll('a[href^="https://wa.me/"]')].map((a) => a.href.split('?')[0]));
ok(new Set(wa).size === 1 && wa[0].endsWith('5531999999999'), 'um único número de WhatsApp', wa[0]);

await browser.close();
console.log(falhas.length ? `\n${falhas.length} FALHA(S)` : '\nTUDO OK');
process.exit(falhas.length ? 1 : 0);
