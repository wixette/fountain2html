const TokenType = {
  TITLE: 'title',
  CREDIT: 'credit',
  AUTHOR: 'author',
  AUTHORS: 'authors',
  SOURCE: 'source',
  NOTES: 'notes',
  DRAFT_DATE: 'draft_date',
  DATE: 'date',
  CONTACT: 'contact',
  COPYRIGHT: 'copyright',
};

const REGEX = {
  BONEYARD: /\/\*.*?\*\//gms,
  EXTRA_LINE_BREAKS: /^\n+|\n+$/,
  EXTRA_WHITESPACES: /^\t+|^ {3,}/gm,
  LINE_BREAKS: /\r\n|\r/g,
  PAGE_BREAK: /^={3,}$/,
  SPLITTER: /\n{2,}/g,
  TITLE_PAGE: /^((?:title|credit|author[s]?|source|notes|draft date|date|contact|copyright):)/gim,
  TWO_SPACES_LINE_BREAK: /^ {2}$/,
};

function preprocess(fountainText) {
  // 1. Removes boneyards (comments).
  // 2. Normalizes line breaks.
  // 3. Clears extra line breaks.
  // 4. Clears extra whitespaces.
  return fountainText.replace(REGEX.BONEYARD, '')
      .replace(REGEX.LINE_BREAKS, '\n')
      .replace(REGEX.EXTRA_LINE_BREAKS, '')
      .replace(REGEX.EXTRA_WHITESPACES, '');
}

function parse(fountainText) {
  const text = preprocess(fountainText);
  const blocks = text.split(REGEX.SPLITTER);
  const tokenList = [];

  for (const block of blocks) {
    if (REGEX.TITLE_PAGE.test(block)) {
      const matches = block.replace(REGEX.TITLE_PAGE, '\n$1')
          .split(REGEX.SPLITTER);
      for (const match of matches) {
        const parts = match.replace(REGEX.EXTRA_LINE_BREAKS, '').split(/:\n*/);
        const token = {};
        token.type = parts[0].trim().toLowerCase().replace(' ', '_');
        token.text = parts[1].trim();
        tokenList.push(token);
      }
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
