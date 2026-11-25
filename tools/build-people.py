"""Фото авторов сайта 02: целые кадры, как сняты, со своим фоном (людей не вырезаем, RULES.md п. 1).
Запуск: python3 tools/build-people.py
Фото Тимура: HEIC из ~/dias/timur-video/ (перевод в jpg через sips лежит в ref/whole/, не в git).
Фото Диаса: ~/dias/shared/dias-photos-web/. Откуда какой файл, записано в gh/media/PEOPLE.md.
Предметы (лошадь, шляпа) вырезаны скилом cutout и очищены defringe.py, лежат в ref/cut/."""
import os, subprocess, json, glob
from PIL import Image, ImageOps
OUT = 'gh/media'; CUT = 'ref/cut'; TW = 'ref/whole'
DW = os.path.expanduser('~/dias/shared/dias-photos-web')
def load(p): return ImageOps.exif_transpose(Image.open(p)).convert('RGB')
def webp(im, name, w=None, q=80):
    if w and im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    tmp = f'{OUT}/_tmp.png'; im.save(tmp)
    subprocess.run(['cwebp', '-quiet', '-q', str(q), '-alpha_q', '90', tmp, '-o', f'{OUT}/{name}.webp'], check=True)
    os.remove(tmp); print(name, im.size, os.path.getsize(f'{OUT}/{name}.webp') // 1024, 'KB')
def square(im, cx, cy, side):  # квадрат вокруг лица, доли ширины/высоты; фон свой
    s = round(im.width * side); x = round(im.width * cx - s / 2); y = round(im.height * cy - s / 2)
    x = max(0, min(x, im.width - s)); y = max(0, min(y, im.height - s)); return im.crop((x, y, x + s, y + s))
# Тимур, кадры 3:4 без обрезки
webp(load(f'{TW}/IMG_2849.jpg'), 'timur-author', 900)        # блок «Кто автор»
webp(load(f'{TW}/IMG_2839.jpg'), 'timur-story', 480)          # ряд «Шымкент»
webp(load(f'{TW}/IMG_2817.jpg'), 'timur-laptop', 480)         # ряд «Анталья»
webp(square(load(f'{TW}/IMG_2817.jpg'), .6, .27, .62), 'timur-avatar', 160)  # плашка в первом экране
# Диас, кадры 3:4 и 4:3 без обрезки
webp(load(f'{DW}/dias-IMG_1690.webp'), 'dias-author', 900)    # блок «Кто автор»
webp(load(f'{DW}/dias-IMG_8898-3.webp'), 'dias-coffee', 480)    # ряд «Казыгурт»
webp(load(f'{DW}/dias-IMG_2060.webp'), 'ds-study', 640)       # ряд «НИШ»
webp(load(f'{DW}/dias-IMG_6013.webp'), 'ds-colosseum', 480)   # ряд «Sapienza, Рим»
webp(square(load(f'{DW}/dias-IMG_8898-3.webp'), .45, .4, .7), 'dias-avatar', 160)  # плашка в первом экране
# предметы (генерации ElevenLabs), вырезка без каймы
webp(ImageOps.mirror(Image.open(f'{CUT}/horse-clean.png')), 'hero-horse', 1300)
webp(Image.open(f'{CUT}/hat-clean.png'), 'pic-hat', 360)
json.dump({os.path.basename(f): list(Image.open(f).size) for f in glob.glob(f'{OUT}/*.webp')}, open('tools/media-sizes.json', 'w'), indent=0)
