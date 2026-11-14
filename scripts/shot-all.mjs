// Screenshots de todo o build: todas as páginas em 390x844 (full page)
// e a home em 1440x900 (viewport + full page).
// Uso: node scripts/shot-all.mjs   (roda depois de npm run build)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const out = path.resolve('screenshots', 'full');
fs.mkdirSync(out, { recursive: true });
const base = `file://${root}/`;

// todas as páginas do build
const htmlFiles = [];
const walk = (dir, rel = '') => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(dir, e.name), `${rel}${e.name}/`);
    else if (e.name.endsWith('.html')) htmlFiles.push(`${rel}${e.name}`);
  }
};
walk(root);
htmlFiles.sort();

const slug = (f) => f.replace(/\.html$/, '').replace(/\//g, '-') || 'index';

const browser = await chromium.launch();
const problemas = [];

// 1) todas as páginas em 390x844 (full page)
const ctxM = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'pt-BR',
});
for (const arquivo of htmlFiles) {
  const page = await ctxM.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  await page.goto(base + arquivo, { waitUntil: 'load' });
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
  await page.waitForTimeout(250);
  const nome = `m390-${slug(arquivo)}.jpg`;
  await page.screenshot({ path: path.join(out, nome), fullPage: true, type: 'jpeg', quality: 80 });
  // overflow horizontal?
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  if (overflow) problemas.push(`overflow horizontal: ${arquivo}`);
  if (erros.length) problemas.push(`erros de JS em ${arquivo}: ${erros.join(' | ')}`);
  console.log(`${overflow ? 'FALHA' : 'OK  '}  m390 ${arquivo}`);
  await page.close();
}
await ctxM.close();

// 2) home em 1440x900 (viewport e full page)
const ctxD = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  locale: 'pt-BR',
});
const page = await ctxD.newPage();
await page.goto(base + 'index.html', { waitUntil: 'load' });
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(out, 'd1440-home-viewport.jpg'), type: 'jpeg', quality: 85 });
await page.screenshot({ path: path.join(out, 'd1440-home-full.jpg'), fullPage: true, type: 'jpeg', quality: 80 });
console.log('OK   d1440 home (viewport + full)');
await ctxD.close();

await browser.close();

if (problemas.length) {
  console.log('\nPROBLEMAS:');
  for (const p of problemas) console.log(' - ' + p);
  process.exit(1);
}
console.log(`\nTUDO OK — ${htmlFiles.length} páginas em 390x844 + home em 1440x900 → ${out}`);
