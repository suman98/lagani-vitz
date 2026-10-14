// node scripts/financialViews.check.mjs  (Node >= 23.6 strips the .ts types natively)
import assert from 'node:assert/strict';
import {
  commonSize,
  growthAmount,
  growthPct,
  heat,
  heatColor,
  perShare,
  shiftFiscalYear,
  toNumber,
} from '../src/lib/financialViews.ts';

assert.equal(toNumber('-1315335'), -1315335);
assert.equal(toNumber('-'), null);
assert.equal(toNumber('ICRA'), null);
assert.equal(toNumber(null), null);

assert.equal(shiftFiscalYear('082-083', -1), '081-082');
assert.equal(shiftFiscalYear('082-083', -5), '077-078');

assert.equal(growthAmount(150, 100), 50);
assert.equal(growthAmount(150, null), null);

assert.equal(growthPct(150, 100, 1), 0.5);
assert.equal(growthPct(-50, -100, 1), 0.5); // loss halved
assert.equal(growthPct(100, 0, 1), null);
assert.ok(Math.abs(growthPct(133.1, 100, 3) - 0.1) < 1e-12); // 10% a year for 3 years
assert.equal(growthPct(100, -50, 3), null);

assert.equal(commonSize(25, 200), 0.125);
assert.equal(commonSize(25, 0), null);

assert.equal(heat(5, [0, 5, 10]), 0.5);
assert.equal(heat(7, [7, 7]), null);
assert.equal(heat(null, [1, 2]), null);

assert.equal(perShare(2000, 10000), 20); // 100 shares
assert.equal(perShare(2000, null), null);

assert.equal(heatColor(0), 'rgb(248, 105, 107)');
assert.equal(heatColor(0.5), 'rgb(255, 235, 132)');
assert.equal(heatColor(1), 'rgb(99, 190, 123)');

console.log('financialViews: ok');
