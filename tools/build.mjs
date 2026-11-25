// Сборка сайта 02 из content.en.json и content.tr.json:
// gh/en/ (реклама Dias English) и gh/tr/ (реклама Alterna Timur). Версий без рекламы нет.
// Старые адреса: gh/ → /en/, gh/lesson/ → /tr/, gh/en/lesson/ → /en/, gh/tr/lesson/ → /tr/.
// Запуск из папки сайта: node tools/build.mjs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['en', 'tr'];
let C, AD; // текущая вариация (меняется в цикле сборки)

// ---------- текст ----------
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// неразрывный пробел после коротких слов, чтобы одна-две буквы не висели в конце строки
const nb = s => s.replace(/(^|[\s(«])([А-Яа-яЁёA-Za-z0-9]{1,2})\s/g, '$1$2 ').replace(/(^|[\s(«])([А-Яа-яЁёA-Za-z0-9]{1,2})\s/g, '$1$2 ');
// *слово* выделяется цветом, [[фраза]] помечается языком вариации (en/tr)
const T = s => nb(esc(s)).replace(/\*([^*]+)\*/g, '<em class="hl">$1</em>').replace(/\[\[([^\]]+)\]\]/g, (m, p) => `<span class="fx" lang="${C.exampleLang}">${p}</span>`).replace(/\n/g, '<br>');
const attr = esc;
const link = (href) => href === 'BUY' ? AD.buy : href;
const ext = href => /^https?:/.test(href);
const A = (href, cls, inner, extra = '') => {
  const h = link(href);
  return `<a class="${cls}" href="${attr(h)}"${ext(h) ? ' target="_blank" rel="noopener"' : ''}${extra}>${inner}</a>`;
};
const ico = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

let MEDIA = 'media/';
const img = (src, w, h, alt, cls = '', eager = false) =>
  `<img class="${cls}" src="${MEDIA}${attr(src)}" width="${w}" height="${h}" alt="${attr(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const SIZES = JSON.parse(readFileSync(resolve(ROOT, 'tools/media-sizes.json'), 'utf8'));
const imgAuto = (src, alt, cls = '') => { const s = SIZES[src] || [400, 400]; return img(src, s[0], s[1], alt, cls); };

const COLORS = ['yellow', 'pink', 'blue'];
const ROWC = ['blue', 'white', 'yellow', 'pink'];

// ---------- блоки ----------
const R = {
  hero(b) {
    const len = b.logo.join(' ').length;
    return `<section class="hero" id="${b.id || 'top'}" data-block="hero" style="--len:${len}">
  <div class="hero-logo" aria-hidden="true"><span>${esc(b.logo[0])}</span> <span class="y">${esc(b.logo[1])}</span></div>
  <div class="hero-stage">
    ${img(b.image.src, b.image.w, b.image.h, b.image.alt, 'hero-horse', true)}
    <div class="hero-chip">${img(AD.person.avatar, 160, 160, '', '', true)}<span>Автор: ${esc(AD.person.name)}</span></div>
  </div>
  <h1 class="hero-title rv">${T(b.title)}</h1>
  <p class="hero-sub rv">${T(b.subtitle)}</p>
</section>`;
  },
  about(b) {
    const stats = (b.stats || []).map((s, i) => `<div class="stat rv"><span class="stat-v ${[0,3].includes(i % 4) ? 't-pink' : 't-blue'}">${esc(s.value)}${s.unit ? `<small>${esc(s.unit)}</small>` : ''}</span><b>${T(s.title)}</b><span class="stat-s">${T(s.sub)}</span></div>`).join('');
    return `<section class="sec about" id="${b.id}" data-block="about">
  <div class="lead-wrap rv"><p class="label">${T(b.label)}</p><p class="lead indent">${T(b.text)}</p></div>
  <div class="col2">
    ${b.note ? `<p class="note rv">${T(b.note)}</p>` : ''}
    ${b.button ? `<div class="btns rv">${A(b.button.href, 'btn', esc(b.button.label))}</div>` : ''}
  </div>
  ${stats ? `<div class="stats-wrap"><p class="label rv">${T(b.statsLabel)}</p><div class="stats">${stats}</div></div>` : ''}
</section>`;
  },
  program(b) {
    const av = (b.avatars || []).map(a => imgAuto(a, '', 'av')).join('');
    return `<section class="sec program" id="${b.id}" data-block="program">
  <div class="lead-wrap rv"><div class="label-row"><p class="label">${T(b.label)}</p><div class="avs" aria-hidden="true">${av}</div></div><p class="lead indent">${T(b.text)}</p></div>
  <div class="prog-row">
    <div class="prog-btn rv">${A(b.button.href, 'btn', esc(b.button.label))}</div>
    <figure class="prog-pic rv">${img(b.image.src, b.image.w, b.image.h, b.image.alt)}</figure>
    <div class="prog-txt rv">${b.paras.map(p => `<p class="note">${T(p)}</p>`).join('')}</div>
  </div>
</section>`;
  },
  rows(b) {
    const items = b.items.map((r, i) => `<div class="row c-${r.color || ROWC[i % ROWC.length]} rv"><h3>${T(r.title)}</h3><p>${T(r.text)}</p>${r.img ? imgAuto(r.img, r.alt, 'row-pic') : '<span></span>'}</div>`).join('');
    return `<section class="sec rows-sec" id="${b.id || ''}" data-block="rows">
  ${b.title ? `<h2 class="display rv">${T(b.title)}</h2>` : ''}
  <div class="rows">${items}</div>
</section>`;
  },
  statement(b) {
    return `<section class="sec statement" data-block="statement"${b.id ? ` id="${b.id}"` : ''}>
  <p class="lead big rv">${T(b.text)}</p>
  ${b.button ? `<div class="btns rv">${A(b.button.href, 'btn', esc(b.button.label))}</div>` : ''}
</section>`;
  },
  cards(b) {
    const items = b.items.map((c, i) => `<article class="card c-${c.color || COLORS[i % 3]}"><div class="card-ph">${img(c.img, c.w, c.h, c.alt)}</div><div class="card-cap"><b>${T(c.name)}</b><span>${T(c.sub)}</span></div></article>`).join('');
    const big = b.big ? `<figure class="big rv"><div class="brw"><div class="brw-bar"><i></i><i></i><i></i></div>${img(b.big.img, b.big.w, b.big.h, b.big.alt)}</div><figcaption><b>${T(b.big.name)}</b><span>${T(b.big.sub)}</span></figcaption></figure>` : '';
    return `<section class="sec cards-sec" id="${b.id}" data-block="cards">
  <div class="sec-head rv"><h2 class="display">${T(b.title)}</h2>${arrows()}</div>
  ${big}
  <div class="car rv" data-car><div class="car-track">${items}</div></div>
</section>`;
  },
  reviews(b) {
    const items = b.items.map((r, i) => `<article class="rcard c-${['pink', 'yellow', 'blue'][i % 3]}${r.w / r.h > 2.2 ? ' wide' : ''}"><div class="rcard-top"><b>Сообщение в личку</b><span>имя и аватар убраны</span></div><div class="rcard-shot">${img(r.img, r.w, r.h, r.alt)}</div></article>`).join('');
    return `<section class="sec reviews-sec" id="${b.id}" data-block="reviews">
  <div class="sec-head rv"><h2 class="display">${T(b.title)}</h2>${arrows()}</div>
  ${b.note ? `<p class="note sec-note rv">${T(b.note)}</p>` : ''}
  <div class="car rv" data-car><div class="car-track">${items}</div></div>
</section>`;
  },
  price(b) {
    return `<section class="sec price-sec" id="${b.id}" data-block="price">
  <h2 class="display rv">${T(b.title)}</h2>
  <div class="price-card rv">
    <div class="price-l"><div class="pv">${esc(b.price)}</div><p class="ps">${T(b.sub)}</p></div>
    <ul class="price-list">${b.list.map((l, i) => `<li>${ico(['grammar', 'words', 'play', 'exam', 'work', 'film', 'steps'][i % 7])}<span>${T(l)}</span></li>`).join('')}</ul>
    <div class="btns price-btns">${b.buttons.map(x => A(x.href, 'btn' + (x.line ? ' line' : ''), (x.icon ? ico(x.icon) : '') + `<span>${esc(x.label)}</span>`)).join('')}</div>
    ${b.note ? `<p class="price-note">${T(b.note)}</p>` : ''}
  </div>
</section>`;
  },
  faq(b) {
    const items = b.items.map((f, i) => {
      const id = `${b.id}-a${i + 1}`;
      return `<div class="qa${f.open ? ' open' : ''}">
    <button class="qa-btn" type="button" aria-expanded="${f.open ? 'true' : 'false'}" aria-controls="${id}"><span class="qa-n">${String(i + 1).padStart(2, '0')}</span><span class="qa-q">${T(f.q)}</span><span class="qa-ic" aria-hidden="true"><i></i><i></i></span></button>
    <div class="qa-a" id="${id}" role="region"><div class="qa-in">${f.img ? imgAuto(f.img, '', 'qa-pic') : ''}<p>${T(f.a)}</p></div></div>
  </div>`;
    }).join('');
    return `<section class="sec faq-sec" id="${b.id}" data-block="faq">
  <h2 class="display rv">${T(b.title)}</h2>
  <div class="faq rv" data-faq>${items}</div>
</section>`;
  },
  author(b) {
    return `<section class="sec author-sec" data-block="author"${b.id ? ` id="${b.id}"` : ''}>
  ${b.title ? `<h2 class="display rv">${T(b.title)}</h2>` : ''}
  <div class="wave rv">
    <div class="wave-photo">${img(b.photo.src, b.photo.w, b.photo.h, b.photo.alt)}</div>
    <div class="wave-text">
      <div class="wave-in">
        <div class="wave-head"><div><b>${T(b.name)}</b><span>${T(b.role)}</span></div>${b.hat ? imgAuto(b.hat, '', 'wave-hat') : ''}</div>
        <p class="wave-q">«${T(b.quote)}»</p>
        <p class="sig" aria-hidden="true">${esc(b.signature)}</p>
        ${b.button ? `<div class="btns wave-btns">${A(b.button.href, 'btn', esc(b.button.label))}</div>` : ''}
      </div>
    </div>
  </div>
</section>`;
  },
};
function arrows() {
  return `<div class="arrows"><button type="button" class="arr prev" aria-label="Назад" disabled>${ico('arrow-l', 'ic-arr')}</button><button type="button" class="arr next" aria-label="Дальше">${ico('arrow-r', 'ic-arr')}</button></div>`;
}

function footer(f) {
  return `<footer class="foot" data-block="footer">
  <div class="foot-row">
    <a class="foot-logo" href="#top" aria-label="Наверх"><span>${esc(f.logo[0])}</span><span class="y">${esc(f.logo[1])}</span></a>
    ${f.contacts ? `<div class="foot-contacts">${f.contacts.map(c => A(c.href, 'fc fc-' + c.tone, esc(c.label))).join('')}</div>` : ''}
    <nav class="foot-nav" aria-label="Разделы">${f.nav.map(([l, h]) => A(h, 'fn', esc(l))).join('')}</nav>
    ${f.socials ? `<div class="foot-soc">${f.socials.map(s => A(s.href, 'soc', ico(s.icon), ` aria-label="${attr(s.label)}"`)).join('')}</div>` : ''}
  </div>
  <div class="foot-bottom">
    ${f.note ? `<p>${T(f.note)}</p>` : '<p></p>'}
    <p>${esc(f.copyright)}</p>
    ${f.links ? f.links.map(([l, h]) => A(h, 'fl', esc(l))).join('') : ''}
  </div>
</footer>`;
}

function themeCss(t) {
  return `:root{--pink:${t.pink};--yellow:${t.yellow};--blue:${t.blue};--sky-top:${t.skyTop};--sky-bottom:${t.skyBottom};--ink:${t.ink};--grey:${t.grey};--white:${t.white};--f-display:${t.fontDisplay};--f-body:${t.fontBody};--f-script:${t.fontScript};--h-case:${t.headingCase}}`;
}

const SPRITE = readFileSync(resolve(ROOT, 'tools/sprite.svg'), 'utf8');

function page() {
  const base = '../';
  MEDIA = base + 'media/';
  const useful = C.blocks.map(b => R[b.type](b)).join('\n');
  const hero = useful.split('\n</section>')[0] + '\n</section>';
  const restUseful = C.blocks.slice(1).map(b => R[b.type](b)).join('\n');
  const tail = `<div class="ad" data-ad="${C.lang}">\n${AD.blocks.map(b => R[b.type](b)).join('\n')}\n</div>\n${footer(AD.footer)}`;
  const nav = AD.footer.nav;
  const t = C.meta;
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)}</title>
<meta name="description" content="${attr(t.description)}">
<meta property="og:title" content="${attr(t.title)}">
<meta property="og:description" content="${attr(t.description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="${C.theme.skyTop}">
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${base}assets/fonts/alumni-sans-900-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}assets/fonts/inter-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${base}assets/style.css">
<style>${themeCss(C.theme)}</style>
<script src="${base}assets/app.js" defer></script>
</head>
<body class="v-ad">
${SPRITE}
<a class="skip" href="#about">К содержанию</a>
<button class="burger" type="button" aria-label="Меню" aria-expanded="false" aria-controls="menu"><i></i><i></i><i></i></button>
<div class="menu" id="menu" hidden>
  <button class="menu-x" type="button" aria-label="Закрыть меню">${ico('close')}</button>
  <nav aria-label="Меню">${nav.map(([l, h]) => A(h, 'menu-a', esc(l))).join('')}${A('BUY', 'btn', 'Купить доступ')}</nav>
</div>
<main>
${hero}
<div class="sheet">
  <a class="sheet-tab" href="#about" aria-label="Листать вниз">${ico('chev')}</a>
${restUseful}
${tail}
</div>
</main>
</body>
</html>
`;
}

const redirect = (to, title) => `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}">
<script>location.replace(${JSON.stringify(to)} + location.hash)</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:600 18px/1.4 system-ui,sans-serif;background:#1C84D4;color:#fff}a{color:#F7F92E}</style>
</head><body><p>Открываем гайд: <a href="${to}">${to}</a></p></body></html>
`;
for (const lang of LANGS) {
  C = JSON.parse(readFileSync(resolve(ROOT, `content.${lang}.json`), 'utf8'));
  AD = C.ad;
  mkdirSync(resolve(ROOT, `gh/${lang}/lesson`), { recursive: true });
  writeFileSync(resolve(ROOT, `gh/${lang}/index.html`), page());
  writeFileSync(resolve(ROOT, `gh/${lang}/lesson/index.html`), redirect('../', 'Гайд'));
}
mkdirSync(resolve(ROOT, 'gh/lesson'), { recursive: true });
writeFileSync(resolve(ROOT, 'gh/index.html'), redirect('en/', 'Гайд'));
writeFileSync(resolve(ROOT, 'gh/lesson/index.html'), redirect('../tr/', 'Гайд'));
console.log('OK: gh/en/, gh/tr/; переадресации: gh/ → en/, gh/lesson/ → tr/, gh/en/lesson/ → en/, gh/tr/lesson/ → tr/');
