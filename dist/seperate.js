var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLineNumber = exports.classifySnippet = exports.cutString = exports.occurrences = exports.seperate = void 0;
const DataSnippet_1 = require("./classes/DataSnippet");
const FileInlineSnippet_1 = __importDefault(require("./classes/FileInlineSnippet"));
const HtmlPrefabSnippet_1 = __importDefault(require("./classes/HtmlPrefabSnippet"));
const JsPrefabSnippet_1 = __importDefault(require("./classes/JsPrefabSnippet"));
const JsSnippet_1 = __importDefault(require("./classes/JsSnippet"));
exports.seperate = (staticcString, start_seperator, end_seperator, path) => {
    const numberOfLines = exports.occurrences(staticcString, /\n/) + 1;
    const oc = exports.occurrences(staticcString, start_seperator);
    const plainHTMLSnippets = [];
    const codeSnippets = [];
    for (let i = 0; i < oc; i++) {
        const [firstPart, middlePart, lastPart] = exports.cutString(staticcString, start_seperator, end_seperator);
        plainHTMLSnippets.push(firstPart);
        codeSnippets.push(exports.classifySnippet(middlePart, path, exports.calculateLineNumber(numberOfLines, middlePart, lastPart)));
        staticcString = lastPart;
    }
    plainHTMLSnippets.push(staticcString);
    return { plainHTMLSnippets, codeSnippets };
};
exports.occurrences = (string, subString) => {
    return string.split(subString).length - 1;
};
exports.cutString = (input_string, start_seperator, end_seperator) => {
    const openingIndex = input_string.indexOf(start_seperator);
    const closingIndex = input_string.indexOf(end_seperator);
    const firstPart = input_string.slice(0, openingIndex);
    const middlePart = input_string.slice(openingIndex + start_seperator.length, closingIndex);
    const lastPart = input_string.slice(closingIndex + end_seperator.length);
    return [firstPart, middlePart, lastPart];
};
exports.classifySnippet = (snippet_string, path, lineNumber) => {
    if (snippet_string.indexOf('#') != -1) {
        return new JsSnippet_1.default(snippet_string.replace('#', '').trim(), lineNumber, path);
    }
    else if (snippet_string.indexOf('!!') != -1) {
        return new JsPrefabSnippet_1.default(snippet_string.replace('!!', '').trim(), lineNumber, path);
    }
    else if (snippet_string.indexOf('!') != -1) {
        return new HtmlPrefabSnippet_1.default(snippet_string.replace('!', '').trim(), lineNumber, path);
    }
    else if (snippet_string.indexOf('?') != -1) {
        return new FileInlineSnippet_1.default(snippet_string.replace('?', '').trim(), lineNumber, path);
    }
    else {
        return new DataSnippet_1.DataSnippet(snippet_string.trim(), lineNumber, path);
    }
};
exports.calculateLineNumber = (totalNumberOfLines, middlePart, lastPart) => {
    const linesInLastPart = exports.occurrences(lastPart, /\n/);
    const linesInMiddlePart = exports.occurrences(middlePart, /\n/);
    return totalNumberOfLines - (linesInLastPart + Math.round(linesInMiddlePart / 2));
};
