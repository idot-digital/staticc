Object.defineProperty(exports, "__esModule", { value: true });
exports.formatErrorToHtml = exports.recombine = exports.resolve = exports.transpile = void 0;
const lib_1 = require("./lib");
const preprocess_1 = require("./preprocess");
const seperate_1 = require("./seperate");
exports.transpile = async (staticcString, data, path, start_seperator = '{{', end_seperator = '}}') => {
    staticcString = preprocess_1.preprocess(staticcString);
    //SEPERATOR ENGINE
    const { plainHTMLSnippets, codeSnippets } = seperate_1.seperate(staticcString, start_seperator, end_seperator, path);
    //RESOLVER ENGINE
    const { resolvedSnippets, loadedFiles, errorMsg } = await exports.resolve(codeSnippets, data);
    //RECOMBINATOR ENGINE
    let htmlString = (errorMsg === "") ? exports.recombine(plainHTMLSnippets, resolvedSnippets) : exports.formatErrorToHtml(errorMsg);
    return { htmlString, loadedFiles };
};
exports.resolve = async (snippets, data) => {
    let errorMsg = "";
    await Promise.all(snippets.map(async (snippet, index) => {
        try {
            await snippet.resolve(data);
        }
        catch (error) {
            errorMsg = `Error in Line ${snippet.lineNumber} in ${snippet.referencePath}\n${snippet.input_string}\n${error.message}\n`;
            console.log(errorMsg);
        }
    }));
    const resolvedSnippets = snippets.map((snippet) => snippet.toString());
    const loadedFiles = snippets.map((snippet) => snippet.getLoadedFiles()).flat();
    return { resolvedSnippets, loadedFiles, errorMsg };
};
exports.recombine = (plainHTMLSnippets, resolvedSnippets) => {
    let result = resolvedSnippets.reduce((total, currentValue, currentIndex) => {
        return total + plainHTMLSnippets[currentIndex] + currentValue;
    }, '');
    result += plainHTMLSnippets[plainHTMLSnippets.length - 1];
    return result;
};
exports.formatErrorToHtml = (errorMsg) => {
    errorMsg = lib_1.replaceAll(errorMsg, "\n", "<br>");
    errorMsg = `${errorMsg}`;
    return errorMsg;
};
