# fountain2html

A simple Node/JavaScript module to convert .fountain screenplays to HTML format,
with non-latin charset support.

See the definition of Fountain format at http://fountain.io/

This project is partially derived from
[Fountain.js](https://github.com/mattdaly/Fountain.js), with the following
additional features:

- Non-latin charset support. E.g. Chinese character name preceded with the "at"
  symbol `@`
- Commandline interface to convert a .fountain file to HTML
- `@media print` support, enabling page-break when printing
- Predefined print-friendly themes, including colorful and high-contrast themes

## Use the Web application

Open `index.html` in your browser. You can drag and drop a .fountain file to
the page, and it will be converted to HTML. You can also select a theme from the
dropdown menu. The converted HTML will be rendered in the page and ready for
printing.

## Use command-line utility

Make sure you have Node.js and all yarn dependencies installed:

```bash
yarn install
```

Then use the following command to convert a Fountain file to HTML:

```bash
node . --theme=default example.fountain > example.html
```
