# Люди на картинках сайта 02

Правило: в `/en/` только Диас (Dias English), в `/tr/` только Тимур (Alterna Timur).
Фото Диаса берутся только из `~/dias/shared/dias-photos-web/` (оригиналы `~/dias/dias photos/`).
Фото Тимура берутся только из `~/dias/timur-video/` и `~/dias/video/timur-clips/photos/`.
Людей не вырезаем: все фото целые, как сняты, со своим фоном. Кадры 3:4 и 4:3 стоят без обрезки, в волне автора и в рядах обрезает только форма рамки. Плашка «Автор» в первом экране — квадрат вокруг лица из того же снимка, фон свой. Сборка: `python3 tools/build-people.py`.

| Файл на сайте | Где стоит | Исходный файл | Кто |
|---|---|---|---|
| `timur-author.webp` | `/tr/`, блок «Кто автор» | `~/dias/timur-video/IMG_2849.HEIC` | Тимур |
| `timur-story.webp` | `/tr/`, ряд «Шымкент» | `~/dias/timur-video/IMG_2839.HEIC` | Тимур |
| `timur-laptop.webp` | `/tr/`, ряд «Анталья» | `~/dias/timur-video/IMG_2817.HEIC` | Тимур |
| `timur-avatar.webp` | `/tr/`, плашка «Автор: Тимур» | `~/dias/timur-video/IMG_2817.HEIC` (квадрат вокруг лица) | Тимур |
| `tm-cert.webp` | `/tr/`, ряд «TÖMER C1, IELTS 7.5» | сертификат TÖMER Тимура, людей на фото нет | Тимур (имя в сертификате) |
| `dias-author.webp` | `/en/`, блок «Кто автор» | `~/dias/shared/dias-photos-web/dias-IMG_1690.webp` | Диас |
| `dias-coffee.webp` | `/en/`, ряд «Казыгурт» | `~/dias/shared/dias-photos-web/dias-IMG_8898-3.webp` | Диас |
| `ds-study.webp` | `/en/`, ряд «НИШ» | `~/dias/shared/dias-photos-web/dias-IMG_2060.webp` | Диас |
| `ds-colosseum.webp` | `/en/`, ряд «Sapienza, Рим» | `~/dias/shared/dias-photos-web/dias-IMG_6013.webp` | Диас |
| `dias-avatar.webp` | `/en/`, плашка «Автор: Диас» | `~/dias/shared/dias-photos-web/dias-IMG_8898-3.webp` (квадрат вокруг лица) | Диас |

Остальные картинки без авторов:
- `en-books.webp`, `en-london.webp` (только `/en/`), `tr-tea.webp`, `tr-istanbul.webp` (только `/tr/`) — генерации ElevenLabs, предметы без людей, вырезаны `cutout` + `defringe.py`.
- `hero-horse.webp`, `pic-hat.webp` — генерации ElevenLabs, вырезаны скилом `cutout` и очищены `defringe.py`. `pic-cart.webp`, `pic-flower.webp`, `pic-sneakers.webp`, `pic-balloons.webp` — генерации целиком.
- `ds-*` (экраны) — платформа Dias English, `tm-ph-*`, `tm-n-*`, `tm-notion-*` — Alterna Timur. На них только стоковые картинки тем внутри платформы, Диаса и Тимура нет.
- `tm-rv*` — отзывы из сообщений, имена и аватарки убраны.
