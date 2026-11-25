# Склейка «образец | копия» для отчёта. Координаты образца заданы в кадре 2000 px и масштабируются.
from PIL import Image, ImageDraw, ImageFont
import os
D, R, O = 'design', 'qa/compare/raw', 'qa/compare'
F = ImageFont.truetype('/Library/Fonts/Arial Unicode.ttf', 22)
def crop(n, box):
    im = Image.open(f'{D}/02_obrazec_{n:02d}.png').convert('RGB'); k = im.width / 2000
    return im.crop(tuple(round(v * k) for v in box))
def pair(a, b, la, lb, out, H=900):
    a = a.resize((round(a.width * H / a.height), H))
    if b.height > H * 1.4: b = b.resize((round(b.width * H * 1.4 / b.height), round(H * 1.4)))
    c = Image.new('RGB', (a.width + b.width + 60, max(a.height, b.height) + 50), 'white'); d = ImageDraw.Draw(c)
    c.paste(a, (0, 50)); c.paste(b, (a.width + 60, 50)); d.text((10, 12), la, fill='black', font=F); d.text((a.width + 70, 12), lb, fill='black', font=F)
    c.save(f'{O}/{out}')
FRAME = (124, 200, 1856, 1290)
for name, n in [('about', 2), ('program', 9), ('rows', 10), ('reviews', 11), ('faq', 13), ('author', 14), ('hero', 1)]:
    pair(crop(n, FRAME), Image.open(f'{R}/1440_{name}.png').convert('RGB'), 'Образец (Behance)', 'Копия, 1440', f'02_compare_1440_{name}.png')
for name, n, box in [('hero', 3, (725, 410, 1260, 1290)), ('faq', 12, (1010, 640, 1540, 1290)), ('author', 15, (385, 235, 815, 1110))]:
    pair(crop(n, box), Image.open(f'{R}/390_{name}.png').convert('RGB'), 'Образец (макет телефона)', 'Копия, 390', f'02_compare_390_{name}.png')
print(sorted(f for f in os.listdir(O) if f.endswith('.png')))
