// Фото авторов на странице: node qa/people-shots.mjs [baseUrl] → qa/edges/02_people_*.png и первый экран 390
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
const BASE = process.argv[2] || 'http://127.0.0.1:8702/';
const OUT = new URL('./edges/', import.meta.url).pathname;
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
for (const lang of ['en', 'tr']) for (const w of [1440, 834, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: w > 800 ? 900 : 844 }, reducedMotion: 'reduce' });
  await p.goto(BASE + lang + '/', { waitUntil: 'networkidle' });
  if (w === 390) await p.screenshot({ path: `${OUT}02_first_${lang}_390.png` });
  await p.evaluate(() => { document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); });
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
  for (const id of ['#author', '#story']) { await p.locator(id).scrollIntoViewIfNeeded(); await p.waitForFunction(s => [...document.querySelectorAll(s + ' img')].every(i => i.complete && i.naturalWidth > 0), id, { timeout: 15000 }); }
  await p.waitForTimeout(400);
  await p.locator('#author').screenshot({ path: `${OUT}02_people_${lang}_author_${w}.png` });
  await p.locator('#story').screenshot({ path: `${OUT}02_people_${lang}_story_${w}.png` });
  await p.close();
}
await b.close(); console.log('OK');
