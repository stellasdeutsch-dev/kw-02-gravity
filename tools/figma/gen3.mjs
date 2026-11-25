// node tools/figma/gen3.mjs → calls3/code_<lang>_<w>.js: код для use_figma (данные + запуск сборщика из текстового слоя builder)
import { readFileSync, writeFileSync } from 'node:fs';
const O = new URL('./calls3/', import.meta.url).pathname;
const FR = { tr_1440: '4:2', tr_834: '4:21', tr_390: '4:40', en_1440: '15:159', en_834: '15:667', en_390: '15:1178' };
const BUILDER = process.argv[2] || '28:2';
for (const [k, id] of Object.entries(FR)) {
  const d = readFileSync(`${O}${k}.json`, 'utf8'); const w = +k.split('_')[1];
  const code = `const D=${d};\nconst src=(await figma.getNodeByIdAsync('${BUILDER}')).characters;const AF=Object.getPrototypeOf(async function(){}).constructor;\nreturn await new AF('W','D','FRAME',src)(${w},D,'${id}');`;
  writeFileSync(`${O}code_${k}.js`, code); console.log(k, code.length);
}
