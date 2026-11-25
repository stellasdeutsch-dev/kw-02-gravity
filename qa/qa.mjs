// QA сайта 02: node qa/qa.mjs [baseUrl]. Ширины 1440, 834, 390; вариации en и tr (только с рекламой).
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const BASE = process.argv[2] || 'http://127.0.0.1:8702/';
const OUT = new URL('./shots/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const report = [];
let fail = 0;
const BUY = { en: 'https://app.lava.top/products/2c950aa0-d8be-4317-8f39-0f9b4016f5da', tr: 'https://app.lava.top/products/2cdbb9f8-e65b-443e-8d2c-4fea4c121e41' };
// люди: в en только Диас, в tr только Тимур (по именам файлов из gh/media/PEOPLE.md)
const PEOPLE = { en: /\/(dias-|ds-study|ds-colosseum)/, tr: /\/(timur-|tm-cert)/ };
const ALIEN = { en: /timur|\/tm-|тимур|timax/i, tr: /dias|\/ds-|диас/i };
for (const [ver, path] of [['en', 'en/'], ['tr', 'tr/']]) {
  for (const w of [1440, 834, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w > 800 ? 900 : 844 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(String(e)));
    p.on('requestfailed', r => errs.push('failed ' + r.url()));
    const res = await p.goto(BASE + path, { waitUntil: 'networkidle' });
    // прокрутить до конца, чтобы lazy-картинки загрузились
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 80)); } window.scrollTo({ top: 0, behavior: "instant" }); });
    // ждём, пока все картинки догрузятся (на GitHub Pages первая загрузка медленнее), максимум 15 с
    await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
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
      const html = document.documentElement.outerHTML;
      const srcs = imgs.map(i => i.getAttribute('src'));
      const price = (document.body.innerText.match(/\$|USD|доллар|в месяц|\/мес|per month|ayda|aylık/gi) || []);
      return { html, srcs, price, scrollW: document.documentElement.scrollWidth, imgs: imgs.length, bad, lazyMiss, noAlt, noSize, over: [...new Set(over)].slice(0, 8), buy: [...new Set(buy)], buyN: buy.length, h: document.body.scrollHeight };
    });
    const lang = ver;
    const buyOk = m.buy.length === 1 && m.buy[0] === BUY[lang];
    const alien = (m.html.match(ALIEN[lang]) || []).concat(m.srcs.filter(x => PEOPLE[lang === 'en' ? 'tr' : 'en'].test(x)));
    const own = m.srcs.filter(x => PEOPLE[lang].test(x)).length;
    m.peopleOk = alien.length === 0 && own > 0; m.alien = alien.slice(0, 5); m.ownPeople = own;
    delete m.html; delete m.srcs;
    const ok = res.status() === 200 && m.scrollW === w && m.bad.length === 0 && errs.length === 0 && m.noAlt === 0 && m.noSize === 0 && buyOk && m.peopleOk && m.price.length === 0;
    if (!ok) fail++;
    report.push({ ver, w, status: res.status(), buyOk, ...m, errs });
    await p.screenshot({ path: `${OUT}02_${ver}_${w}_first.png` });
    await p.screenshot({ path: `${OUT}02_${ver}_${w}_full.png`, fullPage: true });
    const ad = await p.$('.ad');
    if (ad) { await ad.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}02_${ver}_${w}_ad.png` }); }
    await ctx.close();
  }
}
// переадресация: корень на /en/, старые адреса без рекламы на рекламу своей вариации
{
  const p = await b.newPage();
  const r = {};
  const go = async u => { await p.goto(BASE + u, { waitUntil: 'networkidle' }); return new URL(p.url()).pathname; };
  r.root = await go(''); r.lesson = await go('lesson/'); r.enLesson = await go('en/lesson/'); r.trLesson = await go('tr/lesson/');
  r.ok = r.root.endsWith('/en/') && r.lesson.endsWith('/tr/') && r.enLesson.endsWith('/en/') && r.trLesson.endsWith('/tr/');
  report.push({ redirect: r }); if (!r.ok) fail++;
  await p.close();
}
// интерактив: вопросы, карусель, меню (1440, en); переключателя языка нет, второго автора нет
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + 'en/', { waitUntil: 'networkidle' });
  const r = {};
  r.noLangSwitch = await p.locator('.langs, a[href*="/tr/"]').count() === 0;
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
for (const r of report) console.log(r.redirect ? 'redirect ' + JSON.stringify(r.redirect) : r.interactive ? 'interactive ' + JSON.stringify(r.interactive) : `${r.ver.padEnd(9)} ${r.w} status=${r.status} buyOk=${r.buyOk} scrollW=${r.scrollW} imgs=${r.imgs} people=${r.peopleOk}(${r.ownPeople}) alien=${JSON.stringify(r.alien)} price=${JSON.stringify(r.price)} bad=${r.bad.length} noAlt=${r.noAlt} noSize=${r.noSize} lazyMiss=${r.lazyMiss} buyLinks=${r.buyN} ${JSON.stringify(r.buy)} errs=${r.errs.length} over=${JSON.stringify(r.over)} h=${r.h}`);
console.log(fail ? `FAIL: ${fail}` : 'ALL OK');
process.exit(fail ? 1 : 0);
