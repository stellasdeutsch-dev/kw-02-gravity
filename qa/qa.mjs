// QA сайта 02: node qa/qa.mjs [baseUrl]. Ширины 1440, 834, 390; обе версии.
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const BASE = process.argv[2] || 'http://127.0.0.1:8702/';
const OUT = new URL('./shots/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const report = [];
let fail = 0;
for (const [ver, path] of [['ad', ''], ['lesson', 'lesson/']]) {
  for (const w of [1440, 834, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w > 800 ? 900 : 844 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(String(e)));
    p.on('requestfailed', r => errs.push('failed ' + r.url()));
    const res = await p.goto(BASE + path, { waitUntil: 'networkidle' });
    // прокрутить до конца, чтобы lazy-картинки загрузились
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 80)); } window.scrollTo({ top: 0, behavior: "instant" }); });
    await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in')));
    const m = await p.evaluate(async () => {
      const src = await (await fetch(location.href)).text();
      const imgs = [...document.images];
      const bad = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
      const lazyMiss = (src.match(/<img [^>]*>/g) || []).filter(t => !/fetchpriority/.test(t) && !/loading="lazy"/.test(t)).length;
      const noAlt = imgs.filter(i => !i.hasAttribute('alt')).length;
      const noSize = imgs.filter(i => !i.getAttribute('width') || !i.getAttribute('height')).length;
      // элементы, вылезающие за ширину экрана (кроме лент каруселей, обрезанных overflow:hidden)
      const vw = document.documentElement.clientWidth; const over = [];
      document.querySelectorAll('body *').forEach(el => { if (el.closest('.car-track') || el.closest('svg') || el.classList.contains('skip')) return; const r = el.getBoundingClientRect(); if (r.width && (r.right > vw + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed') over.push((el.className && typeof el.className === 'string' ? el.className : '') + ' ' + (el.getAttribute('src') || el.tagName)); });
      const buy = [...document.querySelectorAll('a[href*="lava.top"]')].map(a => a.href);
      return { scrollW: document.documentElement.scrollWidth, imgs: imgs.length, bad, lazyMiss, noAlt, noSize, over: [...new Set(over)].slice(0, 8), buy: [...new Set(buy)], buyN: buy.length, h: document.body.scrollHeight };
    });
    const ok = res.status() === 200 && m.scrollW === w && m.bad.length === 0 && errs.length === 0 && m.noAlt === 0 && m.noSize === 0;
    if (!ok) fail++;
    report.push({ ver, w, status: res.status(), ...m, errs });
    await p.screenshot({ path: `${OUT}02_${ver}_${w}_first.png` });
    await p.screenshot({ path: `${OUT}02_${ver}_${w}_full.png`, fullPage: true });
    const ad = await p.$('.ad');
    if (ad) { await ad.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}02_${ver}_${w}_ad.png` }); }
    await ctx.close();
  }
}
// интерактив: вопросы, карусель, меню (1440, версия с рекламой)
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE, { waitUntil: 'networkidle' });
  const r = {};
  const q = p.locator('#faq .qa').first(); await q.locator('.qa-btn').click(); await p.waitForTimeout(500);
  r.faqOpen = await q.evaluate(e => e.classList.contains('open')) && await p.locator('#faq .qa.open').count() === 1;
  const next = p.locator('#inside .arr.next'); await next.scrollIntoViewIfNeeded(); const t0 = await p.locator('#inside .car-track').evaluate(e => e.style.transform); await next.click(); await p.waitForTimeout(700);
  r.carMoves = t0 !== await p.locator('#inside .car-track').evaluate(e => e.style.transform);
  r.prevEnabled = !(await p.locator('#inside .arr.prev').isDisabled());
  await p.evaluate(() => scrollTo(0, 0)); await p.locator('.burger').click(); r.menuOpen = await p.locator('#menu').isVisible(); await p.keyboard.press('Escape'); r.menuClosed = !(await p.locator('#menu').isVisible());
  r.hoverBtn = await p.locator('.about .btn').first().evaluate(e => getComputedStyle(e).transitionProperty);
  report.push({ interactive: r }); if (!Object.values(r).every(Boolean)) fail++;
  await p.close();
}
await b.close();
writeFileSync(new URL('./qa-report.json', import.meta.url), JSON.stringify(report, null, 1));
for (const r of report) console.log(r.interactive ? 'interactive ' + JSON.stringify(r.interactive) : `${r.ver.padEnd(6)} ${r.w} status=${r.status} scrollW=${r.scrollW} imgs=${r.imgs} bad=${r.bad.length} noAlt=${r.noAlt} noSize=${r.noSize} lazyMiss=${r.lazyMiss} buyLinks=${r.buyN} ${JSON.stringify(r.buy)} errs=${r.errs.length} over=${JSON.stringify(r.over)} h=${r.h}`);
console.log(fail ? `FAIL: ${fail}` : 'ALL OK');
process.exit(fail ? 1 : 0);
