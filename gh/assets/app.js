/* Сайт 02: меню, карусели, вопросы, появление блоков. Без библиотек. */
(function () {
  var D = document, $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || D).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  D.documentElement.classList.add('js');
  D.body.classList.add('js');

  // ---- меню ----
  var burger = $('.burger'), menu = $('#menu'), last = null;
  function openMenu() { last = D.activeElement; menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); D.documentElement.style.overflow = 'hidden'; $('.menu-x', menu).focus(); }
  function closeMenu() { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); D.documentElement.style.overflow = ''; last && last.focus && last.focus(); }
  burger.addEventListener('click', openMenu);
  $('.menu-x', menu).addEventListener('click', closeMenu);
  $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) closeMenu(); });
  // кнопка меню темнеет, когда уходит с неба на белый лист
  var sheet = $('.sheet');
  function burgerTone() { var t = sheet.getBoundingClientRect().top; burger.classList.toggle('dark', t < 60); }
  addEventListener('scroll', burgerTone, { passive: true }); burgerTone();

  // ---- карусели ----
  $$('[data-car]').forEach(function (car) {
    var sec = car.closest('.sec'), track = $('.car-track', car), prev = $('.arr.prev', sec), next = $('.arr.next', sec), i = 0;
    var items = [].slice.call(track.children);
    function step() { var a = items[0], b = items[1]; return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth; }
    function maxI() { var vis = car.clientWidth, total = track.scrollWidth; var s = step(); return Math.max(0, Math.ceil((total - vis) / s)); }
    function go(n) {
      var m = maxI(); i = Math.max(0, Math.min(n, m));
      var x = Math.min(i * step(), Math.max(0, track.scrollWidth - car.clientWidth));
      track.style.transform = 'translateX(' + (-x) + 'px)';
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i >= m;
      items.forEach(function (el) { var l = el.offsetLeft - x; el.setAttribute('aria-hidden', l + el.offsetWidth < 0 || l > car.clientWidth ? 'true' : 'false'); });
    }
    prev && prev.addEventListener('click', function () { go(i - 1); });
    next && next.addEventListener('click', function () { go(i + 1); });
    // свайп пальцем: на страницу не влияет, ленту не прокручивает, только листает на одну карточку
    var sx = null, sy = null;
    car.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
    car.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1));
    });
    addEventListener('resize', function () { go(i); });
    // картинки за краем ленты браузер сам не грузит: подгружаем их, когда лента рядом с экраном
    if ('IntersectionObserver' in window) {
      var pre = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { $$('img[loading="lazy"]', track).forEach(function (im) { im.loading = 'eager'; }); pre.disconnect(); } }, { rootMargin: '600px 0px' });
      pre.observe(car);
    }
    go(0);
  });

  // ---- вопросы: открыт один ----
  $$('[data-faq]').forEach(function (faq) {
    var rows = $$('.qa', faq);
    rows.forEach(function (row) {
      $('.qa-btn', row).addEventListener('click', function () {
        var open = !row.classList.contains('open');
        rows.forEach(function (r) { r.classList.remove('open'); $('.qa-btn', r).setAttribute('aria-expanded', 'false'); });
        if (open) { row.classList.add('open'); this.setAttribute('aria-expanded', 'true'); }
      });
    });
  });

  // ---- появление при прокрутке ----
  // элементы группы появляются по очереди, шаг 80 мс
  $$('[data-stagger]').forEach(function (g) {
    [].slice.call(g.children).filter(function (c) { return c.classList.contains('rv'); }).forEach(function (c, i) { c.style.setProperty('--d', (Math.min(i, 8) * 0.08) + 's'); });
  });
  // после появления задержка снимается, чтобы hover был быстрым
  D.addEventListener('transitionend', function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains('rv') && t.classList.contains('in') && e.propertyName === 'transform') { t.style.setProperty('--d', '0s'); t.classList.add('done'); }
  });
  // счётчики набегают до своего числа
  function count(el) {
    var to = +el.getAttribute('data-count'), t0 = null, dur = 1100;
    if (!to || el.hasAttribute('data-counted')) return;
    el.setAttribute('data-counted', '');
    function f(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }
    el.textContent = '0'; requestAnimationFrame(f);
  }
  var rv = $$('.rv, .rv-pop');
  if (reduce || !('IntersectionObserver' in window)) { rv.forEach(function (el) { el.classList.add('in', 'done'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      // вложенные блоки (карточки в ленте карусели за краем экрана) появляются вместе с родителем
      [e.target].concat($$('.rv, .rv-pop', e.target)).forEach(function (el) { el.classList.add('in'); io.unobserve(el); });
      $$('.num', e.target).forEach(count);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  rv.forEach(function (el) { io.observe(el); });
})();
