var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const Transpiler_1 = __importDefault(require("../Transpiler"));
class Snippet {
    constructor(input_string, lineNumber, path, experimental) {
        this.input_string = input_string;
        this.result = '';
        this.filepaths = [];
        this.lineNumber = lineNumber;
        this.referencePath = path;
        this.cleanSnippetString();
        this.filesToCopy = [];
        this.experimental = experimental;
    }
    async resolve(data) {
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
        const transpiler = new Transpiler_1.default(this.result, data, this.filepaths[0] || 'src', this.experimental);
        const htmlString = await transpiler.transpile();
        if (transpiler.errorMsg !== '')
            throw new Error(transpiler.errorMsg);
        this.filesToCopy = transpiler.filesToCopy;
        this.filepaths = [...this.filepaths, ...transpiler.loadedFiles];
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
