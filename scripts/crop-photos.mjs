// Final product/editorial photo crops from the client's Instagram prints.
// TEMPORARY placeholders until the client delivers real catalog photos.
// Tile boundaries from scripts/detect-bands.mjs. Crops avoid burned-in price
// tags (R$7,90), video captions, IG play icons (top-right of each tile) and
// the "Mostrar mais posts" pill (bottom of grid row 3, col 1).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const REF = '/home/ubuntu/.openmausbot/workspaces/7559e3de-1437-4d9c-bdf6-a92bb92549b9/bhkey/references';
const OUT = path.resolve('public/img/produtos');
fs.mkdirSync(OUT, { recursive: true });

// GRID (05): rows y=[88,369,784,1199], cols x=[226,537,848,1160]
// PERFIL (03): rows y=[572,988,1331], cols x=[178,489,800,1112]
// kind: 'produto' (no faces — used on catalog cards) | 'editorial' (people/stock)
const crops = [
  // ---- product photos (faces avoided) ----
  ['05-bhkey-instagram-grid.png', { left: 233, top: 431, width: 297, height: 345 }, 'grid-adesivos-marca.jpg'],
  ['05-bhkey-instagram-grid.png', { left: 300, top: 470, width: 170, height: 260 }, 'det-adesivos.jpg'],
  ['05-bhkey-instagram-grid.png', { left: 233, top: 140, width: 297, height: 225 }, 'grid-maos-janela.jpg'],
  ['05-bhkey-instagram-grid.png', { left: 856, top: 95, width: 250, height: 190 }, 'grid-remotos-pacote.jpg'],
  ['05-bhkey-instagram-grid.png', { left: 545, top: 835, width: 296, height: 300 }, 'grid-remoto-mao.jpg'],
  ['03-bhkey-instagram-perfil.png', { left: 185, top: 635, width: 297, height: 345 }, 'perfil-pacotes-mesa.jpg'],
  ['03-bhkey-instagram-perfil.png', { left: 200, top: 640, width: 270, height: 300 }, 'det-pacotes.jpg'],
  ['03-bhkey-instagram-perfil.png', { left: 300, top: 800, width: 180, height: 175 }, 'det-maos-pacotes.jpg'],
  ['03-bhkey-instagram-perfil.png', { left: 808, top: 635, width: 297, height: 345 }, 'perfil-chave-canivete.jpg'],
  ['03-bhkey-instagram-perfil.png', { left: 850, top: 810, width: 230, height: 170 }, 'det-remotos-2.jpg'],
  ['03-bhkey-instagram-perfil.png', { left: 808, top: 1043, width: 297, height: 282 }, 'perfil-remotos-pretos.jpg'],
  ['03-bhkey-instagram-perfil.png', { left: 830, top: 1050, width: 250, height: 260 }, 'det-remotos.jpg'],
  ['03-bhkey-instagram-perfil.png', { left: 185, top: 1043, width: 297, height: 282 }, 'perfil-janela.jpg'],
  ['03-bhkey-instagram-perfil.png', { left: 200, top: 1100, width: 170, height: 220 }, 'det-janela-2.jpg'],
  // extra variants so all 12 sample products have a distinct photo
  ['03-bhkey-instagram-perfil.png', { left: 870, top: 700, width: 235, height: 280 }, 'det-chave-2.jpg'],
  ['05-bhkey-instagram-grid.png', { left: 233, top: 795, width: 130, height: 240 }, 'det-estoque-1.jpg'],
  ['05-bhkey-instagram-grid.png', { left: 405, top: 800, width: 125, height: 230 }, 'det-estoque-2.jpg'],
  // ---- editorial photos (people/stock — home, sobre) ----
  ['05-bhkey-instagram-grid.png', { left: 856, top: 440, width: 297, height: 336 }, 'editorial-estoque-caixas.jpg'],
  ['05-bhkey-instagram-grid.png', { left: 233, top: 847, width: 297, height: 330 }, 'editorial-estoque-pessoa.jpg'],
  ['05-bhkey-instagram-grid.png', { left: 860, top: 400, width: 150, height: 210 }, 'editorial-baterias.jpg'],
];

for (const [src, region, name] of crops) {
  await sharp(path.join(REF, src))
    .extract(region)
    .resize(600, 600, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, name));
  console.log('cropped', name);
}

// Logo + favicon.
await sharp(path.join(REF, '04-bhkey-logo.png')).png().toFile(path.resolve('public/img/logo-bhkey.png'));
await sharp(path.join(REF, '04-bhkey-logo.png')).resize(64, 64).png().toFile(path.resolve('public/favicon.png'));

// Labeled contact sheet for review.
const files = fs.readdirSync(OUT).filter(f => f.endsWith('.jpg')).sort();
const CELL = 210, LABEL = 26, COLS = 4;
const rows = Math.ceil(files.length / COLS);
const composites = [];
for (let i = 0; i < files.length; i++) {
  const img = await sharp(path.join(OUT, files[i])).resize(CELL, CELL).toBuffer();
  const x = (i % COLS) * CELL, y = Math.floor(i / COLS) * (CELL + LABEL);
  composites.push({ input: img, left: x, top: y });
  const svg = Buffer.from(
    `<svg width="${CELL}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="100%" height="100%" fill="#111"/>` +
    `<text x="6" y="18" font-family="monospace" font-size="13" fill="#85b339">${files[i].replace('.jpg', '')}</text></svg>`);
  composites.push({ input: svg, left: x, top: y + CELL });
}
await sharp({ create: { width: COLS * CELL, height: rows * (CELL + LABEL), channels: 3, background: '#000' } })
  .composite(composites).jpeg({ quality: 88 }).toFile(path.resolve('screenshots/_verificacao-crops.jpg'));
console.log('montage:', files.length, 'photos');
