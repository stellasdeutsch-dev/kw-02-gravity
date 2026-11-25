"""Собирает картинки сайта 02 в gh/media (webp). Запуск: python3 tools/build-media.py <папка_с_исходниками>"""
import sys, os, subprocess, shutil
from PIL import Image, ImageOps
SRC = sys.argv[1]; OUT = 'gh/media'; os.makedirs(OUT, exist_ok=True)
TM = os.path.expanduser('~/Desktop/Projects/ccccc/turkce-ev-esyalari/media')
IZ = 'ref/turkce-izafet/media'
DS = os.path.expanduser('~/dias/3/sharp/gh/media')
DC = os.path.expanduser('~/dias/2/past-simple/capture')
def webp(im, name, w=None, q=80):
    if w and im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    tmp = f'{OUT}/_tmp.png'; im.save(tmp)
    subprocess.run(['cwebp', '-quiet', '-q', str(q), '-alpha_q', '90', tmp, '-o', f'{OUT}/{name}.webp'], check=True)
    os.remove(tmp); return im.size
def crop_ratio(im, r):  # центр, ширина/высота = r
    w, h = im.size
    if w / h > r: nw = round(h * r); x = (w - nw) // 2; return im.crop((x, 0, x + nw, h))
    nh = round(w / r); y = (h - nh) // 2; return im.crop((0, y, w, y + nh))
sizes = {}
# генерации (ElevenLabs) и вырезки
sizes['hero-horse'] = webp(ImageOps.mirror(Image.open(f'{SRC}/gen/horse-cut.png')), 'hero-horse', 1300)
sizes['pic-cart'] = webp(crop_ratio(Image.open(f'{SRC}/gen/cart.png').convert('RGB'), 1.44), 'pic-cart', 900)
sizes['pic-flower'] = webp(crop_ratio(Image.open(f'{SRC}/gen/flower.png').convert('RGB'), 1), 'pic-flower', 520)
sizes['pic-sneakers'] = webp(crop_ratio(Image.open(f'{SRC}/gen/sneakers.png').convert('RGB'), 1), 'pic-sneakers', 520)
sizes['pic-balloons'] = webp(crop_ratio(Image.open(f'{SRC}/gen/balloons.png').convert('RGB'), 1), 'pic-balloons', 520)
sizes['pic-hat'] = webp(Image.open(f'{SRC}/gen/hat-cut.png'), 'pic-hat', 360)
t = Image.open(f'{SRC}/timur-2855.png'); t = t.crop((0, 0, t.width, round(t.height * .56)))
sizes['timur-author'] = webp(t, 'timur-author', 820)
a = Image.open(f'{SRC}/timur-2855.png'); s = round(a.width * .5); a = a.crop((round(a.width*.24), 0, round(a.width*.24) + s, s))
bg = Image.new('RGBA', a.size, (174, 198, 255, 255)); bg.alpha_composite(a); sizes['timur-avatar'] = webp(bg.convert('RGB'), 'timur-avatar', 160)
d = Image.open(f'{SRC}/dias-1690.png'); d = d.crop((0, 0, d.width, round(d.height * .62)))
sizes['dias-author'] = webp(d, 'dias-author', 820)
a = Image.open(f'{SRC}/dias-1690.png'); s = round(a.width * .46); a = a.crop((round(a.width*.12), 0, round(a.width*.12) + s, s))
bg = Image.new('RGBA', a.size, (174, 198, 255, 255)); bg.alpha_composite(a); sizes['dias-avatar'] = webp(bg.convert('RGB'), 'dias-avatar', 160)
# Alterna Timur: телефон, рабочий стол, отзывы
for n in ['1961', '1917', '1924', '1928', '1951', '1946', '1956', '1926']:
    sizes[f'tm-ph-{n}'] = webp(Image.open(f'{TM}/phone/{n}.webp').convert('RGB'), f'tm-ph-{n}', 520)
for n in ['notion-b1', 'notion-progress', 'notion-rooms']:
    sizes[f'tm-{n}'] = webp(Image.open(f'{TM}/desk/{n}.webp').convert('RGB'), f'tm-{n}', 1200)
for n in ['topics', 'tracker', 'home-a0']:
    sizes[f'tm-n-{n}'] = webp(Image.open(f'{TM}/notion/{n}.webp').convert('RGB'), f'tm-n-{n}', 1100)
for n in ['rv9', 'rv5', 'rv1-c', 'rv8', 'rv10', 'rv4']:
    sizes[f'tm-{n}'] = webp(Image.open(f'{IZ}/{n}.webp').convert('RGB'), f'tm-{n}', 980)
# Dias English
for n in ['m-roadmap-0', 'm-gemini-1', 'm-lexika-1', 'm-home-a2-0', 'm-pastsimple-1', 'm-home-b2-2', 'm-home-a2-3', 'm-roadmap-4']:
    sizes[f'ds-{n}'] = webp(Image.open(f'{DC}/{n}.png').convert('RGB'), f'ds-{n}', 520, 76)
for n in ['ad-home-b2', 'ad-roadmap', 'n-lexika', 'n-habits', 'ad-grammar']:
    sizes[f'ds-{n}'] = webp(Image.open(f'{DS}/{n}.webp').convert('RGB'), f'ds-{n}', 1200)
for k, v in sizes.items(): print(k, v[0], v[1], os.path.getsize(f'{OUT}/{k}.webp') // 1024, 'KB')
# размеры для сборки (width/height у <img>)
import json, glob
json.dump({os.path.basename(f): list(Image.open(f).size) for f in glob.glob(f'{OUT}/*.webp')}, open('tools/media-sizes.json', 'w'), indent=0)
