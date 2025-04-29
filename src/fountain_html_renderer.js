/**
 * @fileoverview Renders a parsed Fountain token list into HTML.
 */

import { TokenType, DualPosition } from './fountain_parser.js';

const THEMES = [
  'default',

  'cjk',
  'colorful',
  'dark',
  'ocean',
];

const DEFAULT_THEME = 'default';

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

const HTML_TEMPLATE = (title, body, theme) => `<!DOCTYPE html>
<html>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="themes/${theme}/styles.css">
<script src=""></script>
<body>
<main>
${body}
</main>
</body>
</html>
`

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

function render(fountainObject, theme) {
  if (!fountainObject || !fountainObject.tokens) {
    return '';
  }
  if (!theme || !THEMES.includes(theme)) {
    theme = DEFAULT_THEME;
  }

  let title = '';
  const titlePageBuf = [];
  const bodyBuf = [];

  for (const token of fountainObject.tokens) {
    token.text = inlineTagsToHtml(token.text);
    switch (token.type) {
      // Title pages.
      case TokenType.TITLE:
        titlePageBuf.push(`<h1 class="title-page-title">${token.text}</h1>`);
        title = token.text.replace('<br />', ' ').replace(/<(?:.|\n)*?>/g, '');
        break;
      case TokenType.CREDIT:
        titlePageBuf.push(`<p class="title-page-credit">${token.text}</p>`);
        break;
      case TokenType.AUTHOR:
        titlePageBuf.push(`<p class="title-page-authors">${token.text}</p>`);
        break;
      case TokenType.AUTHORS:
        titlePageBuf.push(`<p class="title-page-authors">${token.text}</p>`);
        break;
      case TokenType.SOURCE:
        titlePageBuf.push(`<p class="title-page-source">${token.text}</p>`);
        break;
      case TokenType.NOTES:
        titlePageBuf.push(`<p class="title-page-notes">${token.text}</p>`);
        break;
      case TokenType.DRAFT_DATE:
        titlePageBuf.push(`<p class="title-page-draft-date">${token.text}</p>`);
        break;
      case TokenType.DATE:
        titlePageBuf.push(`<p class="title-page-date">${token.text}</p>`);
        break;
      case TokenType.CONTACT:
        titlePageBuf.push(`<p class="title-page-contact">${token.text}</p>`);
        break;
      case TokenType.COPYRIGHT:
        titlePageBuf.push(`<p class="title-page-copyright">${token.text}</p>`);
        break;

      // Dialogues.
      case TokenType.SCENE_HEADING:
        bodyBuf.push(`<h2 class="screen-heading"${token.sceneNumber ? ` id="${token.sceneNumber}"` : ''}>${token.text}</h2>`);
        break;
      case TokenType.TRANSITION:
        bodyBuf.push(`<h2 class="transition">${token.text}</h2>`);
        break;
      case TokenType.DUAL_DIALOGUE_BEGIN:
        bodyBuf.push('<div class="dual-dialogue-block">');
        break;
      case TokenType.DIALOGUE_BEGIN:
        bodyBuf.push(`<div class="dialogue-block${token.dual === DualPosition.UNKNOWN ? '' : ` dual-${token.dual}`}">`);
        break;
      case TokenType.CHARACTER:
        bodyBuf.push(`<h3 class="character">${token.text}</h3>`);
        break;
      case TokenType.PARENTHETICAL:
        bodyBuf.push(`<p class="parenthetical">${token.text}</p>`);
        break;
      case TokenType.DIALOGUE:
        bodyBuf.push(`<p class="dialogue">${token.text}</p>`);
        break;
      case TokenType.DIALOGUE_END:
        bodyBuf.push('</div>');
        break;
      case TokenType.DUAL_DIALOGUE_END:
        bodyBuf.push('</div>');
        break;

      // Others.
      case TokenType.SECTION:
        bodyBuf.push(`<p class="section section-${token.depth}" depth="${token.depth}">${token.text}</p>`);
        break;
      case TokenType.SYNOPSIS:
        bodyBuf.push(`<p class="synopsis">${token.text}</p>`);
        break;
      case TokenType.NOTE:
        bodyBuf.push(`<!-- ${token.text} -->`);
        break;
      case TokenType.ACTION:
        bodyBuf.push(`<p class="action">${token.text}</p>`);
        break;
      case TokenType.CENTERED:
        bodyBuf.push(`<p class="centered">${token.text}</p>`);
        break;
      case TokenType.PAGE_BREAK:
        bodyBuf.push('<hr />');
        break;
      case TokenType.LINE_BREAK:
        bodyBuf.push('<br />');
        break;
    }
  }

  const titlePage = `<div class="title-page">\n${titlePageBuf.join('\n')}\n</div>`;
  const body = `${titlePage}\n${bodyBuf.join('\n')}`;
  return HTML_TEMPLATE(title, body, theme);
}

export {
  inlineTagsToHtml,
  render,
};
