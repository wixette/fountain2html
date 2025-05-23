import assert from 'node:assert'
import test from 'node:test';
import { parse, TokenType, DualPosition } from './fountain_parser.js';

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

@小明
你好！

@小红^
你好！
`

const TEXT_7 = `/* Sections and synopsis. */
# Section 1

## Section 2

### Section 3

= Set up the characters and the story.

= This scene sets up Brick & Steel's new life as retirees. Warm sun, cold beer, and absolutely nothing to do.
`

const TEXT_8 = `/* Notes */

[[It was supposed to be Vietnamese, right?]]

[[It was supposed to be Vietnamese,
  
right?]]
`

const TEXT_9 = `/* Page breaks and line breaks*/

===

=====

Action with two-space line break.
  
End of action.

  
`

const TEXT_10 = `/* Actions */
He opens the card. A simple little number inside of which is hand written:

Scott exasperatedly throws down the card on the table and picks up the phone, hitting speed dial #1…

!END
Three days.
`

test('parser: empties and boneyards', () => {
  let result = parse('');
  assert.strictEqual(result.tokens.length, 0);

  result = parse(TEXT_1);
  assert.strictEqual(result.tokens.length, 2);

  assert.strictEqual(result.tokens[0].type, TokenType.ACTION);
  assert.strictEqual(result.tokens[0].text, 'Action line 1.\n  \nadditional text.');

  assert.strictEqual(result.tokens[1].type, TokenType.ACTION);
  assert.strictEqual(result.tokens[1].text, 'Action line 2.');
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
  assert.strictEqual(result.tokens.length, 39);

  assert.strictEqual(result.tokens[0].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[0].dual, DualPosition.UNKNOWN);

  assert.strictEqual(result.tokens[1].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[1].text, 'SANBORN');

  assert.strictEqual(result.tokens[2].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[2].text, 'You know, loves the Army, blood runs green. Country boy. Seems solid.');

  assert.strictEqual(result.tokens[3].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[4].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[4].dual, DualPosition.UNKNOWN);

  assert.strictEqual(result.tokens[5].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[5].text, 'DAN');

  assert.strictEqual(result.tokens[6].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[6].text, 'Then let\'s retire them.\n_Permanently_.');

  assert.strictEqual(result.tokens[7].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[8].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[8].dual, DualPosition.UNKNOWN);

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
  assert.strictEqual(result.tokens[16].dual, DualPosition.LEFT);

  assert.strictEqual(result.tokens[17].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[17].text, 'BRICK');

  assert.strictEqual(result.tokens[18].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[18].text, 'Screw retirement.');

  assert.strictEqual(result.tokens[19].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[20].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[20].dual, DualPosition.RIGHT);

  assert.strictEqual(result.tokens[21].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[21].text, 'STEEL');

  assert.strictEqual(result.tokens[22].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[22].text, 'Screw retirement.');

  assert.strictEqual(result.tokens[23].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[24].type, TokenType.DUAL_DIALOGUE_END);

  assert.strictEqual(result.tokens[25].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[25].dual, DualPosition.UNKNOWN);

  assert.strictEqual(result.tokens[26].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[26].text, 'non-capitalized character');

  assert.strictEqual(result.tokens[27].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[27].text, 'Screw retirement.');

  assert.strictEqual(result.tokens[28].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[29].type, TokenType.DUAL_DIALOGUE_BEGIN);

  assert.strictEqual(result.tokens[30].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[30].dual, DualPosition.LEFT);

  assert.strictEqual(result.tokens[31].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[31].text, '小明');

  assert.strictEqual(result.tokens[32].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[32].text, '你好！');

  assert.strictEqual(result.tokens[33].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[34].type, TokenType.DIALOGUE_BEGIN);
  assert.strictEqual(result.tokens[34].dual, DualPosition.RIGHT);

  assert.strictEqual(result.tokens[35].type, TokenType.CHARACTER);
  assert.strictEqual(result.tokens[35].text, '小红');

  assert.strictEqual(result.tokens[36].type, TokenType.DIALOGUE);
  assert.strictEqual(result.tokens[36].text, '你好！');

  assert.strictEqual(result.tokens[37].type, TokenType.DIALOGUE_END);

  assert.strictEqual(result.tokens[38].type, TokenType.DUAL_DIALOGUE_END);
});

test('parser: sections and synopsis', () => {
  let result = parse(TEXT_7);
  assert.strictEqual(result.tokens.length, 5);

  assert.strictEqual(result.tokens[0].type, TokenType.SECTION);
  assert.strictEqual(result.tokens[0].text, 'Section 1');
  assert.strictEqual(result.tokens[0].depth, 1);

  assert.strictEqual(result.tokens[1].type, TokenType.SECTION);
  assert.strictEqual(result.tokens[1].text, 'Section 2');
  assert.strictEqual(result.tokens[1].depth, 2);

  assert.strictEqual(result.tokens[2].type, TokenType.SECTION);
  assert.strictEqual(result.tokens[2].text, 'Section 3');
  assert.strictEqual(result.tokens[2].depth, 3);

  assert.strictEqual(result.tokens[3].type, TokenType.SYNOPSIS);
  assert.strictEqual(result.tokens[3].text, 'Set up the characters and the story.');

  assert.strictEqual(result.tokens[4].type, TokenType.SYNOPSIS);
  assert.strictEqual(result.tokens[4].text, 'This scene sets up Brick & Steel\'s new life as retirees. Warm sun, cold beer, and absolutely nothing to do.');
});

test('parser: notes', () => {
  let result = parse(TEXT_8);
  assert.strictEqual(result.tokens.length, 2);

  assert.strictEqual(result.tokens[0].type, TokenType.NOTE);
  assert.strictEqual(result.tokens[0].text, 'It was supposed to be Vietnamese, right?');

  assert.strictEqual(result.tokens[1].type, TokenType.NOTE);
  assert.strictEqual(result.tokens[1].text, 'It was supposed to be Vietnamese,\n  \nright?');
});

test('parser: breaks', () => {
  let result = parse(TEXT_9);
  assert.strictEqual(result.tokens.length, 3);

  assert.strictEqual(result.tokens[0].type, TokenType.PAGE_BREAK);

  assert.strictEqual(result.tokens[1].type, TokenType.PAGE_BREAK);

  assert.strictEqual(result.tokens[2].type, TokenType.ACTION);
  assert.strictEqual(result.tokens[2].text, 'Action with two-space line break.\n  \nEnd of action.');
});

test('parser: actions', () => {
  let result = parse(TEXT_10);
  assert.strictEqual(result.tokens.length, 3);

  assert.strictEqual(result.tokens[0].type, TokenType.ACTION);
  assert.strictEqual(result.tokens[0].text, 'He opens the card. A simple little number inside of which is hand written:');

  assert.strictEqual(result.tokens[1].type, TokenType.ACTION);
  assert.strictEqual(result.tokens[1].text, 'Scott exasperatedly throws down the card on the table and picks up the phone, hitting speed dial #1…');

  assert.strictEqual(result.tokens[2].type, TokenType.ACTION);
  assert.strictEqual(result.tokens[2].text, 'END\nThree days.');
});
