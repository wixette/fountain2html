const INLINE_RE = {
  BOLD_ITALIC_UNDERLINE: /(_{1}\*{3}(?=.+\*{3}_{1})|\*{3}_{1}(?=.+_{1}\*{3}))(.+?)(\*{3}_{1}|_{1}\*{3})/g,
  BOLD_ITALIC: /(\*{3}(?=.+\*{3}))(.+?)(\*{3})/g,
  BOLD_UNDERLINE: /(_{1}\*{2}(?=.+\*{2}_{1})|\*{2}_{1}(?=.+_{1}\*{2}))(.+?)(\*{2}_{1}|_{1}\*{2})/g,
  BOLD: /(\*{2}(?=.+\*{2}))(.+?)(\*{2})/g,
  ITALIC_UNDERLINE: /(_{1}\*{1}(?=.+\*{1}_{1})|\*{1}_{1}(?=.+_{1}\*{1}))(.+?)(\*{1}_{1}|_{1}\*{1})/g,
  ITALIC: /(\*{1}(?=.+\*{1}))(.+?)(\*{1})/g,
  NOTE_INLINE: /(?:\[{2}(?!\[+))([\s\S]+?)(?:\]{2}(?!\[+))/g,
  UNDERLINE: /(_{1}(?=.+_{1}))(.+?)(_{1})/g,
};

// Inline HTML snippets to replace fountain syntax.
//
// TODO: Add support for escaped emphasis tags like '\*'.
//
// TODO: Support space before or after the emphasis tag like '*6 *9' or '6* 9*'.
//
const INLINE_HTML = {
  BOLD_ITALIC_UNDERLINE: '<span class="bold italic underline">$2</span>',
  BOLD_ITALIC: '<span class="bold italic">$2</span>',
  BOLD_UNDERLINE: '<span class="bold underline">$2</span>',
  BOLD: '<span class="bold">$2</span>',
  ITALIC_UNDERLINE: '<span class="italic underline">$2</span>',
  ITALIC: '<span class="italic">$2</span>',
  LINE_BREAK: '<br />',
  NOTE_INLINE: '<!-- $1 -->',
  UNDERLINE: '<span class="underline">$2</span>',
};

function inlineTagsToHtml(s) {
  if (!s) {
    return '';
  }
  s = s.replace(INLINE_RE.NOTE_INLINE, INLINE_HTML.NOTE_INLINE)
      .replace(/\\\*/g, '[star]')
      .replace(/\\_/g, '[underline]')
      .replace(/\n/g, INLINE_HTML.LINE_BREAK);
  const styles = Object.getOwnPropertyNames(INLINE_RE);
  for (const style of styles) {
    const regex = INLINE_RE[style];
    const htmlSnippet = INLINE_HTML[style];
    if (regex.test(s)) {
      s = s.replace(regex, htmlSnippet);
    }
  }
  return s.replace(/\[star\]/g, '*').replace(/\[underline\]/g, '_').trim();
}

function render(/* fountainObject, theme */) {
  return ''
}

export {
  inlineTagsToHtml,
  render,
};
