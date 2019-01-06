import { Parser as HtmlParser2 } from 'htmlparser2';
import { DOMNode } from 'lml/lib/src/dom-node';
import { DOMNodeAttribute } from 'lml/lib/src/dom-node-attribute';
import { ParseLocation } from 'lml/lib/src/parser/parse-location';
import { ParseSourceSpan } from 'lml/lib/src/parser/parse-source-span';
import { StringParser } from 'lml/lib/src/parser/string-parser';

/**
 * Parses HTML string to DOMNode[]. Depends on the cool `htmlparser2` package
 */
export class HTMLParser extends StringParser {
  /**
   * Open CData ref
   */
  private _cdata: DOMNode;

  /**
   * HtmlParser2 instance
   */
  private _parser: HtmlParser2;

  protected parse(): void {
    this._levels = [];
    this._parser = new HtmlParser2({
      oncdataend: () => { this._cdata = null; },
      oncdatastart: () => { this.onCData(); },
      onclosetag: () => { this.onCloseTag(); },
      oncomment: (data) => { this.onComment(data); },
      onopentag: (name) => { this.onTag(name); },
      onprocessinginstruction: (name, data) => { this.onDirective(name, data); },
      ontext: (text) => { this.onText(text); }
    }, {recognizeCDATA: true, recognizeSelfClosing: true});
    this._parser.parseComplete(this.source.content);
    this._parser = null;

    this.postProcess();
  }

  /**
   * Source span currently used
   */
  private get currentSpan(): ParseSourceSpan {
    return new ParseSourceSpan(this.source, this._parser['startIndex'], this._parser['endIndex'] + 1);
  }

  private onCData(): void {
    this._cdata = this.add('cdata', this._parser['_stack'].length, this.currentSpan);
  }

  private onCloseTag(): void {
    const span = this.currentSpan;
    const node = this._levels[this._parser['_stack'].length];
    if (node && node.sourceSpan && node.sourceSpan.start.offset !== span.start.offset) {
      node.closeTagSpan = span;
    }
  }

  private onComment(text: string): void {
    this.add('comment', this._parser['_stack'].length, this.currentSpan, text.split('\n').map((l) => l.trim()).join('\n').trim());
  }

  private onDirective(_name: string, data: string): void {
    const span = this.currentSpan;
    span.end = new ParseLocation(this.source, span.start.offset + data.length + 1 + 1);
    this.add('directive', this._parser['_stack'].length, span, data.trim());
  }

  private onTag(_name: string): void {
    const span = this.currentSpan;
    const attributes: DOMNodeAttribute[] = [];
    this.parseTag(new ParseSourceSpan(span.start.off(1), span.end.off(-1)), attributes);
    const namePart = attributes.shift();
    if (namePart) {
      const node = this.add('element', this._parser['_stack'].length - (DOMNode.voidTags.includes(namePart.name) ? 0 : 1), span);
      node.name = namePart.name;
      node.attributes.push(...attributes);
    }
  }

  private onText(text: string): void {
    const level = this._parser['_stack'].length + (this._cdata ? 1 : 0);
    const span = this._cdata ? this.currentSpan.off('<![CDATA['.length, text.length) : this.currentSpan;
    this.add('text', level, span, text);
  }
}
