var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const Preprocessor_1 = __importDefault(require("./Preprocessor"));
const seperate_1 = require("./seperate");
class Transpiler {
    constructor(input_string, data, path, start_seperator = '{{', end_seperator = '}}') {
        this.input_string = input_string;
        this.data = data;
        this.path = path;
        this.start_seperator = start_seperator;
        this.end_seperator = end_seperator;
        this.loadedFiles = [];
        this.filesToCopy = [];
        this.errorMsg = '';
        this.plainHTMLSnippets = [];
        this.resolvedSnippets = [];
    }
    async transpile() {
        const preprocessor = new Preprocessor_1.default(this.input_string);
        this.input_string = preprocessor.preprocess(this.path);
        const { plainHTMLSnippets, codeSnippets } = seperate_1.seperate(this.input_string, this.start_seperator, this.end_seperator, this.path);
        this.plainHTMLSnippets = plainHTMLSnippets;
        await Promise.all(codeSnippets.map(async (snippet) => {
            try {
                await snippet.resolve(this.data);
            }
            catch (error) {
                this.errorMsg = `Error in Line ${snippet.lineNumber} in ${snippet.referencePath}\n${snippet.input_string}\n${error.message}\n`;
            }
        }));
        const loadedFiles = codeSnippets.map((snippet) => snippet.getLoadedFiles()).flat();
        const filesToCopyFromSnippets = codeSnippets.map((snippet) => snippet.filesToCopy).flat();
        this.filesToCopy = [...this.filesToCopy, ...preprocessor.linkedFiles, ...filesToCopyFromSnippets];
        this.loadedFiles = [...this.loadedFiles, ...preprocessor.loadedFiles, ...loadedFiles];
        this.resolvedSnippets = codeSnippets.map((snippet) => snippet.toString());
        this.recombine();
        return this.input_string;
    }
    getErrorAsHtml() {
        this.errorMsg = lib_1.replaceAll(this.errorMsg, '\n', '<br>');
        this.errorMsg = `${this.errorMsg}`;
        return this.errorMsg;
    }
    recombine() {
        let result = this.resolvedSnippets.reduce((total, currentValue, currentIndex) => {
            return total + this.plainHTMLSnippets[currentIndex] + currentValue;
        }, '');
        result += this.plainHTMLSnippets[this.plainHTMLSnippets.length - 1];
        this.input_string = result;
    }
}
exports.default = Transpiler;