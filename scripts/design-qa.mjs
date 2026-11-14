// QA de design no DOM renderizado (390x844): contraste AA, alvos de toque,
// tamanho de corpo, raio de canto, tracking e hierarquia tipográfica.
// Uso: node scripts/design-qa.mjs
import { chromium } from 'playwright';
import path from 'node:path';

const root = path.resolve('dist');
const base = `file://${root}/`;
const PAGINAS = [
  'index.html',
  'catalogo.html',
  'sobre.html',
  'como-comprar.html',
  'contato.html',
  '404.html',
  'produto/chave-canivete-2-botoes.html',
];

const problemas = [];
const nota = (ok, msg) => {
  if (!ok) problemas.push(msg);
};

const AUDITORIA = `(() => {
  // ---- cor: qualquer serialização do Chromium -> sRGB 0..1 ----
  const enc = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const dec = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  const nums = (s) => s.split(/[/\\s]+/).filter(Boolean).map(parseFloat);
  const oklabLin = (L, a, b) => {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ].map((v) => dec(Math.min(1, Math.max(0, v))));
  };
  const cor = (str) => {
    str = String(str || '').trim();
    let m;
    if ((m = str.match(/^rgba?\\(([^)]+)\\)$/))) {
      const p = m[1].split(/[,\\s/]+/).filter(Boolean);
      const v = p.slice(0, 3).map((x) => (x.endsWith('%') ? parseFloat(x) / 100 : parseFloat(x) / 255));
      const a = p[3] !== undefined ? (p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3])) : 1;
      return [v[0], v[1], v[2], a];
    }
    if ((m = str.match(/^color\\(srgb\\s+([^)]+)\\)$/))) {
      const p = nums(m[1]);
      return [p[0], p[1], p[2], p[3] !== undefined ? p[3] : 1];
    }
    if ((m = str.match(/^oklab\\(\\s*([^)]+)\\)$/))) {
      const p = nums(m[1]);
      return [...oklabLin(p[0], p[1], p[2]), p[3] !== undefined ? p[3] : 1];
    }
    if ((m = str.match(/^oklch\\(\\s*([^)]+)\\)$/))) {
      const p = nums(m[1]);
      const h = (p[2] || 0) * Math.PI / 180;
      return [...oklabLin(p[0], p[1] * Math.cos(h), p[1] * Math.sin(h)), p[3] !== undefined ? p[3] : 1];
    }
    if ((m = str.match(/^#([0-9a-f]{3,8})$/i))) {
      let h = m[1];
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
      return [v[0], v[1], v[2], h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
    }
    return [0, 0, 0, 1];
  };
  const sobre = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3]));
  const lum = (c) => 0.2126 * enc(c[0]) + 0.7152 * enc(c[1]) + 0.0722 * enc(c[2]);
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

  const fundoDe = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = cor(getComputedStyle(n).backgroundColor);
      if (c[3] > 0.6) return c.slice(0, 3);
      n = n.parentElement;
    }
    return [13 / 255, 16 / 255, 21 / 255];
  };
  const temTexto = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

  const contrasteBaixo = [];
  const corpoPequeno = [];
  const alvosPequenos = [];
  const raiosAltos = [];
  const trackingNegativo = [];
  const semBalance = [];

  document.querySelectorAll('body *').forEach((el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.5) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;

    if (temTexto(el)) {
      const bg = fundoDe(el);
      const fg = sobre(cor(s.color), bg);
      const px = parseFloat(s.fontSize);
      const forte = parseInt(s.fontWeight, 10) >= 700 || px >= 24;
      const alvo = forte ? 3 : 4.5;
      const cr = ratio(fg, bg);
      if (cr < alvo) {
        contrasteBaixo.push({
          txt: el.textContent.trim().slice(0, 30),
          cr: +cr.toFixed(2), alvo,
          fg: s.color, bg: s.backgroundColor || '(herda)',
        });
      }
      const maiuscula = s.textTransform === 'uppercase';
      if (px < 14 && !el.closest('nav') && !maiuscula && !el.closest('figcaption')) {
        corpoPequeno.push({ txt: el.textContent.trim().slice(0, 30), px });
      }
      if (String(s.letterSpacing).startsWith('-')) {
        trackingNegativo.push(el.tagName + ' ' + String(s.letterSpacing) + ' "' + el.textContent.trim().slice(0, 20) + '"');
      }
      if (/^H[1-3]$/.test(el.tagName) && !el.classList.contains('sr-only') && s.textWrap !== 'balance') {
        semBalance.push(el.tagName + '→' + s.textWrap);
      }
    }

    const raio = parseFloat(s.borderTopLeftRadius) || 0;
    if (raio > 8 && !el.querySelector('img')) {
      raiosAltos.push({ el: el.tagName + '.' + String(el.className).slice(0, 30), raio });
    }

    const interativo = el.matches('a.btn, .btn-chip, button, a[data-whatsapp], header a, #menu-mobile a, footer a');
    // link dentro de um parágrafo é texto corrido (exceção inline do WCAG 2.5.8)
    const pai = el.parentElement;
    const ehInline =
      pai &&
      (pai.tagName === 'P' || pai.tagName === 'SPAN') &&
      pai.textContent.trim().length > (el.textContent || '').trim().length + 4;
    if (interativo && !ehInline && r.height < 40) {
      alvosPequenos.push({ txt: (el.textContent || '').trim().slice(0, 26), h: Math.round(r.height) });
    }
  });

  const h1 = document.querySelector('h1');
  const lead = [...document.querySelectorAll('main p')].find(
    (p) => p.textContent.trim().length > 60 && !p.closest('figcaption')
  );
  const corpoPx = lead ? parseFloat(getComputedStyle(lead).fontSize) : 0;
  return {
    contrasteBaixo, corpoPequeno, alvosPequenos, raiosAltos, trackingNegativo, semBalance,
    h1Px: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0,
    corpoPx,
    h1Wrap: h1 ? getComputedStyle(h1).textWrap : '',
  };
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'pt-BR',
});

let totalAchados = 0;

for (const pagina of PAGINAS) {
  const page = await ctx.newPage();
  await page.goto(base + pagina, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        y += 600;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) requestAnimationFrame(step);
        else { window.scrollTo(0, 0); res(); }
      };
      step();
    });
  });
  await page.waitForTimeout(200);

  const r = await page.evaluate(AUDITORIA);
  const curto = pagina.replace('.html', '').replace('produto/', '');

  nota(r.contrasteBaixo.length === 0, `${curto}: contraste AA → ${JSON.stringify(r.contrasteBaixo.slice(0, 5))}`);
  nota(r.corpoPequeno.length === 0, `${curto}: sem texto <14px → ${JSON.stringify(r.corpoPequeno.slice(0, 5))}`);
  nota(r.alvosPequenos.length === 0, `${curto}: alvos de toque ≥40px → ${JSON.stringify(r.alvosPequenos.slice(0, 6))}`);
  nota(r.raiosAltos.length === 0, `${curto}: sem raio >8px → ${JSON.stringify(r.raiosAltos.slice(0, 3))}`);
  nota(r.trackingNegativo.length === 0, `${curto}: sem tracking negativo`);
  nota(r.semBalance.length === 0, `${curto}: h1-h3 com text-wrap balance → ${JSON.stringify(r.semBalance.slice(0, 5))}`);
  nota(r.corpoPx >= 16, `${curto}: corpo ≥16px (medido ${r.corpoPx}px)`);
  nota(r.h1Px >= 30 && r.h1Px <= 52, `${curto}: h1 entre 30 e 52px (medido ${r.h1Px}px)`);
  nota(r.h1Px / Math.max(r.corpoPx, 1) >= 1.5, `${curto}: hierarquia h1/corpo ${(r.h1Px / Math.max(r.corpoPx, 1)).toFixed(2)}x`);

  const n = problemas.length;
  totalAchados += n;
  console.log(
    `${n === 0 ? 'OK   ' : 'FALHA'} ${curto.padEnd(26)} h1 ${r.h1Px}px · corpo ${r.corpoPx}px` +
      (n ? ` · ${n} achado(s)` : '')
  );
  if (n) problemas.forEach((p) => console.log('        - ' + p));
  problemas.length = 0;
  await page.close();
}

await browser.close();
console.log('');
console.log(totalAchados === 0 ? 'QA DE DESIGN: TUDO OK' : `QA DE DESIGN: ${totalAchados} ACHADO(S)`);
process.exit(totalAchados ? 1 : 0);
