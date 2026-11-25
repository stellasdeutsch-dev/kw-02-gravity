// Делит снятую раскладку на части для use_figma (меньше 40 КБ на вызов) и сжимает: таблица стилей текста, иконки по id.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const D = new URL('./data/', import.meta.url).pathname, O = new URL('./calls/', import.meta.url).pathname; mkdirSync(O, { recursive: true });
const I = Math.round;
function compress(n, st, ic) {
  const o = { t: n.t, x: I(n.x), y: I(n.y), w: I(n.w), h: I(n.h) };
  if (n.t === 'f') { o.n = n.n; for (const k of ['fill', 'fo', 'grad', 'st', 'r', 'clip', 'mask', 'arch']) if (n[k] !== undefined) o[k] = k === 'r' ? n.r.map(I) : n[k]; o.ch = n.ch.map(c => compress(c, st, ic)); }
  if (n.t === 'x') { const key = [n.ff, n.fw, n.fs, n.lh, n.ls, n.up ? 1 : 0, n.role].join('|'); let k = st.indexOf(key); if (k < 0) { st.push(key); k = st.length - 1; } o.k = k; o.s = n.s; o.c = n.c; if (n.o < 1) o.o = n.o; if (n.al !== 'LEFT') o.al = n.al; if (n.ind) o.ind = I(n.ind); if (n.ws) o.ws = 1; if (n.runs.length) o.ru = n.runs; }
  if (n.t === 'i') { o.n = n.n; o.src = n.src; if (n.r) o.r = I(n.r); if (n.fit === 'FIT') o.fit = 1; }
  if (n.t === 'v') { const m = n.svg.match(/viewBox="([^"]+)">(.*)<\/svg>$/s); const key = m[2]; let k = ic.indexOf(key); if (k < 0) { ic.push(key); k = ic.length - 1; } o.n = n.n; o.vb = m[1]; o.k = k; }
  return o;
}
const size = o => JSON.stringify(o).length;
for (const w of [1440, 834, 390]) {
  const page = JSON.parse(readFileSync(`${D}ad_${w}.json`, 'utf8'));
  const st = [], ic = [];
  const P = compress(page, st, ic);
  // часть 1: страница + шапка + первый экран + оболочка листа; дальше блоки листа порциями
  const sheet = P.ch.find(c => c.n === 'Белый лист');
  const sheetKids = sheet.ch; sheet.ch = [];
  const parts = [{ parent: 'ROOT', nodes: [P] }];
  // «Реклама платформы» делим на блоки
  let cur = [], curSize = 0;
  const flush = (parent) => { if (cur.length) { parts.push({ parent, nodes: cur }); cur = []; curSize = 0; } };
  for (const k of sheetKids) {
    if (k.n === 'Реклама платформы') {
      flush('SHEET');
      const adKids = k.ch; k.ch = []; parts.push({ parent: 'SHEET', nodes: [k], marks: 'AD' });
      for (const a of adKids) { const s = size(a); if (curSize + s > 30000) flush('AD'); cur.push(a); curSize += s; }
      flush('AD');
    } else { const s = size(k); if (curSize + s > 30000) flush('SHEET'); cur.push(k); curSize += s; }
  }
  flush('SHEET');
  parts.forEach((p, i) => writeFileSync(`${O}ad_${w}_${i}.json`, JSON.stringify(p)));
  writeFileSync(`${O}ad_${w}_tables.json`, JSON.stringify({ st, ic }));
  console.log(w, parts.map(p => `${p.parent}:${(size(p) / 1024).toFixed(1)}KB`).join(' '), 'styles', st.length, 'icons', ic.length);
}
// концовка версии /lesson/: блоки после «Вопросы» и подвал
for (const w of [1440, 834, 390]) {
  const page = JSON.parse(readFileSync(`${D}lesson_${w}.json`, 'utf8'));
  const st = [], ic = []; const P = compress(page, st, ic);
  const sheet = P.ch.find(c => c.n === 'Белый лист');
  const i = sheet.ch.findIndex(c => c.n === 'Вопросы');
  const tail = sheet.ch.slice(i + 1);
  writeFileSync(`${O}lesson_${w}.json`, JSON.stringify({ parent: 'SHEET', nodes: tail, pageH: P.h, sheetH: sheet.h, st, ic }));
  console.log('lesson', w, (size(tail) / 1024).toFixed(1) + 'KB', 'pageH', P.h, 'sheetH', sheet.h);
}
