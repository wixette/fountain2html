import assert from 'node:assert'
import test from 'node:test';
import { parse } from './fountain_parser.js';

const TEXT_1 = `/*
Line break and boneyard test
*/

/* Two-space line break */

Action line 1.
  /* Extra spaces */
additional text.


Action line 2.
`

test('parser: basic cases', () => {
  let result = parse('');
  assert.strictEqual(result.blocks.length, 1);

  result = parse(TEXT_1);
  assert.strictEqual(result.blocks.length, 2);
});
