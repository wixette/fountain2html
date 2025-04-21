import assert from 'node:assert'
import test from 'node:test';
import { parse, TokenType } from './fountain_parser.js';

const TEXT_1 = `/*
Line break and boneyard test
*/

/* Two-space line break */

Action line 1.
  /* Extra spaces */
additional text.


Action line 2.
`

const TEXT_2 = `/* Title page example from fountain.io */
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
`

const TEXT_3 = `/* Scene heading examples fountain.io */

EXT. OLYMPIA CIRCUS - NIGHT

ext. brick's pool - day

INT. HOUSE - DAY #1#

INT. HOUSE - DAY #1A#

INT. HOUSE - DAY #1a#

INT. HOUSE - DAY #A1#

INT. HOUSE - DAY #I-1-A#

INT. HOUSE - DAY #1.#

INT. HOUSE - DAY - FLASHBACK (1944) #110A#

.SNIPER SCOPE POV
`

const TEXT_4 = `/* Centered examples. */
>THE END<

> THE END <

>THE END  <

>  THE END<

    >THE END<
`

const TEXT_5 = `/* Transitions. */

CUT TO:

>Burn to White.

FADE IN TO:

    FADE OUT TO:

`

const TEXT_6 = `/* Dialogues and dual dialogues. */

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

test('parser: empties and boneyards', () => {
  let result = parse('');
  assert.strictEqual(result.tokens.length, 0);

  result = parse(TEXT_1);
  assert.strictEqual(result.tokens.length, 0);
});

test('parser: title page', () => {
  let result = parse(TEXT_2);
  assert.strictEqual(result.tokens.length, 6);
  assert.strictEqual(result.tokens[0].type, TokenType.TITLE);
  assert.strictEqual(result.tokens[0].text, '_**BRICK & STEEL**_\n_**FULL RETIRED**_');
  assert.strictEqual(result.tokens[1].type, TokenType.CREDIT);
  assert.strictEqual(result.tokens[1].text, 'Written by');
  assert.strictEqual(result.tokens[2].type, TokenType.AUTHOR);
  assert.strictEqual(result.tokens[2].text, 'Stu Maschwitz');
  assert.strictEqual(result.tokens[3].type, TokenType.SOURCE);
  assert.strictEqual(result.tokens[3].text, 'Story by KTM');
  assert.strictEqual(result.tokens[4].type, TokenType.DRAFT_DATE);
  assert.strictEqual(result.tokens[4].text, '1/20/2012');
  assert.strictEqual(result.tokens[5].type, TokenType.CONTACT);
  assert.strictEqual(result.tokens[5].text, 'Next Level Productions\n1588 Mission Dr.\nSolvang, CA 93463');
});

test('parser: scene heading', () => {
  let result = parse(TEXT_3);
  assert.strictEqual(result.tokens.length, 10);
  assert.strictEqual(result.tokens[0].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[0].text, 'EXT. OLYMPIA CIRCUS - NIGHT');
  assert.strictEqual(result.tokens[0].sceneNumber, null);
  assert.strictEqual(result.tokens[1].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[1].text, 'ext. brick\'s pool - day');
  assert.strictEqual(result.tokens[1].sceneNumber, null);
  assert.strictEqual(result.tokens[2].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[2].text, 'INT. HOUSE - DAY');
  assert.strictEqual(result.tokens[2].sceneNumber, '1');
  assert.strictEqual(result.tokens[3].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[3].text, 'INT. HOUSE - DAY');
  assert.strictEqual(result.tokens[3].sceneNumber, '1A');
  assert.strictEqual(result.tokens[4].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[4].text, 'INT. HOUSE - DAY');
  assert.strictEqual(result.tokens[4].sceneNumber, '1a');
  assert.strictEqual(result.tokens[5].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[5].text, 'INT. HOUSE - DAY');
  assert.strictEqual(result.tokens[5].sceneNumber, 'A1');
  assert.strictEqual(result.tokens[6].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[6].text, 'INT. HOUSE - DAY');
  assert.strictEqual(result.tokens[6].sceneNumber, 'I-1-A');
  assert.strictEqual(result.tokens[7].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[7].text, 'INT. HOUSE - DAY');
  assert.strictEqual(result.tokens[7].sceneNumber, '1.');
  assert.strictEqual(result.tokens[8].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[8].text, 'INT. HOUSE - DAY - FLASHBACK (1944)');
  assert.strictEqual(result.tokens[8].sceneNumber, '110A');
  assert.strictEqual(result.tokens[9].type, TokenType.SCENE_HEADING);
  assert.strictEqual(result.tokens[9].text, 'SNIPER SCOPE POV');
  assert.strictEqual(result.tokens[9].sceneNumber, null);
});

test('parser: centered', () => {
  let result = parse(TEXT_4);
  assert.strictEqual(result.tokens.length, 5);

  assert.strictEqual(result.tokens[0].type, TokenType.CENTERED);
  assert.strictEqual(result.tokens[0].text, 'THE END');

  assert.strictEqual(result.tokens[1].type, TokenType.CENTERED);
  assert.strictEqual(result.tokens[1].text, ' THE END ');

  assert.strictEqual(result.tokens[2].type, TokenType.CENTERED);
  assert.strictEqual(result.tokens[2].text, 'THE END  ');

  assert.strictEqual(result.tokens[3].type, TokenType.CENTERED);
  assert.strictEqual(result.tokens[3].text, '  THE END');

  assert.strictEqual(result.tokens[4].type, TokenType.CENTERED);
  assert.strictEqual(result.tokens[4].text, 'THE END');
});

test('parser: transition', () => {
  let result = parse(TEXT_5);
  assert.strictEqual(result.tokens.length, 4);

  assert.strictEqual(result.tokens[0].type, TokenType.TRANSITION);
  assert.strictEqual(result.tokens[0].text, 'CUT TO:');

  assert.strictEqual(result.tokens[1].type, TokenType.TRANSITION);
  assert.strictEqual(result.tokens[1].text, 'Burn to White.');

  assert.strictEqual(result.tokens[2].type, TokenType.TRANSITION);
  assert.strictEqual(result.tokens[2].text, 'FADE IN TO:');

  assert.strictEqual(result.tokens[3].type, TokenType.TRANSITION);
  assert.strictEqual(result.tokens[3].text, 'FADE OUT TO:');
});

test('parser: dialogues', () => {
  let result = parse(TEXT_6);
  assert.strictEqual(result.tokens.length, 29);

  assert.strictEqual(result.tokens[0].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[0].dual, undefined);

  assert.strictEqual(result.tokens[1].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[1].text, 'SANBORN');

  assert.strictEqual(result.tokens[2].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[2].text, 'You know, loves the Army, blood runs green. Country boy. Seems solid.');

  assert.strictEqual(result.tokens[3].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[4].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[4].dual, undefined);

  assert.strictEqual(result.tokens[5].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[5].text, 'DAN');

  assert.strictEqual(result.tokens[6].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[6].text, 'Then let\'s retire them.\n_Permanently_.');

  assert.strictEqual(result.tokens[7].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[8].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[8].dual, undefined);

  assert.strictEqual(result.tokens[9].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[9].text, 'STEEL');

  assert.strictEqual(result.tokens[10].type, TokenType.PARENTHETICAL);
  assert.strictEqual(result.tokens[10].text, '(starting the engine)');

  assert.strictEqual(result.tokens[11].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[11].text, 'So much for retirement!\nSo much for retirement!');

  assert.strictEqual(result.tokens[12].type, TokenType.PARENTHETICAL);
  assert.strictEqual(result.tokens[12].text, '(continue)');

  assert.strictEqual(result.tokens[13].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[13].text, 'Damn it.');

  assert.strictEqual(result.tokens[14].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[15].type, TokenType.DUAL_DIALOGUE_BEGIN);

  assert.strictEqual(result.tokens[16].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[16].dual, 'left');

  assert.strictEqual(result.tokens[17].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[17].text, 'BRICK');

  assert.strictEqual(result.tokens[18].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[18].text, 'Screw retirement.');

  assert.strictEqual(result.tokens[19].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[20].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[20].dual, 'right');

  assert.strictEqual(result.tokens[21].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[21].text, 'STEEL');

  assert.strictEqual(result.tokens[22].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[22].text, 'Screw retirement.');

  assert.strictEqual(result.tokens[23].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[24].type, TokenType.DUAL_DIALOGUE_END);

  assert.strictEqual(result.tokens[25].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[25].dual, undefined);

  assert.strictEqual(result.tokens[26].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[26].text, 'non-capitalized character');

  assert.strictEqual(result.tokens[27].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[27].text, 'Screw retirement.');

  assert.strictEqual(result.tokens[28].type, TokenType.DIALOGUE_END);
});
