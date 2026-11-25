// Данные для обновления Figma после разделения на /en/ и /tr/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const D = new URL('./data/', import.meta.url).pathname, O = new URL('./calls2/', import.meta.url).pathname; mkdirSync(O, { recursive: true });
const I = Math.round;
const AV = { 'pic-hat.webp': 'Шляпа', 'timur-avatar.webp': 'Фото Тимура', 'dias-avatar.webp': 'Фото Диаса' };
function compress(n, st, ic) {
  const o = { t: n.t, x: I(n.x), y: I(n.y), w: I(n.w), h: I(n.h) };
  if (n.t === 'f') { o.n = n.n === 'i' ? (Math.abs(n.w - n.h) < 1 ? 'Точка' : 'Плюс') : n.n; for (const k of ['fill', 'fo', 'grad', 'st', 'r', 'clip', 'mask', 'arch']) if (n[k] !== undefined) o[k] = k === 'r' ? n.r.map(I) : n[k]; o.ch = n.ch.map(c => compress(c, st, ic)); }
  if (n.t === 'x') { const key = [n.ff, n.fw, n.fs, n.lh, n.ls, n.up ? 1 : 0, n.role].join('|'); let k = st.indexOf(key); if (k < 0) { st.push(key); k = st.length - 1; } o.k = k; o.s = n.s; o.c = n.c; if (n.o < 1) o.o = n.o; if (n.al !== 'LEFT') o.al = n.al; if (n.ind) o.ind = I(n.ind); if (n.ws) o.ws = 1; if (n.runs.length) o.ru = n.runs; }
  if (n.t === 'i') { o.n = AV[n.n] || (n.n.startsWith('Сообщение:') ? 'Скриншот отзыва' : n.n.replace(/\.webp$/, '')); o.src = n.src; if (n.r) o.r = I(n.r); if (n.fit === 'FIT') o.fit = 1; }
  if (n.t === 'v') { const m = n.svg.match(/viewBox="([^"]+)">(.*)<\/svg>$/s); let k = ic.indexOf(m[2]); if (k < 0) { ic.push(m[2]); k = ic.length - 1; } o.n = n.n; o.vb = m[1]; o.k = k; }
  return o;
}
const fixInd = (n, pw) => { if (n.t === 'x' && n.ind) n.ind = I(pw * n.ind / 100); (n.ch || []).forEach(c => fixInd(c, n.w)); };
const parts = p => { const sheet = p.ch.find(c => c.n === 'Белый лист'); const ad = sheet.ch.find(c => c.n === 'Реклама платформы'); const foot = sheet.ch.find(c => c.n === 'Подвал'); const langs = p.ch.find(c => c.n === 'Языки'); return { sheet, ad, foot, langs }; };
for (const w of [1440, 834, 390]) {
  for (const lang of ['tr', 'en']) {
    const page = JSON.parse(readFileSync(`${D}${lang}_${w}.json`, 'utf8'));
    const st = [], ic = []; const P = compress(page, st, ic); fixInd(P, w);
    const { sheet, ad, foot, langs } = parts(P);
    const out = { w, pageH: P.h, sheetH: sheet.h, adH: ad.h, footY: foot.y, langs, st, ic };
    if (lang === 'tr') { out.build = ad.ch.slice(0, 2); out.ys = ad.ch.slice(2).map(c => [c.n, c.y]); }
    else { out.build = ad.ch; out.foot = foot; }
    writeFileSync(`${O}${lang}_${w}.json`, JSON.stringify(out));
    console.log(lang, w, (JSON.stringify(out).length / 1024).toFixed(1) + 'KB', 'st', st.length, out.ys ? out.ys.map(x => x[0]).join(',') : ad.ch.map(c => c.n).join(','));
  }
  for (const lang of ['trl', 'enl']) {
    const page = JSON.parse(readFileSync(`${D}${lang}_${w}.json`, 'utf8')); const st = [], ic = []; const P = compress(page, st, ic);
    writeFileSync(`${O}${lang}_${w}.json`, JSON.stringify({ langs: P.ch.find(c => c.n === 'Языки'), pageH: P.h, st, ic }));
  }
}
