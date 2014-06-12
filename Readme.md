# reparser [![Build Status](https://travis-ci.org/wooorm/reparser.svg?branch=master)](https://travis-ci.org/wooorm/reparser) [![Coverage Status](https://img.shields.io/coveralls/wooorm/reparser.svg)](https://coveralls.io/r/wooorm/reparser?branch=master)

[![browser support](https://ci.testling.com/wooorm/reparser.png) ](https://ci.testling.com/wooorm/reparser)

See [Browser Support](#browser-support) for more information (a.k.a. don’t worry about those grey icons above).

---

**reparser** is a library which “glues” a parser and [TextOM](https://github.com/wooorm/textom/ "TextOM") together, which (for now) means:

- `toAST`, `toJSON`, and `fromAST` functions to encode and decode between a TextOM tree and (stringified?) JSON;
- `appendContent`, `prependContent`, `removeContent`, and `replaceContent` functions to insert/remove natural language  into/from a TextOM tree.

Note: This project, or a similar API, should be included by [retext](https://github.com/wooorm/retext "Retext") parser developers.

## Installation

NPM:
```sh
$ npm install reparser
```

Component.js:
```sh
$ component install wooorm/reparser
```

## Usage

```js
var parse = require('parse-english')(), // or another parser using “reparser”
    fs = require('fs'),
    rootNode;

// Simple sentence:
rootNode = parse('A paragraph.');

// Append some content:
rootNode.appendContent('\n\nAnother paragraph');

// Store the tree somewhere (pretty printing each level with 4 spaces):
fs.writeFileSync('ast.json', rootNode.toAST(4));

// Get a TextOM object model without the need for parsing each time:
parse.fromAST(fs.readFileSync('ast.json', 'utf8')); // An object model
```

## API

### reparser(parse)

```js
var reparser = require('reparser');

module.exports = function () {
    function parse(source) {
        // ...modify natural language into a TextOM tree...
        return tree;
    }
    
    reparser(parse);
    
    return parse;
}
```

- `parse` (`function`): The parse function to extend (see below for the extensions).

### Extensions to the given parse function

### parse.fromAST(ast)

```js
var parse = require('a-reparser-using-parser')();

var rootNode = parse.fromAST({"type":"RootNode", "children":[
  {"type":"ParagraphNode", "children": [
    {"type":"SentenceNode", "children": [
      { "type": "WordNode", "value": "A" },
      { "type": "WhiteSpaceNode", "value": " " },
      { "type": "WordNode", "value": "simple" },
      { "type": "WhiteSpaceNode", "value": " " },
      { "type": "WordNode", "value": "sentence" },
      { "type": "PunctuationNode", "value": "." }
    ]}
  ]}
]});
/*
 * ˅ RootNode
 *    ˃ 0: ParagraphNode[1]
 *      length: 1
 *    ˃ head: ParagraphNode[1]
 *    ˃ data: {}
 *    ˃ __proto__: RootNode
 */
```

Parse a JSON object or string—a (parsed?) result of [`Node#toAST()`](#textomnodetoastdelimiter))—into an object model.

- `ast` (`String` or `Object`): The object to parse into a TextOM tree.

### Extensions to TextOM

#### TextOM.Node#toJSON()

```js
var parse = require('a-reparser-using-parser')(),
    rootNode = parse('A simple sentence.');

rootNode.toJSON();
/*
 * ˅ Object
 *    ˃ children: Array[1]
 *      type: "RootNode"
 *    ˃ __proto__: Object
 */
```

Returns a JSON (**not** stringified) representation of a Node, can later be passed to [`parse.fromAST()`](#parsefromastast).
The name of this method might seem a bit confusing, as it doesn't return a JSON string: See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON_behavior) for an explanation.

#### TextOM.Node#toAST(delimiter?)

```js
var parse = require('a-reparser-using-parser')(),
    rootNode = parse('A simple sentence.');

rootNode.toAST(); // '{"type":"RootNode","children":[{"type":"ParagraphNode","children":[{"type":"SentenceNode","children":[{"type":"WordNode","value":"A"},{"type":"WhiteSpaceNode","value":" "},{"type":"WordNode","value":"simple"},{"type":"WhiteSpaceNode","value":" "},{"type":"WordNode","value":"sentence"},{"type":"PunctuationNode","value":"."}]}]}]}'
```

Returns a stringified JSON—optionally pretty printed—representation of a Node, can later be passed to [`parse.fromAST()`](#parsefromastast).

- `delimiter` (`null`, `Number`, or `String`): Causes the AST to be pretty printed. Passed to `JSON.stringify` (See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#space_argument) for docs).

#### TextOM.Parent#prependContent(value)

```js
var parse = require('a-reparser-using-parser')(),
    rootNode = parse('simple sentence.');

// Prepend into the first sentence of the first paragraph:
rootNode.head.head.prependContent('A document including a ')
rootNode.toString(); // 'A document including a simple sentence.'
```

Inserts the parsed value at the beginning of the parent.

- `value` (Non-empty `String`): The to-parse and prepend inside content.

#### TextOM.Parent#appendContent(value)

```js
var parse = require('a-reparser-using-parser')(),
    rootNode = parse('A document');

// Append into the first sentence of the first paragraph:
rootNode.head.head.appendContent(' including a simple sentence');
rootNode.toString(); // 'A document including a simple sentence.'
```

Inserts the parsed value at the end of the parent.

- `value` (Non-empty `String`): The to-parse and append inside content.

#### TextOM.Parent#removeContent()

```js
var parse = require('a-reparser-using-parser')(),
    rootNode = parse('A sentence. Another sentence.');

// Remove the content of the first sentence of the first paragraph:
rootNode.head.head.removeContent();
rootNode.toString(); // ' Another sentence.'
```

Removes the current content of the parent.

#### TextOM.Parent#replaceContent(value?)

```js
var parse = require('a-reparser-using-parser')(),
    rootNode = parse('A sentence');

// Replace the content of the first paragraph:
rootNode.head.replaceContent('One sentence. Two sentences.');
rootNode.toString(); // 'One sentence. Two sentences.'
```

Removes the current content of the parent, and replaces it with the parsed value.

- `value` (`String`): The to-parse and insert inside content.

## Browser Support
Pretty much every browser (available through browserstack) runs all reparser unit tests; just make sure `JSON` is [polyfill](https://github.com/douglascrockford/JSON-js)’d in browsers that need it.

## Related

  * [retext](https://github.com/wooorm/retext "Retext")
  * [textom](https://github.com/wooorm/textom "TextOM")

## License

  MIT
