Object.defineProperty(exports, "__esModule", { value: true });
exports.formatErrorToHtml = exports.recombine = exports.resolve = exports.transpile = void 0;
const lib_1 = require("./lib");
const preprocess_1 = require("./preprocess");
const seperate_1 = require("./seperate");
exports.transpile = async (staticcString, data, path, start_seperator = '{{', end_seperator = '}}') => {
    const { preprocessedString, filesToCopyFromThisFile } = preprocess_1.preprocess(staticcString, path);
    //SEPERATOR ENGINE
    const { plainHTMLSnippets, codeSnippets } = seperate_1.seperate(preprocessedString, start_seperator, end_seperator, path);
    //RESOLVER ENGINE
    const { resolvedSnippets, loadedFiles, errorMsg, filesToCopyFromSnippets } = await exports.resolve(codeSnippets, data);
    const filesToCopy = [...filesToCopyFromThisFile, ...filesToCopyFromSnippets];
    //RECOMBINATOR ENGINE
    let htmlString = errorMsg === '' ? exports.recombine(plainHTMLSnippets, resolvedSnippets) : exports.formatErrorToHtml(errorMsg);
    return { htmlString, loadedFiles: [...loadedFiles, ...filesToCopy.map((fileToCopy) => fileToCopy.from)], filesToCopy };
};
exports.resolve = async (snippets, data) => {
    let errorMsg = '';
    await Promise.all(snippets.map(async (snippet) => {
        try {
            await snippet.resolve(data);
        }
        catch (error) {
            errorMsg = `Error in Line ${snippet.lineNumber} in ${snippet.referencePath}\n${snippet.input_string}\n${error.message}\n`;
        }
    }));
    const resolvedSnippets = snippets.map((snippet) => snippet.toString());
    const loadedFiles = snippets.map((snippet) => snippet.getLoadedFiles()).flat();
    const filesToCopyFromSnippets = snippets.map((snippet) => snippet.filesToCopy).flat();
    return { resolvedSnippets, loadedFiles, errorMsg, filesToCopyFromSnippets };
};
exports.recombine = (plainHTMLSnippets, resolvedSnippets) => {
    let result = resolvedSnippets.reduce((total, currentValue, currentIndex) => {
        return total + plainHTMLSnippets[currentIndex] + currentValue;
    }, '');
    result += plainHTMLSnippets[plainHTMLSnippets.length - 1];
    return result;
};
exports.formatErrorToHtml = (errorMsg) => {
    errorMsg = lib_1.replaceAll(errorMsg, '\n', '<br>');
    errorMsg = `${errorMsg}`;
    return errorMsg;
};
