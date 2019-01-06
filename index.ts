import { ParseConfig } from 'lml/lib/src/parser-config';
import { ParserInterface } from 'lml/lib/src/parser-interface';

import { HTMLParser } from './html-parser';

/**
 * Process an HTML file from source
 * @argument src source to process
 * @argument config optional processing options
 */
export function parseHTML(src: string, config?: ParseConfig): ParserInterface {
  return new HTMLParser(src, config);
}
