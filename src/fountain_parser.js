/**
 * @fileoverview Parses a Fountain file into a token list.
 */

const TokenType = {
  // Scene heading types (sorted alphabetically).
  AUTHOR: 'author',
  AUTHORS: 'authors',
  CONTACT: 'contact',
  COPYRIGHT: 'copyright',
  CREDIT: 'credit',
  DATE: 'date',
  DRAFT_DATE: 'draft_date',
  NOTES: 'notes',
  SOURCE: 'source',
  TITLE: 'title',

  // Top-level types (sorted alphabetically).
  ACTION: 'action',
  CENTERED: 'centered',
  CHARACTER: 'character',
  DIALOGUE_BEGIN: 'dialogue_begin',
  DIALOGUE_END: 'dialogue_end',
  DIALOGUE: 'dialogue',
  DUAL_DIALOGUE_BEGIN: 'dual_dialogue_begin',
  DUAL_DIALOGUE_END: 'dual_dialogue_end',
  LINE_BREAK: 'line_break',
  NOTE: 'note',
  PAGE_BREAK: 'page_break',
  PARENTHETICAL: 'parenthetical',
  SCENE_HEADING: 'scene_heading',
  SECTION: 'section',
  SYNOPSIS: 'synopsis',
  TRANSITION: 'transition',
};

const DualPosition = {
  LEFT: 'left',
  RIGHT: 'right',
  UNKNOWN: 'unknown',
};

const RE = {
  // Sorted alphabetically.
  BONEYARD: /\/\*.*?\*\//gms,
  CENTERED: /^(?:> *)(.+)(?: *<)(\n.+)*/g,
  DIALOGUE: /^(@[^^\n]+|[A-Z*_]+[0-9A-Z (._\-')]*)(\^?)?(?:\n(?!\n+))([\s\S]+)/,
  EXTRA_LINE_BREAKS: /^\n+|\n+$/,
  EXTRA_WHITESPACES: /^\t+|^ {3,}/gm,
  LINE_BREAKS: /\r\n|\r/g,
  NOTE: /^(?:\[{2}(?!\[+))(.+)?(?:\]{2})(?!\[+)$/s,
  PAGE_BREAK: /^={3,}$/,
  PARENTHETICAL: /^(\(.+\))$/,
  PARENTHETICAL_SPLITTER: /(\(.+\))(?:\n+)/,
  SCENE_HEADING: /^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+)/i,
  SCENE_NUMBER: /( *#(.+)# *)/,
  SECTION: /^(#+)(?: *)(.*)/,
  SPLITTER: /\n{2,}/g,
  SYNOPSIS: /^(?:=(?!=+) *)(.*)/,
  TITLE_PAGE: /^((?:title|credit|author[s]?|source|notes|draft date|date|contact|copyright):)/gim,
  TRANSITION: /^((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO:)|^(?:> *)(.+)/,
  TWO_SPACES_LINE_BREAK: /^ {2}$/,
};

function preprocess(fountainText) {
  // 1. Removes boneyards (comments).
  // 2. Normalizes line breaks.
  // 3. Clears extra line breaks.
  // 4. Clears extra whitespaces.
  return fountainText.replace(RE.BONEYARD, '')
      .replace(RE.LINE_BREAKS, '\n')
      .replace(RE.EXTRA_LINE_BREAKS, '')
      .replace(RE.EXTRA_WHITESPACES, '');
}

function parse(fountainText) {
  const text = preprocess(fountainText);
  const blocks = text.split(RE.SPLITTER);
  const tokenList = [];

  let dual = false;

  // Scans the blocks in reverse order to handle dual dialogues correctly.
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    let matches = null;

    // Title page.
    if (RE.TITLE_PAGE.test(block)) {
      matches = block.replace(RE.TITLE_PAGE, '\n$1').split(RE.SPLITTER);
      matches.reverse();
      for (const match of matches) {
        const parts = match.replace(RE.EXTRA_LINE_BREAKS, '').split(/:\n*/);
        tokenList.push({
          type: parts[0].trim().toLowerCase().replace(' ', '_'),
          text: parts[1].trim(),
        });
      }
      continue;
    }

    // Scene headings.
    matches = block.match(RE.SCENE_HEADING);
    if (matches) {
      let text = matches[1] || matches[2];
      if (text.indexOf('  ') !== text.length - 2) {
        const fields = text.match(RE.SCENE_NUMBER)
        let sceneNumber = null;
        if (fields) {
          sceneNumber = fields[2];
          text = text.replace(RE.SCENE_NUMBER, '');
        }
        tokenList.push({
          type: TokenType.SCENE_HEADING,
          text: text,
          sceneNumber: sceneNumber,
        });
      }
      continue;
    }

    // Centered texts.
    matches = block.match(RE.CENTERED);
    if (matches) {
      tokenList.push({
        type: TokenType.CENTERED,
        text: matches[0].replace(/>|</g, ''),
      });
      continue;
    }

    // Transitions.
    matches = block.match(RE.TRANSITION);
    if (matches) {
      tokenList.push({
        type: TokenType.TRANSITION,
        text: matches[1] || matches[2],
      });
      continue;
    }

    // Dialogue blocks - characters, parenthetical texts and dialogue.
    matches = block.match(RE.DIALOGUE)
    if (matches) {
      if (matches[1].indexOf('  ') === matches[1].length - 2) {
        // Capitalized string ends with two spaces will be considered as an
        // action.
        continue;
      }

      if (matches[2]) {
        tokenList.push({ type: TokenType.DUAL_DIALOGUE_END });
      }

      tokenList.push({ type: TokenType.DIALOGUE_END });

      const parts = matches[3].split(RE.PARENTHETICAL_SPLITTER).reverse();

      for (const text of parts) {
        if (text.length > 0) {
          tokenList.push({
            type: RE.PARENTHETICAL.test(text) ?
                TokenType.PARENTHETICAL : TokenType.DIALOGUE,
            text: text.trim(),
          });
        }
      }

      if (matches[1].indexOf('@') === 0) {
        matches[1] = matches[1].replace('@', '');
      }
      tokenList.push({
        type: TokenType.CHARACTER,
        text: matches[1].trim(),
      });

      tokenList.push({
        type: TokenType.DIALOGUE_BEGIN,
        dual: matches[2] ? DualPosition.RIGHT :
                dual ? DualPosition.LEFT : DualPosition.UNKNOWN,
      });

      if (dual) {
        tokenList.push({ type: TokenType.DUAL_DIALOGUE_BEGIN });
      }

      dual = matches[2] ? true : false;
      continue;
    }

    // Sections.
    matches = block.match(RE.SECTION);
    if (matches) {
      tokenList.push({
        type: TokenType.SECTION,
        text: matches[2].trim(),
        depth: matches[1].length,
      });
      continue;
    }

    // Synopsis.
    matches = block.match(RE.SYNOPSIS);
    if (matches) {
      tokenList.push({
        type: TokenType.SYNOPSIS,
        text: matches[1].trim(),
      });
      continue;
    }

    // Notes.
    matches = block.trim().match(RE.NOTE)
    if (matches) {
      tokenList.push({
        type: TokenType.NOTE,
        text: matches[1].trim(),
      });
      continue;
    }

    // Page breaks.
    if (RE.PAGE_BREAK.test(block)) {
      tokenList.push({ type: TokenType.PAGE_BREAK });
      continue;
    }

    // Line breaks
    if (RE.TWO_SPACES_LINE_BREAK.test(block)) {
      tokenList.push({ type: TokenType.LINE_BREAK });
      continue;
    }

    // Finally, if no other type matches, treat it as an action.
    //
    // TODO: Support indent in Actions.
    //
    // Why isn't indent supported in actions? ....replace(RE.EXTRA_WHITESPACES,
    // '') removes the indents before tokenizing.
    let text = block.trim();
    if (text.indexOf('!') === 0) {
      // '!' can be used to force an action.
      text = text.substring(1, text.length);
    }
    if (text) {
      tokenList.push({
        type: TokenType.ACTION,
        text: text,
      });
    }
  }

  // Reverses the token list to restore the original order.
  tokenList.reverse();

  // TODO: Add metadata support.

  return {
    tokens: tokenList,
    metadata: {},
  };
}

export {
  parse,
  DualPosition,
  TokenType,
};
