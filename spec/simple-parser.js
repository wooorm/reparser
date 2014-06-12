'use strict';

var textom, GROUP_CLOSING_PUNCTUATION, EXPRESSION_WORD_MULTIPUNCTUATION,
    EXPRESSION_MULTILINEBREAK, EXPRESSION_WORD_CHARACTER,
    EXPRESSION_SENTENCE_END, EXPRESSION_SENTENCE_SPACE,
    EXPRESSION_WHITE_SPACE;

textom = require('textom');

EXPRESSION_WORD_MULTIPUNCTUATION = /([^0-9a-zA-Z])\1*/g;

EXPRESSION_MULTILINEBREAK = /(\r?\n|\r)+$|^(\r?\n|\r)+|(\r?\n|\r){2,}/g;

EXPRESSION_WORD_CHARACTER = /\w/;

EXPRESSION_SENTENCE_END = /(\.|[\u203D\?\!]+)/g;

EXPRESSION_SENTENCE_SPACE = /^(\s+)?([\s\S]+)$/;

EXPRESSION_WHITE_SPACE = /^\s+$/;

/*eslint-disable no-cond-assign */
function tokenizeSentence(sentence, value) {
    var tokenBreakPoints = [],
        tokens = [],
        iterator = -1,
        length, pointer, match, token, start, end;

    EXPRESSION_WORD_MULTIPUNCTUATION.lastIndex = 0;

    while (match = EXPRESSION_WORD_MULTIPUNCTUATION.exec(value)) {
        pointer = match.index;
        tokenBreakPoints.push(pointer);
        tokenBreakPoints.push(pointer + match[0].length);
    }

    iterator = -1;
    length = tokenBreakPoints.length + 1;
    start = 0;

    while (++iterator < length) {
        end = tokenBreakPoints[iterator];

        if (end === 0 || start === end) {
            continue;
        }

        tokens.push(value.slice(start, end || value.length));

        start = end;
    }

    iterator = -1;

    while (token = tokens[++iterator]) {
        if (EXPRESSION_WHITE_SPACE.test(token)) {
            sentence.append(new sentence.TextOM.WhiteSpaceNode(token));
        } else if (EXPRESSION_WORD_MULTIPUNCTUATION.test(token)) {
            sentence.append(new sentence.TextOM.PunctuationNode(token));
        } else {
            sentence.append(new sentence.TextOM.WordNode(token));
        }
    }

    return sentence;
}

function tokenizeParagraph(paragraph, value) {
    var sentences = [],
        sentenceBreakPoints = [],
        iterator = -1,
        start, sentence, match, length, end;

    EXPRESSION_SENTENCE_END.lastIndex = 0;

    while (match = EXPRESSION_SENTENCE_END.exec(value)) {
        sentenceBreakPoints.push(match.index + match[1].length);
    }

    length = sentenceBreakPoints.length + 1;
    start = 0;

    while (++iterator < length) {
        end = sentenceBreakPoints[iterator];

        sentence = value.slice(start, end || value.length);

        if (EXPRESSION_WORD_CHARACTER.test(sentence)) {
            sentences.push(sentence);
        } else {
            sentences[sentences.length - 1] += sentence;
        }

        start = end;
    }

    iterator = -1;

    while (sentence = sentences[++iterator]) {
        EXPRESSION_SENTENCE_SPACE.lastIndex = 0;
        sentence = EXPRESSION_SENTENCE_SPACE.exec(sentence);

        if (sentence[1]) {
            paragraph.append(
                new paragraph.TextOM.WhiteSpaceNode(sentence[1])
            );
        }

        tokenizeSentence(paragraph.append(
            new paragraph.TextOM.SentenceNode()), sentence[2]
        );
    }

    return paragraph;
}

function tokenizeRoot(root, value) {
    var iterator = -1,
        start = 0,
        breakpoints = [],
        match, breakpoint,
        paragraph, whiteSpace;

    EXPRESSION_MULTILINEBREAK.lastIndex = 0;

    while (match = EXPRESSION_MULTILINEBREAK.exec(value)) {
        breakpoints.push([match.index, match.index + match[0].length]);
    }

    breakpoints.push([value.length, value.length]);

    while (breakpoint = breakpoints[++iterator]) {
        if (paragraph = value.slice(start, breakpoint[0])) {
            tokenizeParagraph(
                root.append(new root.TextOM.ParagraphNode()), paragraph
            );
        }

        if (whiteSpace = value.slice(breakpoint[0], breakpoint[1])) {
            root.append(new root.TextOM.WhiteSpaceNode(whiteSpace));
        }

        start = breakpoint[1];
    }

    return root;
}

/*eslint-enable no-cond-assign */

function parseConstructor() {
    var TextOM = textom(),
        types = TextOM.types = [],
        key, Constructor, prototype;

    for (key in TextOM) {
        /* istanbul ignore else */
        if (TextOM.hasOwnProperty(key)) {
            Constructor = TextOM[key];
            prototype = Constructor && Constructor.prototype;

            if (prototype && 'type' in prototype) {
                types[prototype.type] = key;
            }
        }
    }

    function parser(source) {
        if (source === null || source === undefined) {
            source = '';
        }

        return tokenizeRoot(new TextOM.RootNode(), source);
    }

    parser.TextOM = TextOM;

    TextOM.Node.prototype.parser = parser;

    return parser;
}

module.exports = parseConstructor;
