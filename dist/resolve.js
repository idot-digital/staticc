var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifySnippets = exports.resolve = void 0;
const JsSnippet_1 = __importDefault(require("./classes/JsSnippet"));
const JsPrefabSnippet_1 = __importDefault(require("./classes/JsPrefabSnippet"));
const HtmlPrefabSnippet_1 = __importDefault(require("./classes/HtmlPrefabSnippet"));
const FileInlineSnippet_1 = __importDefault(require("./classes/FileInlineSnippet"));
const DataSnippet_1 = __importDefault(require("./classes/DataSnippet"));
exports.resolve = async (codeSnippets, data, path) => {
    const snippets = exports.classifySnippets(codeSnippets, path);
    await Promise.all(snippets.map(async (snippet) => {
        await snippet.resolve(data);
    }));
    const resolvedSnippets = snippets.map((snippet) => snippet.toString());
    const loadedFiles = snippets.map((snippet) => snippet.getLoadedFiles()).flat();
    return { resolvedSnippets, loadedFiles };
};
exports.classifySnippets = (codeSnippets, path) => {
    return codeSnippets.map((snippet_string, index) => {
        if (snippet_string.indexOf('#') != -1) {
            console.log(index, "JsSnippet");
            return new JsSnippet_1.default(snippet_string.replace('#', ''));
        }
        else if (snippet_string.indexOf('!!') != -1) {
            console.log(index, "JsPrefabSnippet");
            return new JsPrefabSnippet_1.default(snippet_string.replace('!!', ''));
        }
        else if (snippet_string.indexOf('!') != -1) {
            console.log(index, "HtmlPrefabSnippet");
            return new HtmlPrefabSnippet_1.default(snippet_string.replace('!', ''));
        }
        else if (snippet_string.indexOf('?') != -1) {
            console.log(index, "FileInlineSnippet");
            return new FileInlineSnippet_1.default(snippet_string.replace('?', ''), path);
        }
        else {
            console.log(index, "DataSnippet");
            return new DataSnippet_1.default(snippet_string);
        }
    });
};
