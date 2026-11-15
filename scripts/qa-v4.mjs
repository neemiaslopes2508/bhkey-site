import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:4188';
const RAIZ = path.resolve('dist');
const OUT = '/home/ubuntu/.openmausbot/task-workspaces/7559e3de-1437-4d9c-bdf6-a92bb92549b9/0e299f20-210e-4117-8084-faada233993c/qa-v4';
fs.mkdirSync(OUT, { recursive: true });

const paginas = [
  ...fs.readdirSync(RAIZ).filter((f) => f.endsWith('.html')).map((f) => '/' + f),
  ...fs.readdirSync(path.join(RAIZ, 'produto')).filter((f) => f.endsWith('.html')).map((f) => '/produto/' + f),
].sort();

const problemas = [];
const falhas = [];
const ok = (cond, msg) => {
  if (cond) return;
  falhas.push(msg);
  console.log('FALHA:', msg);
};

const browser = await chromium.launch();

for (const [largura, altura] of [[360, 800], [390, 844], [430, 932]]) {
  const contexto = await browser.newContext({ viewport: { width: largura, height: altura } });
  const page = await contexto.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problemas.push(`${largura} console: ${m.text()}`); });
  page.on('pageerror', (e) => problemas.push(`${largura} pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problemas.push(`${largura} requestfailed: ${r.url()}`));

  for (const rota of paginas) {
    await page.goto(BASE + rota, { waitUntil: 'networkidle' });
    const medida = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
    }));
    ok(medida.scroll <= medida.client + 1, `${largura} ${rota}: rolagem horizontal ${medida.scroll} > ${medida.client}`);
    ok(medida.h1 === 1, `${largura} ${rota}: ${medida.h1} h1`);
  }

  const page2 = await contexto.newPage();
  await page2.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await page2.screenshot({ path: `${OUT}/home-${largura}.png`, fullPage: true });
  await page2.goto(BASE + '/catalogo.html', { waitUntil: 'networkidle' });
  await page2.screenshot({ path: `${OUT}/catalogo-${largura}.png`, fullPage: true });
  await contexto.close();
  console.log('viewport', largura, 'ok');
}

/* ------------------------------ fluxo de lista ---------------------------- */
const contexto = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await contexto.newPage();
page.on('console', (m) => { if (m.type() === 'error') problemas.push(`fluxo console: ${m.text()}`); });
page.on('pageerror', (e) => problemas.push(`fluxo pageerror: ${e.message}`));
page.on('requestfailed', (r) => problemas.push(`fluxo requestfailed: ${r.url()}`));

await page.goto(BASE + '/catalogo.html', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });

ok((await page.locator('[data-produto]').count()) === 14, 'catálogo não tem 14 itens');

// adicionar duas vezes o primeiro
await page.locator('[data-add]').first().click();
await page.waitForTimeout(120);
ok((await page.locator('#lista-barra').isVisible()), 'barra não apareceu');
ok((await page.locator('.btn-lista .btn-lista-contador').innerText()) === '1', 'contador inicial != 1');
await page.locator('[data-add]').first().click();
await page.waitForTimeout(120);
ok((await page.locator('.btn-lista .btn-lista-contador').innerText()) === '2', 'segundo clique não incrementou');
ok((await page.locator('[data-add]').first().innerText()).includes('Na lista'), 'botão não virou "Na lista"');

// abrir gaveta e editar quantidade
await page.locator('#lista-barra [data-lista-abrir]').click();
await page.waitForTimeout(350);
ok(await page.locator('#lista-painel').isVisible(), 'gaveta não abriu');
ok((await page.locator('.lista-item').count()) === 1, 'gaveta deveria ter 1 linha');
ok((await page.locator('.lista-item .stepper-valor').innerText()) === '2', 'quantidade não é 2');
await page.locator('.lista-item [data-acao="menos"]').click();
await page.waitForTimeout(100);
ok((await page.locator('#lista-total-qtd').innerText()) === '1', 'menos não reduziu');
await page.locator('.lista-item [data-acao="mais"]').click();
await page.waitForTimeout(100);
ok((await page.locator('#lista-total-qtd').innerText()) === '2', 'mais não aumentou');

// remover
await page.locator('.lista-item [data-acao="remover"]').click();
await page.waitForTimeout(100);
ok(await page.locator('#lista-vazia').isVisible(), 'estado vazio não apareceu após remover');
await page.keyboard.press('Escape');
await page.waitForTimeout(250);
ok(!(await page.locator('#lista-painel').isVisible()), 'Esc não fechou a gaveta');
ok(!(await page.locator('#lista-barra').isVisible()), 'barra continuou com lista vazia');

// dois itens e mensagem
await page.locator('[data-add]').nth(0).click();
await page.locator('[data-add]').nth(4).click();
await page.waitForTimeout(150);
await page.locator('.btn-lista').click();
await page.waitForTimeout(350);
ok((await page.locator('.lista-item').count()) === 2, 'gaveta deveria ter 2 linhas');
const href = await page.locator('#lista-whatsapp').getAttribute('href');
const msg = decodeURIComponent(href);
ok(msg.includes('BK-CV-101') && msg.includes('BK-CR-201'), 'mensagem sem os dois códigos');
ok(msg.includes('1x BK-CV-101') && msg.includes('1x BK-CR-201'), 'mensagem sem quantidade 1x');
ok(msg.includes('Total: 2 itens'), 'mensagem sem total');
ok(href.startsWith('https://wa.me/5531999999999?text='), 'número de WhatsApp inesperado');

// persistência
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(150);
ok((await page.locator('.btn-lista .btn-lista-contador').innerText()) === '2', 'lista não persistiu no reload');
ok(await page.locator('#lista-barra').isVisible(), 'barra não voltou após reload');

// limpar em dois toques
await page.locator('.btn-lista').click();
await page.waitForTimeout(300);
await page.locator('#lista-limpar').click();
ok((await page.locator('#lista-limpar').innerText()).includes('Confirmar'), 'limpar não pediu confirmação');
await page.locator('#lista-limpar').click();
await page.waitForTimeout(150);
ok(await page.locator('#lista-vazia').isVisible(), 'lista não esvaziou');
ok(await page.locator('.btn-lista .btn-lista-contador').isHidden(), 'contador não sumiu');
await page.keyboard.press('Escape');

// busca por código sem hífen
await page.goto(BASE + '/catalogo.html?q=bkcv101', { waitUntil: 'networkidle' });
ok((await page.locator('[data-produto]:visible').count()) === 1, 'busca bkcv101 não achou 1');
ok((await page.locator('#catalogo-contador').innerText()).toLowerCase().includes('1 de 14'), 'contador da busca errado');

// limpar busca
await page.locator('#catalogo-limpar').click();
await page.waitForTimeout(100);
ok((await page.locator('[data-produto]:visible').count()) === 14, 'limpar busca não restaurou 14');
ok(await page.locator('#catalogo-limpar').isHidden(), 'botão limpar continuou visível');

// categoria + termo
await page.goto(BASE + '/catalogo.html?cat=controles-remotos&q=controle', { waitUntil: 'networkidle' });
ok((await page.locator('[data-produto]:visible').count()) === 4, 'filtro categoria+termo não deu 4');

// vazio
await page.goto(BASE + '/catalogo.html?q=zzzz', { waitUntil: 'networkidle' });
ok(await page.locator('#catalogo-vazio').isVisible(), 'estado vazio da busca não apareceu');

// produto: quantidade 3 e adicionar
await page.goto(BASE + '/produto/chave-canivete-2-botoes.html', { waitUntil: 'networkidle' });
await page.locator('#produto-qtd').fill('3');
await page.locator('#produto-qtd').blur();
await page.locator('[data-add]').click();
await page.waitForTimeout(150);
ok((await page.locator('.btn-lista .btn-lista-contador').innerText()) === '3', 'produto não adicionou 3');
await page.locator('.btn-lista').click();
await page.waitForTimeout(300);
const msg2 = decodeURIComponent(await page.locator('#lista-whatsapp').getAttribute('href'));
ok(msg2.includes('3x BK-CV-101'), 'mensagem do produto sem 3x');
await page.keyboard.press('Escape');

// menu mobile
await page.locator('#menu-toggle').click();
ok(await page.locator('#menu-mobile').isVisible(), 'menu mobile não abriu');
await page.keyboard.press('Escape');
ok(!(await page.locator('#menu-mobile').isVisible()), 'menu mobile não fechou');

await contexto.close();
await browser.close();

// links e assets locais
const htmls = paginas.map((r) => path.join(RAIZ, r.slice(1)));
let linksRuins = 0;
for (const arquivo of htmls) {
  const html = fs.readFileSync(arquivo, 'utf8');
  const atributos = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const bruto of atributos) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(bruto)) continue;
    const semQuery = bruto.split(/[?#]/)[0];
    if (!semQuery) continue;
    const destino = path.resolve(path.dirname(arquivo), semQuery);
    if (!fs.existsSync(destino)) {
      linksRuins++;
      if (linksRuins < 15) console.log('LINK QUEBRADO', path.relative(RAIZ, arquivo), bruto);
    }
  }
}
ok(linksRuins === 0, `${linksRuins} links/assets quebrados`);

console.log('\nRESUMO');
console.log('páginas:', paginas.length);
console.log('falhas:', falhas.length, falhas);
console.log('problemas de console/rede:', problemas.length, problemas);
process.exitCode = falhas.length === 0 && problemas.length === 0 && linksRuins === 0 ? 0 : 1;
