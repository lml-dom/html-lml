# HTML-LML
Converts HTML to [LML](https://github.com/lml-dom/lml-js) or an AST format

```javascript
// convert HTML to LML
const parseHTML = require('lml').parseHTML;

parseHTML(htmlString).toLML();
```

Full signiture:
```typescript
parseHTML(source: string, parseConfig?: ParseConfig) => IParser
```

See the [lml](https://github.com/lml-dom/lml-js) documentation for details

## CLI
There is a dedicated command line tool for LML: [lml-cli](https://github.com/lml-dom/lml-cli)
Install that and this package globally to allow for HTML parsing on command line:
```bash
npm install --global html-lml
npm install --global lml-cli
lml --to lml source.html
```
