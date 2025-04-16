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
