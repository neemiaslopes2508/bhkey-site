// Downloads Fontshare woff2 files locally so the site has no runtime CDN dependency.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('public/fonts');
fs.mkdirSync(OUT, { recursive: true });

const wants = [
  // v3: Clash Display saiu — Satoshi carrega os títulos (700) e o corpo (400/500).
  ['satoshi', [400, 500, 700], 'Satoshi'],
  ['azeret-mono', [400, 500], 'AzeretMono'],
];

for (const [slug, weights, prefix] of wants) {
  const url = `https://api.fontshare.com/v2/css?f%5B%5D=${slug}@${weights.join(',')}&display=swap`;
  const css = await (await fetch(url)).text();
  const blocks = css.split('@font-face').slice(1);
  for (const block of blocks) {
    const wMatch = block.match(/font-weight:\s*(\d+)/);
    const uMatch = block.match(/url\('(\/\/[^']+\.woff2)'/);
    if (!wMatch || !uMatch) continue;
    const weight = wMatch[1];
    const file = `${prefix}-${weight}.woff2`;
    const dest = path.join(OUT, file);
    if (fs.existsSync(dest)) { console.log('skip', file); continue; }
    const res = await fetch('https:' + uMatch[1]);
    if (!res.ok) { console.error('FAIL', file, res.status); continue; }
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log('saved', file, fs.statSync(dest).size, 'bytes');
  }
}
console.log('done');
