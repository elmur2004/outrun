// Extract the prototype's T = { en: {...}, ar: {...} } copy object from app.js without running the app.
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
const [, , appPath, outPath] = process.argv;
const src = readFileSync(appPath, 'utf8');
const start = src.indexOf('const T = {');
const end = src.indexOf('\nconst t = (k');
const literal = src.slice(start + 'const T = '.length, end).trim().replace(/;$/, '');
const T = vm.runInNewContext(`(${literal})`, {}, { timeout: 1000 });
writeFileSync(outPath, JSON.stringify(T, null, 1));
console.log('keys:', Object.keys(T.en).length, 'en /', Object.keys(T.ar).length, 'ar');
