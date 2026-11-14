// Prints a coarse color profile down a column so row transitions are unambiguous.
import sharp from 'sharp';
const REF = '/home/ubuntu/.openmausbot/workspaces/7559e3de-1437-4d9c-bdf6-a92bb92549b9/bhkey/references';

const file = process.argv[2];
const x = parseInt(process.argv[3], 10);
const y0 = parseInt(process.argv[4], 10);
const y1 = parseInt(process.argv[5], 10);
const step = parseInt(process.argv[6] || '10', 10);

const { data, info } = await sharp(`${REF}/${file}`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, channels } = info;
for (let y = y0; y < y1; y += step) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let xx = x; xx < x + 30; xx++) {
    const i = (y * width + xx) * channels;
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
  }
  const R = Math.round(r / n), G = Math.round(g / n), B = Math.round(b / n);
  // brightness class
  const cls = (R + G + B) / 3 > 140 ? 'BRIGHT' : (R + G + B) / 3 < 60 ? 'dark' : 'mid';
  console.log(`${y}\trgb(${R},${G},${B})\t${cls}`);
}
