Object.defineProperty(exports, "__esModule", { value: true });
exports.recombine = exports.resolve = exports.transpile = void 0;
const preprocess_1 = require("./preprocess");
const seperate_1 = require("./seperate");
exports.transpile = async (staticcString, data, path, start_seperator = '{{', end_seperator = '}}') => {
    staticcString = preprocess_1.preprocess(staticcString);
    //SEPERATOR ENGINE
    const { plainHTMLSnippets, codeSnippets } = seperate_1.seperate(staticcString, start_seperator, end_seperator, path);
    //RESOLVER ENGINE
    const { resolvedSnippets, loadedFiles } = await exports.resolve(codeSnippets, data);
    //RECOMBINATOR ENGINE
    const htmlString = exports.recombine(plainHTMLSnippets, resolvedSnippets);
    return { htmlString, loadedFiles };
};
exports.resolve = async (snippets, data) => {
    await Promise.all(snippets.map(async (snippet, index) => {
        try {
            await snippet.resolve(data);
        }
        catch (error) {
            console.log(`Error in Line ${snippet.lineNumber} in ${snippet.referencePath}\n`);
            console.log(snippet.input_string);
            console.log(`\n${error.message}\n`);
            //console.error(error)
        }
    }));
    const resolvedSnippets = snippets.map((snippet) => snippet.toString());
    const loadedFiles = snippets.map((snippet) => snippet.getLoadedFiles()).flat();
    return { resolvedSnippets, loadedFiles };
};
exports.recombine = (plainHTMLSnippets, resolvedSnippets) => {
    let result = resolvedSnippets.reduce((total, currentValue, currentIndex) => {
        return total + plainHTMLSnippets[currentIndex] + currentValue;
    }, '');
    result += plainHTMLSnippets[plainHTMLSnippets.length - 1];
    return result;
};
