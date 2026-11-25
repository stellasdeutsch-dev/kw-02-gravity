# Люди на картинках сайта 02

Правило: в `/en/` только Диас (Dias English), в `/tr/` только Тимур (Alterna Timur).
Фото Диаса берутся только из `~/dias/shared/dias-photos-web/` (оригиналы `~/dias/dias photos/`).
Фото Тимура берутся только из `~/dias/timur-video/` и `~/dias/video/timur-clips/photos/`.
Вырезки сделаны скилом `cutout` из оригинала и очищены `defringe.py`, без обводки и тени. Сборка: `python3 tools/build-people.py`.

| Файл на сайте | Где стоит | Исходный файл | Кто |
|---|---|---|---|
| `timur-author.webp` | `/tr/`, блок «Кто автор» | `~/dias/timur-video/IMG_2855.HEIC` (вырезка) | Тимур |
| `timur-avatar.webp` | `/tr/`, плашка автора и ряд «Шымкент» | `~/dias/timur-video/IMG_2855.HEIC` (вырезка, голова на голубом) | Тимур |
| `timur-story.webp` | `/tr/`, ряд «Анталья» | `~/dias/timur-video/IMG_2843.HEIC` (вырезка на голубом) | Тимур |
| `tm-cert.webp` | `/tr/`, ряд «TÖMER C1, IELTS 7.5» | сертификат TÖMER Тимура, людей на фото нет | Тимур (имя в сертификате) |
| `dias-author.webp` | `/en/`, блок «Кто автор» | `~/dias/dias photos/IMG_1690.HEIC` (вырезка) | Диас |
| `dias-avatar.webp` | `/en/`, плашка автора и ряд «Казыгурт» | `~/dias/dias photos/IMG_1690.HEIC` (вырезка, голова на голубом) | Диас |
| `ds-study.webp` | `/en/`, ряд «НИШ» | `~/dias/shared/dias-photos-web/dias-IMG_2060.webp` | Диас |
| `ds-colosseum.webp` | `/en/`, ряд «Sapienza, Рим» | `~/dias/shared/dias-photos-web/dias-IMG_1690.webp` | Диас |

Остальные картинки без авторов:
- `hero-horse.webp`, `pic-hat.webp`, `pic-cart.webp`, `pic-flower.webp`, `pic-sneakers.webp`, `pic-balloons.webp` — генерации ElevenLabs, людей нет.
- `ds-*` — экраны платформы Dias English, `tm-ph-*`, `tm-n-*`, `tm-notion-*` — экраны Alterna Timur. На них только стоковые картинки тем внутри платформы, Диаса и Тимура нет.
- `tm-rv*` — отзывы из сообщений, имена и аватарки убраны.
