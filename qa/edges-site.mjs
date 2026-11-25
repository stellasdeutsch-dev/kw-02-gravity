// Края вырезок на фоне сайта: node qa/edges-site.mjs [baseUrl] → qa/edges/02_site_*.png
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
const BASE = process.argv[2] || 'http://127.0.0.1:8702/';
const OUT = new URL('./edges/', import.meta.url).pathname;
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
for (const lang of ['en', 'tr']) for (const w of [1440, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await p.goto(BASE + lang + '/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in')));
  const el = p.locator('.wave-photo img').first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  await p.locator('#author').screenshot({ path: `${OUT}02_site_${lang}_author_${w}.png`, scale: 'css' });
  if (w === 1440) { await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300); await p.locator('.hero-horse').screenshot({ path: `${OUT}02_site_${lang}_horse.png` }); }
  await p.close();
}
await b.close(); console.log('OK');
