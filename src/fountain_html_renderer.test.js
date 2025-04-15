import assert from 'node:assert'
import test from 'node:test';
import { render } from './fountain_html_renderer.js';

test('renderer basic cases', () => {
  assert.strictEqual(render({}, 'default'), '');
});
