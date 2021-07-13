var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const internal_lib_1 = require("../internal_lib");
const Transpiler_1 = __importDefault(require("../Transpiler"));
class Snippet {
    constructor(input_string, lineNumber, path, transpiler) {
        this.input_string = input_string;
        this.result = '';
        this.filepath = 'src';
        this.lineNumber = lineNumber;
        this.referencePath = path;
        this.cleanSnippetString();
        this.transpiler = transpiler;
    }
    async resolve(data) {
        await wait();
    }
    toString() {
        return this.result;
    }
    cleanSnippetString() {
        this.input_string = internal_lib_1.replaceAll(this.input_string, '\n', '');
    }
    async postProcess(data, resolvedArgs = undefined) {
        this.result = `${this.result}`;
        const transpiler = new Transpiler_1.default(this.result, data, this.filepath, this.transpiler.interpreter.interpretingMode, this.transpiler.baseFolder, this.transpiler.start_seperator, this.transpiler.end_seperator, resolvedArgs);
        const htmlString = await transpiler.transpile();
        if (transpiler.errorMsg !== '')
            throw new Error(transpiler.errorMsg);
        transpiler.filesToCopy.forEach(({ from, to }) => this.transpiler.addLinkedFile(from, to));
        transpiler.loadedFiles.forEach((loadedFile) => this.transpiler.addLoadedFile(loadedFile));
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
