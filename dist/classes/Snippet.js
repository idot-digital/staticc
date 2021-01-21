Object.defineProperty(exports, "__esModule", { value: true });
const transpile_1 = require("../transpile");
const lib_1 = require("../lib");
class Snippet {
    constructor(input_string, lineNumber, path) {
        this.input_string = input_string;
        this.result = '';
        this.filepaths = [];
        this.lineNumber = lineNumber;
        this.referencePath = path;
        this.cleanSnippetString();
        this.filesToCopy = [];
    }
    async resolve(_) {
        await wait();
    }
    toString() {
        return this.result;
    }
    getLoadedFiles() {
        return this.filepaths;
    }
    cleanSnippetString() {
        this.input_string = lib_1.replaceAll(this.input_string, '\n', '');
    }
    async postProcess(data) {
        const { htmlString, loadedFiles, filesToCopy } = await transpile_1.transpile(this.result, data, this.filepaths[0] || 'src');
        this.filesToCopy = filesToCopy;
        this.filepaths = [...this.filepaths, ...loadedFiles];
        this.result = htmlString;
        return;
    }
}
const wait = async () => {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve();
        }, 0);
    });
};
exports.default = Snippet;
