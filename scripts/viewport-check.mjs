// Verificação de viewport v3 — as larguras do brief (360 / 390 / 430) mais
// tablet e desktop: rolagem horizontal, menu folha aberto e fotos tiradas do
// resultado real (hero com scrim, folha do menu, home em 1440).
// Uso: node scripts/viewport-check.mjs   (roda depois de npm run build)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const out = path.resolve('screenshots');
fs.mkdirSync(out, { recursive: true });
const base = `file://${root}/`;

const LARGURAS = [360, 390, 430, 768, 1024, 1440];
const PAGINAS = [
  'index.html',
  'catalogo.html',
  'sobre.html',
  'como-comprar.html',
  'contato.html',
  'produto/chave-canivete-2-botoes.html',
];

const problemas = [];
const nota = (ok, msg) => {
  console.log(`${ok ? 'OK  ' : 'FALHA'}  ${msg}`);
  if (!ok) problemas.push(msg);
};

const browser = await chromium.launch();

for (const largura of LARGURAS) {
  const ctx = await browser.newContext({
    viewport: { width: largura, height: 900 },
    deviceScaleFactor: 2,
    isMobile: largura < 768,
    hasTouch: largura < 768,
    locale: 'pt-BR',
  });
  const alvos = largura === 390 ? PAGINAS : PAGINAS.slice(0, 3);
  for (const arquivo of alvos) {
    const page = await ctx.newPage();
    const falhas = [];
    page.on('requestfailed', (r) => falhas.push(`falhou ${r.url()}`));
    page.on('response', (r) => {
      if (r.status() >= 400) falhas.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(base + arquivo, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const step = () => {
          y += 700;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) requestAnimationFrame(step);
          else { window.scrollTo(0, 0); res(); }
        };
        step();
      });
    });
    await page.waitForTimeout(150);
    const d = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: document.documentElement.clientWidth,
    }));
    nota(
      d.scrollW <= d.innerW,
      `${String(largura).padStart(4)}px · ${arquivo.replace('.html', '').replace('produto/', '')} — sem rolagem horizontal (${d.scrollW}/${d.innerW})`
    );
    nota(
      falhas.length === 0,
      `${String(largura).padStart(4)}px · ${arquivo.replace('.html', '').replace('produto/', '')} — sem requisição falha${falhas.length ? ' → ' + falhas.slice(0, 3).join(' | ') : ''}`
    );
    // Fontes auto-hospedadas precisam de fato carregar (sem CDN em runtime).
    if (arquivo === 'index.html') {
      const fontes = await page.evaluate(async () => {
        await document.fonts.ready;
        return {
          satoshi700: document.fonts.check('700 32px Satoshi'),
          satoshi400: document.fonts.check('400 16px Satoshi'),
          azeret: document.fonts.check('400 12px "Azeret Mono"'),
        };
      });
      nota(
        fontes.satoshi700 && fontes.satoshi400 && fontes.azeret,
        `${String(largura).padStart(4)}px · fontes Satoshi 400/700 e Azeret Mono carregadas (${fontes.satoshi700}/${fontes.satoshi400}/${fontes.azeret})`
      );
    }
    // O botão de menu só existe abaixo de 1024; acima disso é a nav fixa.
    if (arquivo === 'index.html') {
      const m = await page.evaluate(() => ({
        botao: getComputedStyle(document.getElementById('menu-toggle')).display,
        navDesktop: getComputedStyle(document.querySelector('header nav[aria-label="Principal"]')).display,
      }));
      const botaoOk = largura < 1024 ? m.botao !== 'none' : m.botao === 'none';
      const navOk = largura >= 1024 ? m.navDesktop !== 'none' : m.navDesktop === 'none';
      nota(botaoOk, `${String(largura).padStart(4)}px · botão de menu ${largura < 1024 ? 'visível' : 'escondido'} (${m.botao})`);
      nota(navOk, `${String(largura).padStart(4)}px · navegação desktop ${largura >= 1024 ? 'visível' : 'escondida'} (${m.navDesktop})`);
    }
    await page.close();
  }
  await ctx.close();
}

// ---- menu folha aberto em 360: cabe na largura e não vaza ----
{
  const ctx = await browser.newContext({
    viewport: { width: 360, height: 780 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'pt-BR',
  });
  const page = await ctx.newPage();
  await page.goto(base + 'index.html', { waitUntil: 'load' });
  const contagem = () =>
    page.evaluate(() => ({
      icones: [...document.querySelectorAll('#menu-toggle svg')].filter(
        (s) => getComputedStyle(s).display !== 'none'
      ).length,
      rotulos: [...document.querySelectorAll('#menu-toggle .sr-only')].filter(
        (s) => getComputedStyle(s).display !== 'none'
      ).length,
    }));
  const fechado = await contagem();
  nota(
    fechado.icones === 1 && fechado.rotulos === 1,
    `360px · menu fechado mostra um ícone/rótulo só (${fechado.icones}/${fechado.rotulos})`
  );
  await page.click('#menu-toggle');
  await page.waitForTimeout(200);
  const d = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: document.documentElement.clientWidth,
    raio: getComputedStyle(document.querySelector('#menu-mobile ul')).borderRadius,
    sombra: getComputedStyle(document.querySelector('#menu-mobile ul')).boxShadow,
    alturaAlvo: Math.round(document.querySelector('#menu-mobile a').getBoundingClientRect().height),
    iconesVisiveis: [...document.querySelectorAll('#menu-toggle svg')].filter(
      (s) => getComputedStyle(s).display !== 'none'
    ).length,
    rotulosVisiveis: [...document.querySelectorAll('#menu-toggle .sr-only')].filter(
      (s) => getComputedStyle(s).display !== 'none'
    ).length,
  }));
  nota(d.scrollW <= d.innerW, `360px · menu aberto — sem rolagem horizontal (${d.scrollW}/${d.innerW})`);
  nota(d.raio === '16px', `360px · folha do menu com raio 16 (medido ${d.raio})`);
  nota(d.sombra.includes('32px'), `360px · folha com a sombra única (medido ${d.sombra})`);
  nota(d.alturaAlvo >= 44, `360px · item do menu com alvo ≥44px (medido ${d.alturaAlvo}px)`);
  nota(d.iconesVisiveis === 1, `360px · botão do menu mostra um ícone só (mostrou ${d.iconesVisiveis})`);
  nota(d.rotulosVisiveis === 1, `360px · botão do menu tem um rótulo sr-only só (mostrou ${d.rotulosVisiveis})`);
  await page.screenshot({ path: path.join(out, 'v3-menu-360.jpg'), type: 'jpeg', quality: 88 });
  await page.close();
  await ctx.close();
}

// ---- hero com scrim (390) e home em desktop (1440) ----
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'pt-BR',
  });
  const page = await ctx.newPage();
  await page.goto(base + 'index.html', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const scrim = await page.evaluate(() => {
    const el = document.querySelector('.foto-scrim');
    return el ? getComputedStyle(el).backgroundImage : 'AUSENTE';
  });
  nota(scrim.includes('gradient'), `hero: scrim escuro presente (${scrim.slice(0, 60)}…)`);
  const figura = await page.$('.foto--card');
  await figura.screenshot({ path: path.join(out, 'v3-hero-foto-390.jpg'), type: 'jpeg', quality: 90 });
  await page.close();
  await ctx.close();
}
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'pt-BR',
  });
  const page = await ctx.newPage();
  await page.goto(base + 'index.html', { waitUntil: 'load' });
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        y += 800;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) requestAnimationFrame(step);
        else { window.scrollTo(0, 0); res(); }
      };
      step();
    });
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, 'v3-home-1440.jpg'), fullPage: true, type: 'jpeg', quality: 80 });
  await page.close();
  await ctx.close();
}

await browser.close();
console.log('');
console.log(problemas.length ? `${problemas.length} FALHA(S)` : 'VIEWPORT: TUDO OK');
process.exit(problemas.length ? 1 : 0);
