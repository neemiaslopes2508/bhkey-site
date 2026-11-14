// Detects Instagram grid tile boundaries by finding rows/cols of background color.
import sharp from 'sharp';

const REF = '/home/ubuntu/.openmausbot/workspaces/7559e3de-1437-4d9c-bdf6-a92bb92549b9/bhkey/references';

async function analyze(file, label) {
  const { data, info } = await sharp(`${REF}/${file}`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const px = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const isBg = ([r, g, b]) => r < 30 && g < 35 && b < 45 && Math.abs(r - g) < 12 && Math.abs(g - b) < 15;

  // Scan a horizontal line through the middle of the grid for gutters.
  const guttersX = [];
  for (let x = 0; x < width; x++) {
    let bgCount = 0;
    for (let y = Math.floor(height * 0.15); y < Math.floor(height * 0.9); y += 7) if (isBg(px(x, y))) bgCount++;
    const samples = Math.floor((height * 0.75) / 7);
    guttersX.push(bgCount / samples > 0.92);
  }
  const guttersY = [];
  for (let y = 0; y < height; y++) {
    let bgCount = 0;
    for (let x = Math.floor(width * 0.2); x < Math.floor(width * 0.75); x += 7) if (isBg(px(x, y))) bgCount++;
    const samples = Math.floor((width * 0.55) / 7);
    guttersY.push(bgCount / samples > 0.92);
  }
  const runs = (arr) => {
    const out = []; let start = -1;
    arr.forEach((v, i) => { if (v && start < 0) start = i; if (!v && start >= 0) { out.push([start, i - 1]); start = -1; } });
    if (start >= 0) out.push([start, arr.length - 1]);
    return out.filter(([a, b]) => b - a >= 1);
  };
  console.log(label, `${width}x${height}`);
  console.log('  vertical gutters (x-ranges):', JSON.stringify(runs(guttersX)));
  console.log('  horizontal gutters (y-ranges):', JSON.stringify(runs(guttersY)));
}

await analyze('05-bhkey-instagram-grid.png', 'GRID');
await analyze('03-bhkey-instagram-perfil.png', 'PERFIL');
