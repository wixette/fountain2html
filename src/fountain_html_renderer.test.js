import assert from 'node:assert'
import test from 'node:test';
import { parse, TokenType } from './fountain_parser.js';
import { render, inlineTagsToHtml } from './fountain_html_renderer.js';

const TEXT_1 = `/* Test fountain text */
Title:
    _**BRICK & STEEL**_
    _**FULL RETIRED**_
Credit: Written by
Author: Stu Maschwitz
Source: Story by KTM
Draft date: 1/20/2012
Contact:
    Next Level Productions
    1588 Mission Dr.
    Solvang, CA 93463

SANBORN
You know, loves the Army, blood runs green. Country boy. Seems solid.

DAN
Then let's retire them.
_Permanently_.

STEEL
(starting the engine)
So much for retirement!
So much for retirement!
(continue)
Damn it.

BRICK
Screw retirement.

STEEL ^
Screw retirement.

@non-capitalized character
Screw retirement.
`

const HTML_1 = `<div class="title-page">
<h1 class="title-page-title"><span class="bold underline">BRICK & STEEL</span><br /><span class="bold underline">FULL RETIRED</span></h1>
<p class="title-page-credit">Written by</p>
<p class="title-page-authors">Stu Maschwitz</p>
<p class="title-page-source">Story by KTM</p>
<p class="title-page-draft-date">1/20/2012</p>
<p class="title-page-contact">Next Level Productions<br />1588 Mission Dr.<br />Solvang, CA 93463</p>
</div>
<div class="dialogue-block">
<h3 class="character">SANBORN</h3>
<p class="dialogue">You know, loves the Army, blood runs green. Country boy. Seems solid.</p>
</div>
<div class="dialogue-block">
<h3 class="character">DAN</h3>
<p class="dialogue">Then let's retire them.<br /><span class="underline">Permanently</span>.</p>
</div>
<div class="dialogue-block">
<h3 class="character">STEEL</h3>
<p class="parenthetical">(starting the engine)</p>
<p class="dialogue">So much for retirement!<br />So much for retirement!</p>
<p class="parenthetical">(continue)</p>
<p class="dialogue">Damn it.</p>
</div>
<div class="dual-dialogue-block">
<div class="dialogue-block dual-left">
<h3 class="character">BRICK</h3>
<p class="dialogue">Screw retirement.</p>
</div>
<div class="dialogue-block dual-right">
<h3 class="character">STEEL</h3>
<p class="dialogue">Screw retirement.</p>
</div>
</div>
<div class="dialogue-block">
<h3 class="character">non-capitalized character</h3>
<p class="dialogue">Screw retirement.</p>
</div>
`;

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
    inlineTagsToHtml('_***text***_'),
    '<span class="bold italic underline">text</span>'
  );

  assert.strictEqual(
    inlineTagsToHtml('_*text*_'),
    '<span class="italic underline">text</span>'
  );

  assert.strictEqual(
    inlineTagsToHtml('*_text_*'),
    '<span class="italic underline">text</span>'
  );

  assert.strictEqual(
    inlineTagsToHtml('**_text_**'),
    '<span class="bold underline">text</span>'
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
    'As he rattles off the long list, Brick and Steel <span class="italic">share a look.<br /><br />This is going to be BAD.</span><br />'
  );

  const INLINE_NOTES = `His hand is an inch from the receiver when the phone RINGS.
Scott pauses for a moment, suspicious for some reason.[[This section needs work.
Either that, or I need coffee.
{two spaces}
Definitely coffee.]] He looks around. Phone ringing.`
  assert.strictEqual(
    inlineTagsToHtml(INLINE_NOTES),
    'His hand is an inch from the receiver when the phone RINGS.<br />Scott pauses for a moment, suspicious for some reason.<!-- This section needs work.<br />Either that, or I need coffee.<br />{two spaces}<br />Definitely coffee. --> He looks around. Phone ringing.'
  );

});

test('renderer basic cases', () => {
  assert.strictEqual(render({}, 'default'), '');

  let html = render({tokens: []}, 'default');
  assert(html.startsWith('<!DOCTYPE html>'));

  html = render({tokens: [
    {
      type: TokenType.ACTION,
      text: 'This is an action.',
    },
  ]}, 'default');
  assert(html.includes('class="action"'));
  assert(html.includes('This is an action.'));
});

test('renderer dialogue', () => {
  let fountainObject = parse(TEXT_1);
  let html = render(fountainObject, 'default');
  console.log(html);
  assert(html.includes(HTML_1));
});
