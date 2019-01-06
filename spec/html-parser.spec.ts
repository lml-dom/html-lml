// tslint:disable:no-magic-numbers

import { parseHTML } from '../index';

describe('parseHTML', () => {
  describe('Comment node', () => {
    it('is found in line start', () => {
      const ast = parseHTML(`<div></div><!-- hello --><span>x</span>`).toAST();
      expect(ast[1].type).toBe('comment');
      expect(ast[1].data).toBe('hello');
      expect(ast[1].startIndex).toBe(11);
      expect(ast[1].endIndex).toBe(24);
    });

    it('is trimmed', () => {
      const ast = parseHTML(`<div><!--  \t  hello\n  \tworld  --><span>x</span></div>`).toAST();
      expect(ast[0].children[0].type).toBe('comment');
      expect(ast[0].children[0].data).toBe('hello\nworld');
      expect(ast[0].children[0].startIndex).toBe(5);
      expect(ast[0].children[0].endIndex).toBe(32);
    });
  });

  describe('CDATA node', () => {
    it('value is stored on a text node under the CDATA node', () => {
      const ast = parseHTML(`<div></div><![CDATA[ hello ]]><span>x</span>`).toAST();
      expect(ast[1].type).toBe('cdata');
      expect(ast[1].startIndex).toBe(11);
      expect(ast[1].endIndex).toBe(29);
      expect(ast[1].children[0].type).toBe('text');
      expect(ast[1].children[0].data).toBe(' hello ');
      expect(ast[1].children[0].startIndex).toBe(20);
      expect(ast[1].children[0].endIndex).toBe(26);
    });
  });

  describe('Directive', () => {
    it('is found in start only', () => {
      const ast = parseHTML(`<!DOCTYPE html>\n<div></div><!-- hello --><span>x</span>`).toAST();
      expect(ast[0].type).toBe('directive');
      expect(ast[0].data).toBe('!DOCTYPE html');
      expect(ast[0].startIndex).toBe(0);
      expect(ast[0].endIndex).toBe(14);
    });
  });

  describe('Text node', () => {
    it('is found in line start', () => {
      const ast = parseHTML(`<div></div>hello<span>x</span>`).toAST();
      expect(ast[1].type).toBe('text');
      expect(ast[1].data).toBe('hello');
      expect(ast[1].startIndex).toBe(11);
      expect(ast[1].endIndex).toBe(15);
      expect(ast[2].children[0].type).toBe('text');
      expect(ast[2].children[0].data).toBe('x');
      expect(ast[2].children[0].startIndex).toBe(22);
      expect(ast[2].children[0].endIndex).toBe(22);
    });

    it('is parsed as multiline block, trims', () => {
      const ast = parseHTML(`<div>  hello  \n \tworld \t\n  <span>x</span></div>`).toAST();
      expect(ast[0].children[0].type).toBe('text');
      expect(ast[0].children[0].data).toBe('hello\nworld');
      expect(ast[0].children[0].startIndex).toBe(5);
      expect(ast[0].children[0].endIndex).toBe(26);
    });
  });

  describe('Element', () => {
    describe('Attribute', () => {
      it('is recognized', () => {
        const ast = parseHTML(`<div>hello<span hidden class="abc def">x</span></div>`).toAST();
        expect(ast[0].children[1].name).toBe('span');
        expect(Object.keys(ast[0].children[1].attribs).length).toBe(2);
        expect(ast[0].children[1].attribs['hidden']).toBe('');
        expect(ast[0].children[1].attribs['class']).toBe('abc def');
      });
    });

    it('void tag works', () => {
      const ast = parseHTML(`<div>hello<input type="text"></div>`).toAST();
      expect(ast[0].children[1].name).toBe('input');
      expect(ast[0].children[1].startIndex).toBe(10);
      expect(ast[0].children[1].endIndex).toBe(28);
    });
  });
});
