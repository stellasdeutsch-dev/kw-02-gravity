// Снимает раскладку страницы (блоки, тексты, картинки, иконки) для сборки файла Figma.
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const BASE = process.argv[2] || 'http://127.0.0.1:8702/';
const OUT = new URL('./data/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
for (const [ver, path] of [['ad', ''], ['lesson', 'lesson/']]) for (const w of [1440, 834, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(BASE + path, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}.rv{opacity:1!important;transform:none!important}.hero-horse{transform:none!important}' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 40)); } scrollTo({ top: 0, behavior: 'instant' }); });
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
  const data = await p.evaluate((W) => {
    const R = n => Math.round(n * 10) / 10;
    const hex = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, bb, a = 1] = m[1].split(',').map(parseFloat); if (+a === 0) return null; return { c: '#' + [r, g, bb].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(), a: +a }; };
    const NAMES = { hero: 'Первый экран', about: 'О гайде', program: 'Как устроен гайд', rows: 'Шаги', statement: 'Вывод', cards: 'Примеры', faq: 'Вопросы', reviews: 'Отзывы', price: 'Цена', author: 'Автор', footer: 'Подвал' };
    const BOX = { 'btn': 'Кнопка', 'card': 'Карточка', 'card-ph': 'Фото карточки', 'rcard': 'Карточка отзыва', 'rcard-shot': 'Скриншот отзыва', 'row': 'Ряд', 'qa': 'Вопрос', 'price-card': 'Карточка цены', 'foot': 'Подвал', 'soc': 'Соцсеть', 'sheet': 'Белый лист', 'sheet-tab': 'Язычок листа', 'hero-chip': 'Автор', 'brw': 'Окно браузера', 'brw-bar': 'Панель браузера', 'burger': 'Шапка', 'wave-photo': 'Фото автора', 'wave-text': 'Текст автора', 'car': 'Лента', 'car-track': 'Лента карточек', 'qa-ic': 'Плюс', 'stat': 'Цифра', 'arr': 'Стрелка', 'av': 'Аватар' };
    const ROLE = [['hero-logo', 'Логотип'], ['hero-title', 'Заголовок первого экрана'], ['hero-sub', 'Подзаголовок первого экрана'], ['display', 'Заголовок секции'], ['lead', 'Крупный текст'], ['stat-v', 'Цифра'], ['qa-n', 'Номер вопроса'], ['qa-q', 'Вопрос'], ['pv', 'Цена'], ['sig', 'Подпись автора'], ['fc', 'Контакт'], ['foot-logo', 'Логотип'], ['btn', 'Кнопка'], ['menu-a', 'Меню'], ['label', 'Подпись'], ['row', 'Подзаголовок'], ['note', 'Мелкий текст'], ['card-cap', 'Подпись карточки'], ['rcard-top', 'Подпись карточки'], ['stat', 'Подпись цифры'], ['price-list', 'Пункт списка'], ['ps', 'Подзаголовок'], ['wave-head', 'Подпись карточки'], ['wave-q', 'Цитата'], ['foot', 'Мелкий текст'], ['qa-a', 'Мелкий текст'], ['hero-chip', 'Кнопка'], ['big', 'Подпись карточки'], ['price-note', 'Мелкий текст']];
    const roleOf = el => { for (const [c, r] of ROLE) if (el.closest('.' + c)) return r; return 'Текст'; };
    const SYMS = {}; document.querySelectorAll('symbol').forEach(s => SYMS[s.id] = s);
    const PY = window.scrollY;
    function rectOf(el) { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top + PY, w: r.width, h: r.height }; }
    function visible(el) { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
    function radii(cs) { return ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(k => { const v = cs[k]; if (v.includes('%')) return null; return parseFloat(v) || 0; }); }
    function textNode(el, r) {
      const cs = getComputedStyle(el); let s = '', runs = [];
      const walk = (n, color) => { for (const c of n.childNodes) { if (c.nodeType === 3) { const t = c.textContent.replace(/\s+/g, ' '); if (t) { const st = s.length; s += t; if (color) runs.push([st, s.length, color]); } } else if (c.nodeType === 1) { if (c.tagName === 'BR') s += '\n'; else if (c.tagName !== 'IMG' && c.tagName !== 'svg' && !c.classList.contains('qa-ic')) { const cc = hex(getComputedStyle(c).color); walk(c, cc && cc.c !== hex(cs.color).c ? cc.c : color); } } } };
      walk(el, null); const lead = s.length - s.trimStart().length; s = s.trim(); runs = runs.map(([a, b2, c]) => [a - lead, b2 - lead, c]).filter(x => x[1] > 0);
      if (!s) return null;
      const col = hex(cs.color);
      return { t: 'x', n: s.slice(0, 42), x: r.x, y: r.y, w: r.w, h: r.h, s, ff: cs.fontFamily.split(',')[0].replace(/['"]/g, ''), fw: +cs.fontWeight, fs: parseFloat(cs.fontSize), lh: cs.lineHeight === 'normal' ? null : parseFloat(cs.lineHeight), ls: parseFloat(cs.letterSpacing) || 0, c: col ? col.c : '#111111', o: col ? col.a : 1, al: cs.textAlign === 'center' ? 'CENTER' : cs.textAlign === 'right' ? 'RIGHT' : 'LEFT', up: cs.textTransform === 'uppercase', ind: parseFloat(cs.textIndent) || 0, role: roleOf(el), ws: cs.whiteSpace === 'nowrap', runs };
    }
    function node(el) {
      if (!visible(el)) return [];
      if (el.matches('.skip,.menu,script,style,symbol,defs')) return [];
      const r = rectOf(el), cs = getComputedStyle(el);
      if (el.tagName === 'IMG') {
        let par = el.parentElement, rad = 0; while (par && par !== document.body) { const pc = getComputedStyle(par); if (pc.overflow === 'hidden' && !par.classList.contains('car')) { break; } par = par.parentElement; }
        const ir = radii(cs)[0] || 0;
        return [{ t: 'i', n: (el.alt || el.getAttribute('src').split('/').pop()).slice(0, 60), x: r.x, y: r.y, w: r.w, h: r.h, src: el.getAttribute('src').split('/').pop(), r: ir, fit: cs.objectFit === 'contain' || /horse|hat|author/.test(el.src) && cs.objectFit !== 'cover' ? 'FIT' : 'FILL' }];
      }
      if (el.tagName === 'svg') {
        const u = el.querySelector('use'); if (!u) return []; const id = u.getAttribute('href').slice(1); const sym = SYMS[id]; if (!sym) return [];
        const col = hex(cs.color); const color = col ? col.c : '#111111';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${R(r.w)}" height="${R(r.h)}" viewBox="${sym.getAttribute('viewBox')}">${sym.innerHTML.replace(/currentColor/g, color)}</svg>`;
        return [{ t: 'v', n: 'Icon / ' + id.replace('i-', ''), x: r.x, y: r.y, w: r.w, h: r.h, svg }];
      }
      const bg = hex(cs.backgroundColor); const grad = cs.backgroundImage !== 'none' ? cs.backgroundImage : null;
      const inset = cs.boxShadow.match(/inset 0px 0px 0px (\d+)px/); const insetCol = inset ? hex(cs.boxShadow.match(/rgba?\([^)]+\)/)[0]) : null;
      const clipHidden = cs.overflow === 'hidden' || cs.overflowX === 'hidden';
      const clipPath = cs.clipPath && cs.clipPath !== 'none' ? cs.clipPath.match(/#(wv-[a-z0-9]+)/)?.[1] : null;
      const cls = [...el.classList];
      const forced = el.dataset.block || el.classList.contains('ad') || el.classList.contains('sec');
      const isBox = el !== document.body && (bg || grad || inset || clipPath || forced || (clipHidden && el.children.length));
      let kids = [];
      const hasDirectText = [...el.childNodes].some(c => c.nodeType === 3 && c.textContent.trim());
      if (hasDirectText) { const tn = textNode(el, r); if (tn) kids.push(tn); for (const c of el.children) if (c.tagName === 'IMG' || c.tagName === 'svg') kids.push(...node(c)); }
      else for (const c of el.children) kids.push(...node(c));
      if (!isBox) return kids;
      const known = cls.find(c => BOX[c]);
      let name = el.dataset.block ? (NAMES[el.dataset.block] || el.dataset.block) : el.classList.contains('ad') ? 'Реклама платформы' : known ? BOX[known] : (cls[0] || el.tagName.toLowerCase());
      if (el.dataset.block && el.closest('.ad')) { const h = el.querySelector('.display'); if (h) name = h.textContent.trim(); else if (el.dataset.block === 'about') name = 'О платформе'; else if (el.dataset.block === 'statement') name = 'Призыв купить'; }
      if (known === 'card' || known === 'rcard' || known === 'row' || known === 'qa') { const t = el.querySelector('b,h3,.qa-q'); if (t) name += ' / ' + t.textContent.trim().slice(0, 30); }
      const f = { t: 'f', n: name, x: r.x, y: r.y, w: r.w, h: r.h, ch: kids };
      if (bg) { f.fill = bg.c; if (bg.a < 1) f.fo = bg.a; }
      if (grad) f.grad = grad;
      if (inset) f.st = { c: insetCol ? insetCol.c : '#111111', w: +inset[1] };
      const rr = radii(cs); if (rr.some(v => v)) f.r = rr.map(v => v ?? Math.min(r.w, r.h) / 2);
      if (cs.borderTopLeftRadius.includes('%')) f.arch = 1;
      if (clipHidden) f.clip = 1;
      if (clipPath) f.mask = clipPath;
      return [f];
    }
    // корень: фон страницы, затем шапка, первый экран и лист
    const page = { t: 'f', n: 'page', x: 0, y: 0, w: W, h: document.body.scrollHeight, grad: getComputedStyle(document.body).backgroundImage, ch: [] };
    page.ch.push(...node(document.querySelector('.burger')), ...node(document.querySelector('.hero')), ...node(document.querySelector('.sheet')));
    // пересчёт в относительные координаты
    const rel = (n, ox, oy) => { n.x = R(n.x - ox); n.y = R(n.y - oy); n.w = R(n.w); n.h = R(n.h); if (n.ch) n.ch.forEach(c => rel(c, ox + n.x, oy + n.y)); };
    rel(page, 0, 0);
    return page;
  }, w);
  // шапка фиксированная: ставим её в начало страницы
  const s = JSON.stringify(data);
  writeFileSync(`${OUT}${ver}_${w}.json`, s);
  console.log(ver, w, (s.length / 1024).toFixed(0) + 'KB');
  await p.close();
}
await b.close();
