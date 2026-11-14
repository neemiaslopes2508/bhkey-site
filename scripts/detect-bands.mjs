// Precisely locates Instagram grid tile boundaries using row/column difference energy.
import sharp from 'sharp';

const REF = '/home/ubuntu/.openmausbot/workspaces/7559e3de-1437-4d9c-bdf6-a92bb92549b9/bhkey/references';

async function bands(file, x0, x1, y0, y1, axis) {
  const { data, info } = await sharp(`${REF}/${file}`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, channels } = info;
  const val = (x, y) => {
    const i = (y * width + x) * channels;
    return (data[i] + data[i + 1] + data[i + 2]) / 3;
  };
  // mean |diff| between consecutive lines along the axis, within the band
  const energies = [];
  if (axis === 'row') {
    for (let y = y0 + 1; y < y1; y++) {
      let s = 0, n = 0;
      for (let x = x0; x < x1; x += 3) { s += Math.abs(val(x, y) - val(x, y - 1)); n++; }
      energies.push([y, s / n]);
    }
  } else {
    for (let x = x0 + 1; x < x1; x++) {
      let s = 0, n = 0;
      for (let y = y0; y < y1; y += 3) { s += Math.abs(val(x, y) - val(x - 1, y)); n++; }
      energies.push([x, s / n]);
    }
  }
  const avg = energies.reduce((a, [, e]) => a + e, 0) / energies.length;
  // peaks: energy well above average = boundary line
  const peaks = energies.filter(([, e]) => e > Math.max(avg * 4, 22)).map(([i]) => i);
  // collapse runs of adjacent indices
  const out = [];
  for (const p of peaks) {
    if (out.length && p - out[out.length - 1][1] <= 3) out[out.length - 1][1] = p;
    else out.push([p, p]);
  }
  console.log(`${file} ${axis} band [${axis === 'row' ? `y${y0}-${y1}` : `x${x0}-${x1}`}] avg=${avg.toFixed(1)} boundaries=${JSON.stringify(out)}`);
  return out;
}

// GRID: full content area
await bands('05-bhkey-instagram-grid.png', 300, 1100, 88, 1199, 'row');
await bands('05-bhkey-instagram-grid.png', 226, 1160, 200, 1100, 'col');
// PERFIL: content area
await bands('03-bhkey-instagram-perfil.png', 250, 1050, 572, 1332, 'row');
await bands('03-bhkey-instagram-perfil.png', 178, 1112, 650, 1300, 'col');
