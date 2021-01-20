var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transpile_1 = require("../transpile");
const path_1 = __importDefault(require("path"));
const wait_1 = __importDefault(require("../wait"));
class Snippet {
    constructor(input_string) {
        this.input_string = input_string;
        this.result = '';
        this.filepaths = [];
        this.cleanSnippetString();
    }
    async resolve(_) {
        await wait_1.default();
    }
    toString() {
        return this.result;
    }
    getLoadedFiles() {
        return this.filepaths;
    }
    cleanSnippetString() {
        this.input_string = replaceAll(this.input_string, "\n", "");
    }
    async postProcess(data) {
        const { htmlString, loadedFiles } = await transpile_1._transpile(this.result, data, "", path_1.default.dirname(this.filepaths[0] || "src"));
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
exports.default = Snippet;
