/**
 * @fileoverview Node.js command-line tool to convert Fountain files to HTML.
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { parse } from './src/fountain_parser.js';
import { render } from './src/fountain_html_renderer.js';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options] <fountain-file>')
  .option('t', {
    alias: 'theme',
    type: 'string',
    description: 'Specify the theme name',
  })
  .demandCommand(1, 'You must provide a fountain file to process.')
  .help()
  .argv;

const fountainFile = argv._[0];
const theme = argv.theme || 'default';

// Reads the fountain file.
import fs from 'fs';
import path from 'path';
const filePath = path.resolve(process.cwd(), fountainFile);
const fileContent = fs.readFileSync(filePath, 'utf8');

// Parses the fountain file.
const fountainObject = parse(fileContent);

// Renders the fountain object to HTML.
const html = render(fountainObject, theme);

console.log(html);
