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
  CENTERED: 'centered',
  SCENE_HEADING: 'scene_heading',
  TRANSITION: 'transition',
};

const RE = {
  // Sorted alphabetically.
  BONEYARD: /\/\*.*?\*\//gms,
  CENTERED: /^(?:> *)(.+)(?: *<)(\n.+)*/g,
  EXTRA_LINE_BREAKS: /^\n+|\n+$/,
  EXTRA_WHITESPACES: /^\t+|^ {3,}/gm,
  LINE_BREAKS: /\r\n|\r/g,
  PAGE_BREAK: /^={3,}$/,
  SCENE_HEADING: /^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+)/i,
  SCENE_NUMBER: /( *#(.+)# *)/,
  SPLITTER: /\n{2,}/g,
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

  for (const block of blocks) {
    let matches = null;

    // Title page.
    if (RE.TITLE_PAGE.test(block)) {
      matches = block.replace(RE.TITLE_PAGE, '\n$1').split(RE.SPLITTER);
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

  }

  return {
    tokens: tokenList,
    metadata: {},
  };
}

export {
  parse,
  TokenType,
};
