// Данные для обновления Figma после «живого сайта»: пересобираем изменённые блоки листа, остальные двигаем.
// node tools/figma/prep3.mjs → tools/figma/calls3/<lang>_<w>.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const D = new URL('./data/', import.meta.url).pathname, O = new URL('./calls3/', import.meta.url).pathname; mkdirSync(O, { recursive: true });
const I = Math.round;
const NAMES = JSON.parse(readFileSync(new URL('./data/figma-hashes.json', import.meta.url), 'utf8')); // имя слоя → хэш, по секциям
const KNOWN = JSON.parse(readFileSync(new URL('./data/known-hashes.json', import.meta.url), 'utf8')); // файл → хэш
const KEEP = ['Шаги', 'Примеры', 'Путь Тимура', 'Путь Диаса', 'Как это выглядит внутри', 'Как курс выглядит внутри', 'Кому подойдёт', 'Три уровня', 'Что пишут в личку', 'Подвал'];
const RV = ['tm-rv9.webp', 'tm-rv5.webp', 'tm-rv1-c.webp', 'tm-rv8.webp', 'tm-rv10.webp', 'tm-rv4.webp'];
const miss = new Set();
function hashFor(n, sec) { if (KNOWN[n.src]) return KNOWN[n.src]; const m = NAMES[sec]; const h = m[n.n]; if (h) return h[0]; if (RV.includes(n.src)) return (m['Скриншот отзыва ' + (RV.indexOf(n.src) + 1)] || [])[0]; miss.add(n.src + ' | ' + n.n); return null; }
function compress(n, st, ic, H, sec) {
  const o = { t: n.t, x: I(n.x), y: I(n.y), w: I(n.w), h: I(n.h) };
  if (n.t === 'f') { o.n = n.n === 'i' ? (Math.abs(n.w - n.h) < 1 ? 'Точка' : 'Плюс') : n.n.replace(/\u00A0/g, ' '); for (const k of ['fill', 'fo', 'grad', 'st', 'r', 'clip', 'mask', 'arch']) if (n[k] !== undefined) o[k] = k === 'r' ? n.r.map(I) : n[k]; o.ch = n.ch.map(c => compress(c, st, ic, H, sec)); }
  if (n.t === 'x') { const key = [n.ff, n.fw, n.fs, n.lh, n.ls, n.up ? 1 : 0, n.role].join('|'); let k = st.indexOf(key); if (k < 0) { st.push(key); k = st.length - 1; } o.k = k; o.s = n.s; o.c = n.c; if (n.o < 1) o.o = n.o; if (n.al !== 'LEFT') o.al = n.al; if (n.ind) o.ind = I(n.ind); if (n.ws) o.ws = 1; if (n.runs.length) o.ru = n.runs; }
  if (n.t === 'i') { o.n = n.n; o.src = n.src; const h = hashFor(n, sec); if (h) H[n.src] = h; if (n.r) o.r = I(n.r); if (n.fit === 'FIT') o.fit = 1; }
  if (n.t === 'v') { const m = n.svg.match(/viewBox="([^"]+)">(.*)<\/svg>$/s); let k = ic.indexOf(m[2]); if (k < 0) { ic.push(m[2]); k = ic.length - 1; } o.n = n.n; o.vb = m[1]; o.k = k; }
  return o;
}
const fixInd = (n, pw) => { if (n.t === 'x' && n.ind) n.ind = I(pw * n.ind / 100); (n.ch || []).forEach(c => fixInd(c, n.w)); };
for (const lang of ['tr', 'en']) for (const w of [1440, 834, 390]) {
  const sec = lang === 'tr' ? '1:11' : '15:157';
  const page = JSON.parse(readFileSync(`${D}${lang}_${w}.json`, 'utf8'));
  const st = [], ic = [], H = {};
  const P = compress(page, st, ic, H, sec); fixInd(P, w);
  const sheet = P.ch.find(c => c.n === 'Белый лист'); const ad = sheet.ch.find(c => c.n === 'Реклама платформы');
  const plan = b => KEEP.includes(b.n) ? { n: b.n, x: b.x, y: b.y, keep: 1 } : b;
  const out = { w, pageH: P.h, sheet: { y: sheet.y, h: sheet.h }, ad: { y: ad.y, h: ad.h },
    sheetKids: sheet.ch.filter(c => c !== ad).map(plan), adKids: ad.ch.map(plan), st, ic, H };
  const s = JSON.stringify(out); writeFileSync(`${O}${lang}_${w}.json`, s);
  console.log(lang, w, (s.length / 1024).toFixed(1) + 'KB', 'keep:', [...out.sheetKids, ...out.adKids].filter(b => b.keep).map(b => b.n).join(','), '| build:', [...out.sheetKids, ...out.adKids].filter(b => !b.keep).map(b => b.n).join(','));
}
console.log('нет хэша:', [...miss].join(' ;; ') || 'нет');
