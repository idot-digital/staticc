Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = void 0;
exports.resolve = async (snippets, data) => {
    await Promise.all(snippets.map(async (snippet, index) => {
        try {
            await snippet.resolve(data);
        }
        catch (error) {
            console.log(`Error transpiling Snippet: ${index}\n`);
            console.log(snippet.input_string);
            console.log(`\n${error.message}`);
        }
    }));
    const resolvedSnippets = snippets.map((snippet) => snippet.toString());
    const loadedFiles = snippets.map((snippet) => snippet.getLoadedFiles()).flat();
    return { resolvedSnippets, loadedFiles };
};
