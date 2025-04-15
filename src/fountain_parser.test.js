import assert from 'node:assert'
import test from 'node:test';
import { parse } from './fountain_parser.js';

test('parser basic cases', () => {
  assert.strictEqual(JSON.stringify(parse({}, 'default')), '{}');
});
