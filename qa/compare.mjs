// Скриншоты блоков копии для сравнения с образцом (1440 и 390)
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
const OUT = new URL('./compare/raw/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
for (const w of [1440, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('http://127.0.0.1:8702/', { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); scrollTo({ top: 0, behavior: 'instant' }); });
  await p.waitForTimeout(700);
  for (const [name, sel] of [['hero', '.hero'], ['about', '#about'], ['program', '#how'], ['rows', '#steps'], ['cards', '#examples'], ['reviews', '#reviews'], ['faq', '#faq'], ['author', '.author-sec'], ['footer', '.foot']]) {
    const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
    await el.screenshot({ path: `${OUT}${w}_${name}.png` });
  }
  await p.close();
}
await b.close();
