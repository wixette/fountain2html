import assert from 'node:assert'
import test from 'node:test';
import { render, inlineTagsToHtml } from './fountain_html_renderer.js';

test('inline html format', () => {
  assert.strictEqual(
    inlineTagsToHtml(undefined),
    ''
  );

  assert.strictEqual(
    inlineTagsToHtml(''),
    ''
  );

  assert.strictEqual(
    inlineTagsToHtml('*italics* text'),
    '<span class="italic">italics</span> text'
  );

  assert.strictEqual(
    inlineTagsToHtml('**bold** text'),
    '<span class="bold">bold</span> text'
  );

  assert.strictEqual(
    inlineTagsToHtml('***bold italics***'),
    '<span class="bold italic">bold italics</span>'
  );

  assert.strictEqual(
    inlineTagsToHtml('_underline_'),
    '<span class="underline">underline</span>'
  );

  assert.strictEqual(
    inlineTagsToHtml('From what seems like only INCHES AWAY. _Steel\'s face FILLS the *Leupold Mark 4* scope_.'),
    'From what seems like only INCHES AWAY. <span class="underline">Steel\'s face FILLS the <span class="italic">Leupold Mark 4</span> scope</span>.'
  );

  // Escaped emphasis tags are not supported yet.
  /*
  assert.strictEqual(
    inlineTagsToHtml('Steel enters the code on the keypad: **\\*9765\\***'),
    ''
  );
  */

  // Space before or after the emphasis tag is not supported yet.
  /*
  assert.strictEqual(
    inlineTagsToHtml('He dialed *69 and then *23, and then hung up.'),
    ''
  );
  */

  // Emphasis is not carried across line breaks.
  const EMPHASIS_ACROSS_LINES = `As he rattles off the long list, Brick and Steel *share a look.

This is going to be BAD.*
`;
  assert.strictEqual(
    inlineTagsToHtml(EMPHASIS_ACROSS_LINES),
    EMPHASIS_ACROSS_LINES.trim()
  );
});

test('renderer basic cases', () => {
  assert.strictEqual(render({}, 'default'), '');
});
