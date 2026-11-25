import sys
from PIL import Image
src, prefix, n = sys.argv[1], sys.argv[2], int(sys.argv[3]); w = int(sys.argv[4]) if len(sys.argv) > 4 else 720
im = Image.open(src); h = im.size[1]; step = h // n + 1
for i in range(n):
    c = im.crop((0, i*step, im.size[0], min(h, (i+1)*step))); c.thumbnail((w, 5000)); c.save(f'{prefix}_{i}.png')
