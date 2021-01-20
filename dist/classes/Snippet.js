Object.defineProperty(exports, "__esModule", { value: true });
const transpile_1 = require("../transpile");
class Snippet {
    constructor(input_string, lineNumber, path) {
        this.input_string = input_string;
        this.result = '';
        this.filepaths = [];
        this.lineNumber = lineNumber;
        this.referencePath = path;
        this.cleanSnippetString();
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
        this.input_string = replaceAll(this.input_string, '\n', '');
    }
    async postProcess(data) {
        const { htmlString, loadedFiles } = await transpile_1.transpile(this.result, data, this.filepaths[0] || 'src');
        this.filepaths = [...this.filepaths, ...loadedFiles];
        this.result = htmlString;
        return;
    }
}
const replaceAll = (string, searchValue, replaceValue) => {
    while (string.indexOf(searchValue) !== -1) {
        string = string.replace(searchValue, replaceValue);
    }
    return string;
};
const wait = async () => {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve();
        }, 0);
    });
};
exports.default = Snippet;
