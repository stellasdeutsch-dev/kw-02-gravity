---
name: verify
description: Собрать и проверить сайт 02 перед коммитом (сборка, локальный сервер, Playwright на 1440/834/390, обе версии).
---
1. `node tools/build.mjs` — собирает en, tr, их lesson и переадресации, печатает `OK`.
2. Сервер: `cd gh && python3 -m http.server 8702 --bind 127.0.0.1` (в фоне).
3. `node qa/qa.mjs` — в конце `ALL OK`. Проверяет: статус 200, нет бокового скролла (scrollWidth = ширина), все картинки загрузились, у всех alt/width/height и lazy, нет ошибок в консоли, в en ссылка покупки Dias English, в tr Alterna Timur, в lesson ссылок покупки нет; `/` ведёт на `/en/`, `/lesson/` на `/tr/lesson/`, работают вопросы, карусель, меню.
4. Скриншоты в `qa/shots/`, сравнение с образцом: `node qa/compare.mjs && python3 qa/compare.py` → `qa/compare/`.
Звук не включать: браузер запускается с `--mute-audio`.
