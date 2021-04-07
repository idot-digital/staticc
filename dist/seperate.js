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
const seperate = (staticcString, start_seperator, end_seperator, path, transpiler) => {
    const numberOfLines = exports.occurrences(staticcString, /\n/) + 1;
    const plainHTMLSnippets = [];
    const codeSnippets = [];
    let finished = false;
    while (!finished && exports.occurrences(staticcString, start_seperator) !== 0) {
        const [firstPart, middlePart, lastPart, end] = exports.cutString(staticcString, start_seperator, end_seperator);
        finished = end === 'true';
        plainHTMLSnippets.push(firstPart);
        codeSnippets.push(exports.classifySnippet(middlePart, path, exports.calculateLineNumber(numberOfLines, middlePart, lastPart), transpiler));
        staticcString = lastPart;
    }
    plainHTMLSnippets.push(staticcString);
    return { plainHTMLSnippets, codeSnippets };
};
exports.seperate = seperate;
const occurrences = (string, subString) => {
    return string.split(subString).length - 1;
};
exports.occurrences = occurrences;
const cutString = (input_string, start_seperator, end_seperator) => {
    const openingIndex = input_string.indexOf(start_seperator);
    let currentClosingIndex = input_string.indexOf(end_seperator);
    let currentOpeningIndex = input_string.indexOf(start_seperator, openingIndex + 1);
    while (currentClosingIndex !== -1 && currentOpeningIndex !== -1 && currentOpeningIndex < currentClosingIndex) {
        currentClosingIndex = input_string.indexOf(end_seperator, currentClosingIndex + 1);
        currentOpeningIndex = input_string.indexOf(start_seperator, currentOpeningIndex + 1);
    }
    const closingIndex = currentClosingIndex;
    const end = openingIndex === -1 ? 'true' : 'false';
    const firstPart = input_string.slice(0, openingIndex);
    const middlePart = input_string.slice(openingIndex + start_seperator.length, closingIndex);
    const lastPart = input_string.slice(closingIndex + end_seperator.length);
    return [firstPart, middlePart, lastPart, end];
};
exports.cutString = cutString;
const classifySnippet = (snippet_string, path, lineNumber, transpiler) => {
    if (snippet_string.indexOf('#') != -1) {
        return new JsSnippet_1.default(snippet_string.replace('#', '').trim(), lineNumber, path, transpiler);
    }
    else if (snippet_string.indexOf('!!') != -1) {
        return new JsPrefabSnippet_1.default(snippet_string.replace('!!', '').trim(), lineNumber, path, transpiler);
    }
    else if (snippet_string.indexOf('!') != -1) {
        return new HtmlPrefabSnippet_1.default(snippet_string.replace('!', '').trim(), lineNumber, path, transpiler);
    }
    else if (snippet_string.indexOf('?') != -1) {
        return new FileInlineSnippet_1.default(snippet_string.replace('?', '').trim(), lineNumber, path, transpiler);
    }
    else {
        return new DataSnippet_1.DataSnippet(snippet_string.trim(), lineNumber, path, transpiler);
    }
};
exports.classifySnippet = classifySnippet;
const calculateLineNumber = (totalNumberOfLines, middlePart, lastPart) => {
    const linesInLastPart = exports.occurrences(lastPart, /\n/);
    const linesInMiddlePart = exports.occurrences(middlePart, /\n/);
    return totalNumberOfLines - (linesInLastPart + Math.round(linesInMiddlePart / 2));
};
exports.calculateLineNumber = calculateLineNumber;
