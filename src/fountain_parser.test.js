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
