const REGEX = {
  BONEYARD: /\/\*.*?\*\//gms,
  EXTRA_LINE_BREAKS: /^\n+|\n+$/,
  EXTRA_WHITESPACES: /^\t+|^ {3,}/gm,
  LINE_BREAKS: /\r\n|\r/g,
  PAGE_BREAK: /^={3,}$/,
  SPLITTER: /\n{2,}/g,
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
  const lines = text.split(REGEX.SPLITTER);
  const blockObjects = [];
  for (const line of lines) {
    const blockObject = {};
    blockObject.text = line;
    blockObjects.push(blockObject);
  }
  return {
    blocks: blockObjects,
    metadata: {},
  };
}

export {
  parse
};
