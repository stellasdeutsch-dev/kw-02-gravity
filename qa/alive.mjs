// Пункт 4а: node qa/alive.mjs [baseUrl]
// 1) скриншоты всей страницы 1440 и 390 для en и tr (после прокрутки, все блоки появились);
// 2) прогон с reducedMotion: 'reduce' — без прокрутки ни одного скрытого блока, анимаций нет;
// 3) без JS — весь контент виден.
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const BASE = process.argv[2] || 'http://127.0.0.1:8702/';
const OUT = new URL('./alive/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const rep = []; let fail = 0;
const hidden = () => [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); return s.opacity === '0' && !e.closest('[hidden],.qa-a') && e.getBoundingClientRect().height > 0; }).map(e => e.className).slice(0, 5);
for (const lang of ['en', 'tr']) for (const w of [1440, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: w > 800 ? 900 : 844 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(BASE + lang + '/', { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)); } });
  await p.waitForTimeout(1600);
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
  const m = await p.evaluate(hidden);
  const nums = await p.evaluate(() => [...document.querySelectorAll('.num')].map(n => n.textContent + '/' + n.dataset.count));
  const bytes = await p.evaluate(() => performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0) + (performance.getEntriesByType('navigation')[0]?.encodedBodySize || 0));
  await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}02_${lang}_${w}_full.png`, fullPage: true });
  const ok = m.length === 0 && errs.length === 0 && nums.every(x => { const [a, c] = x.split('/'); return a === c; });
  if (!ok) fail++; rep.push({ run: 'scroll', lang, w, hiddenAfterScroll: m, nums, kb: Math.round(bytes / 1024), errs }); await p.close();
}
for (const lang of ['en', 'tr']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
  await p.goto(BASE + lang + '/', { waitUntil: 'networkidle' });
  const m = await p.evaluate(hidden);
  const anim = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => { const s = getComputedStyle(e); return s.animationName !== 'none' && parseFloat(s.animationDuration) > 0.01; }).length);
  await p.screenshot({ path: `${OUT}02_${lang}_1440_reduce_full.png`, fullPage: true });
  const ok = m.length === 0 && anim === 0; if (!ok) fail++; rep.push({ run: 'reduce', lang, hidden: m, anim }); await ctx.close();
  const c2 = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); const p2 = await c2.newPage();
  await p2.goto(BASE + lang + '/', { waitUntil: 'networkidle' });
  const m2 = await p2.evaluate(hidden); const ok2 = m2.length === 0; if (!ok2) fail++; rep.push({ run: 'nojs', lang, hidden: m2 }); await c2.close();
}
await b.close();
writeFileSync(new URL('./alive-report.json', import.meta.url), JSON.stringify(rep, null, 1));
for (const r of rep) console.log(JSON.stringify(r).slice(0, 300));
console.log(fail ? 'FAIL: ' + fail : 'ALL OK'); process.exit(fail ? 1 : 0);
