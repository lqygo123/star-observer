// scripts/convert-hyg-to-json.js (Node 16 + CommonJS)
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

// 默认使用与脚本同目录下的 CSV，输出也写回同目录
const SCRIPT_DIR = __dirname;
const DEFAULT_INPUT = path.join(SCRIPT_DIR, 'hygdata_v42.csv');
const DEFAULT_OUTPUT = path.join(SCRIPT_DIR, 'hyg_v3_mag6.json');

// 支持命令行自定义输入/输出：node convert-hyg-to-json.js [inputCsv] [outputJson]
const INPUT = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : DEFAULT_INPUT;
const OUTPUT = process.argv[3] ? path.resolve(process.cwd(), process.argv[3]) : DEFAULT_OUTPUT;

function toNumberOrUndefined(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

// 备注：HYG v3 中常见字段 ra（小时）/ dec（度）/ mag / ci（颜色指数），有时也含 rarad/decrad 或 RAdeg/DEdeg。
// 优先使用 RAdeg/DEdeg；否则用 ra*15 转度；再退到 rarad/decrad。
function getRaDeg(r) {
  if (r.RAdeg) return +r.RAdeg;
  if (r.ra) return +r.ra * 15;
  if (r.rarad) return (+r.rarad) * 180 / Math.PI;
  return NaN;
}
function getDecDeg(r) {
  if (r.DEdeg) return +r.DEdeg;
  if (r.dec) return +r.dec;
  if (r.decrad) return (+r.decrad) * 180 / Math.PI;
  return NaN;
}

async function main() {
  const rows = await csv().fromFile(INPUT);

  const filtered = rows
    .map(r => {
      const bvOrCi = r.bv !== undefined ? r.bv : r.ci; // HYG v3 常见为 ci
      const bv = toNumberOrUndefined(bvOrCi);
      return {
        ra: getRaDeg(r),
        dec: getDecDeg(r),
        mag: Number(r.mag),
        bv
      };
    })
    .filter(s => Number.isFinite(s.ra) && Number.isFinite(s.dec) && Number.isFinite(s.mag))
    .filter(s => s.mag <= 6.5) // 肉眼可见
    .sort((a, b) => a.mag - b.mag);

  fs.writeFileSync(OUTPUT, JSON.stringify(filtered), 'utf-8');
  console.log(`done: total=${rows.length} visible=${filtered.length} -> ${OUTPUT}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});