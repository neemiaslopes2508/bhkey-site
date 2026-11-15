import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://localhost:4188';
const OUT = '/home/ubuntu/.openmausbot/task-workspaces/7559e3de-1437-4d9c-bdf6-a92bb92549b9/0e299f20-210e-4117-8084-faada233993c/qa-v4';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function rolarTudo(page) {
  await page.evaluate(async () => {
    const passo = Math.round(innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += passo) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

for (const [nome, width, height] of [['390', 390, 844], ['1440', 1440, 900]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await rolarTudo(page);
  await page.screenshot({ path: `${OUT}/home-${nome}.png`, fullPage: true });
  await page.goto(BASE + '/catalogo.html', { waitUntil: 'networkidle' });
  await rolarTudo(page);
  await page.screenshot({ path: `${OUT}/catalogo-${nome}.png`, fullPage: true });
  await page.goto(BASE + '/produto/chave-canivete-2-botoes.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${OUT}/produto-${nome}.png`, fullPage: true });
  await page.close();
}

// Gaveta no desktop, com dois itens e quantidades diferentes.
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(BASE + '/catalogo.html', { waitUntil: 'networkidle' });
await page.locator('[data-add]').nth(0).click();
await page.locator('[data-add]').nth(4).click();
await page.locator('.btn-lista').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/lista-1440.png` });
await page.close();

// Gaveta vazia no celular.
const page2 = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page2.goto(BASE + '/catalogo.html', { waitUntil: 'networkidle' });
await page2.locator('.btn-lista').click();
await page2.waitForTimeout(400);
await page2.screenshot({ path: `${OUT}/lista-vazia-390.png` });
await page2.close();

await browser.close();
console.log('ok');
