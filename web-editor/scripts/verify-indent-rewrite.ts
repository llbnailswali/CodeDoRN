/** Compares two dump-data-exports JSON files: every difference must be ONLY leading-space halving of a code line. */
import fs from 'node:fs';
const [a, b] = [JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))];
let strDiffs = 0, same = 0; const bad: string[] = [];
function lineOk(x: string, y: string) {
  const lx = x.split('\n'), ly = y.split('\n');
  if (lx.length !== ly.length) return false;
  return lx.every((l, i) => {
    const sx = (l.match(/^ */) as RegExpMatchArray)[0].length, sy = (ly[i].match(/^ */) as RegExpMatchArray)[0].length;
    return l.slice(sx) === ly[i].slice(sy) && (sx === sy || sy === sx / 2 || sy === sx / 4);
  });
}
function walk(x: any, y: any, p: string) {
  if (typeof x === 'string' && typeof y === 'string') {
    if (x === y) { same++; return; }
    strDiffs++; if (!lineOk(x, y)) bad.push(p);
  } else if (Array.isArray(x) && Array.isArray(y)) {
    if (x.length !== y.length) { bad.push(p + ' (array length)'); return; }
    // arrays of code lines: line-wise comparison handled by element-wise string compare
    x.forEach((v, i) => walk(v, y[i], `${p}[${i}]`));
  } else if (x && y && typeof x === 'object' && typeof y === 'object') {
    const kx = Object.keys(x), ky = Object.keys(y);
    if (kx.join() !== ky.join()) { bad.push(p + ' (keys)'); return; }
    kx.forEach((k) => walk(x[k], y[k], `${p}.${k}`));
  } else if (x !== y) bad.push(p + ' (value)');
}
walk(a, b, '');
console.log(`unchanged strings: ${same}, changed strings: ${strDiffs}, violations: ${bad.length}`);
bad.slice(0, 20).forEach((p) => console.log('  ', p));
process.exit(bad.length ? 1 : 0);
