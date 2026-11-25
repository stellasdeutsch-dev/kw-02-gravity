"""Картинки с людьми и вырезки сайта 02 (без каймы). Запуск: python3 tools/build-people.py
Вырезки лежат в ref/cut/ (сделаны скилом cutout + defringe.py, у Тимура ещё убраны просветы стены в кудрях).
Откуда какой файл, записано в gh/media/PEOPLE.md."""
import os, subprocess, json, glob
from PIL import Image, ImageOps
OUT = 'gh/media'; CUT = 'ref/cut'
DW = os.path.expanduser('~/dias/shared/dias-photos-web')
def webp(im, name, w=None, q=80):
    if w and im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    tmp = f'{OUT}/_tmp.png'; im.save(tmp)
    subprocess.run(['cwebp', '-quiet', '-q', str(q), '-alpha_q', '90', tmp, '-o', f'{OUT}/{name}.webp'], check=True)
    os.remove(tmp); print(name, im.size, os.path.getsize(f'{OUT}/{name}.webp') // 1024, 'KB')
def crop_ratio(im, r):
    w, h = im.size
    if w / h > r: nw = round(h * r); x = (w - nw) // 2; return im.crop((x, 0, x + nw, h))
    nh = round(w / r); y = (h - nh) // 2; return im.crop((0, y, w, y + nh))
def on(im, col):
    bg = Image.new('RGBA', im.size, col + (255,)); bg.alpha_composite(im); return bg.convert('RGB')
# Тимур: ~/dias/timur-video/IMG_2855.HEIC
t = Image.open(f'{CUT}/timur-2855-final.png')
webp(t.crop((0, 0, t.width, round(t.height * .56))), 'timur-author', 820)
s = round(t.width * .5); x = round(t.width * .24)
webp(on(t.crop((x, 0, x + s, s)), (174, 198, 255)), 'timur-avatar', 160)
# Тимур: ~/dias/timur-video/IMG_2843.HEIC, на голубом фоне
t = Image.open(f'{CUT}/timur-2843-final.png'); pad = round(t.width * .05)
sq = Image.new('RGBA', (t.width, t.width), (0, 0, 0, 0)); sq.alpha_composite(t.crop((0, 0, t.width, t.width - pad)), (0, pad))
webp(on(sq, (124, 184, 236)), 'timur-story', 600)
# Диас: ~/dias/dias photos/IMG_1690.HEIC (вырезка), веб-копии из dias-photos-web
d = Image.open(f'{CUT}/dias-1690-final.png')
webp(d.crop((0, 0, d.width, round(d.height * .62))), 'dias-author', 820)
s = round(d.width * .46); x = round(d.width * .12)
webp(on(d.crop((x, 0, x + s, s)), (174, 198, 255)), 'dias-avatar', 160)
webp(crop_ratio(Image.open(f'{DW}/dias-IMG_2060.webp').convert('RGB'), 4 / 3), 'ds-study', 900)
webp(crop_ratio(Image.open(f'{DW}/dias-IMG_1690.webp').convert('RGB'), 3 / 4), 'ds-colosseum', 700)
# предметы (генерации ElevenLabs), тоже без каймы
webp(ImageOps.mirror(Image.open(f'{CUT}/horse-clean.png')), 'hero-horse', 1300)
webp(Image.open(f'{CUT}/hat-clean.png'), 'pic-hat', 360)
json.dump({os.path.basename(f): list(Image.open(f).size) for f in glob.glob(f'{OUT}/*.webp')}, open('tools/media-sizes.json', 'w'), indent=0)
