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
