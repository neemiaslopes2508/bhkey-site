import { defineConfig } from 'astro/config';

// Static site, flat .html output so it opens straight from a local folder (file://).
// Assets (styles.css, app.js, img/, fonts/) live in public/ and are referenced with
// depth-aware relative paths (see src/layouts/Base.astro) — no absolute /paths.
export default defineConfig({
  output: 'static',
  build: { format: 'file' },
  outDir: './dist',
});
