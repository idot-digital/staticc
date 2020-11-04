Object.defineProperty(exports, "__esModule", { value: true });
exports._transpile = void 0;
const preprocess_1 = require("./preprocess");
const recombine_1 = require("./recombine");
const resolve_1 = require("./resolve");
const seperate_1 = require("./seperate");
exports._transpile = async (staticcString, data, snippetPrefix = '', path = 'src/', start_seperator = '{{', end_seperator = '}}') => {
    staticcString = preprocess_1.preprocess(staticcString);
    //SEPERATOR ENGINE
    const [plainHTMLSnippets, codeSnippets] = seperate_1.seperate(staticcString, start_seperator, end_seperator);
    //RESOLVER ENGINE
    const { resolvedSnippets, loadedFiles } = await resolve_1.resolve(codeSnippets, data);
    //RECOMBINATOR ENGINE
    const htmlString = recombine_1.recombine(plainHTMLSnippets, resolvedSnippets);
    return { htmlString, loadedFiles };
};
