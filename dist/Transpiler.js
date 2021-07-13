var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Preprocessor_1 = __importDefault(require("./Preprocessing/Preprocessor"));
const seperate_1 = require("./seperate");
const JsInterpreter_1 = require("./legacy/JsInterpreter");
const internal_lib_1 = require("./internal_lib");
class Transpiler {
    constructor(input_string, data, path, interpretingMode, baseFolder = '', start_seperator = '{{', end_seperator = '}}', argParams = undefined) {
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
        this.interpreter = JsInterpreter_1.JsInterpreter.createInterpreter(interpretingMode);
        this.argParams = argParams;
        this.baseFolder = baseFolder;
    }
    async transpile() {
        const preprocessor = new Preprocessor_1.default(this.input_string, this);
        try {
            this.input_string = preprocessor.preprocess(this.path);
        }
        catch (error) {
            if (error.message == 'link in src') {
                this.errorMsg += `\nError in ${this.path}\nYou can't use a file-link-snippet in a src file! All files in this folder are copied anyways if they are not inlined!\n`;
            }
            else {
                this.errorMsg += `\nError in ${this.path}\nYou can only use one file-link-snippet in a file!\n`;
            }
        }
        const { plainHTMLSnippets, codeSnippets } = seperate_1.seperate(this.input_string, this.start_seperator, this.end_seperator, this.path, this);
        this.plainHTMLSnippets = plainHTMLSnippets;
        await Promise.all(codeSnippets.map(async (snippet) => {
            try {
                await snippet.resolve(this.data);
            }
            catch (error) {
                this.errorMsg += `\nError in Line ${snippet.lineNumber} in ${snippet.referencePath}\n${snippet.input_string}\n${error.message}\n`;
            }
        }));
        this.resolvedSnippets = codeSnippets.map((snippet) => snippet.toString());
        this.recombine();
        return this.input_string;
    }
    getErrorAsHtml() {
        this.errorMsg = internal_lib_1.replaceAll(this.errorMsg, '\n', '<br>');
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
    addLoadedFile(loadedFile) {
        this.loadedFiles.push(loadedFile);
    }
    addLinkedFile(from, to) {
        this.filesToCopy.push({
            from,
            to,
        });
    }
}
exports.default = Transpiler;
