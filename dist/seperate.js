Object.defineProperty(exports, "__esModule", { value: true });
exports._cutString = exports._occurrences = exports.seperate = void 0;
exports.seperate = (staticcString, start_seperator, end_seperator) => {
    const oc = exports._occurrences(staticcString, start_seperator);
    const plainHTMLSnippets = [];
    const codeSnippets = [];
    for (let i = 0; i < oc; i++) {
        const [firstPart, middlePart, lastPart] = exports._cutString(staticcString, start_seperator, end_seperator);
        plainHTMLSnippets.push(firstPart);
        codeSnippets.push(middlePart);
        staticcString = lastPart;
    }
    plainHTMLSnippets.push(staticcString);
    return [plainHTMLSnippets, codeSnippets];
};
exports._occurrences = (string, subString) => {
    return string.split(subString).length - 1;
};
exports._cutString = (input_string, start_seperator, end_seperator) => {
    const openingIndex = input_string.indexOf(start_seperator);
    const cloringIndex = input_string.indexOf(end_seperator);
    const firstPart = input_string.slice(0, openingIndex);
    const middlePart = input_string.slice(openingIndex + 2, cloringIndex);
    const lastPart = input_string.slice(cloringIndex + 2);
    return [firstPart, middlePart, lastPart];
};
