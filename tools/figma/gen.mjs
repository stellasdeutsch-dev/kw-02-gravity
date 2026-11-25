// node tools/figma/gen.mjs <файл части> <ширина> <родитель> → печатает код для use_figma
import { readFileSync } from 'node:fs';
const [, , part, w, parent] = process.argv;
const dir = new URL('./', import.meta.url).pathname;
const data = readFileSync(part, 'utf8');
const tables = readFileSync(`${dir}calls/ad_${w}_tables.json`, 'utf8');
const code = readFileSync(`${dir}builder.js`, 'utf8').replace('__W__', w).replace('__PARENT__', parent).replace('__DATA__', () => data).replace('__TABLES__', () => tables);
process.stdout.write(code);
