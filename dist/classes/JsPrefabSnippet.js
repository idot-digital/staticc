var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Preprocessor_1 = __importDefault(require("../Preprocessor"));
const PrefabSnippet_1 = require("./PrefabSnippet");
//@ts-ignore
let modulePath = require.main.path;
modulePath = modulePath.replace('__tests__', 'dist');
class JsPrefabSnippet extends PrefabSnippet_1.PrefabSnippet {
    constructor(input_string, lineNumber, path, transpiler) {
        super(input_string, PrefabSnippet_1.PrefabType.JsPrefabSnippet, lineNumber, path, transpiler);
        this.resolvedArgs = {};
    }
    async resolve(data) {
        await super.readFile();
        this.decodeArgs();
        const preprocessor = new Preprocessor_1.default(this.fileContent);
        preprocessor.path = this.filepaths[0];
        preprocessor.extractLinkedFiles();
        this.fileContent = preprocessor.input_string;
        this.filesToCopy = [...this.filesToCopy, ...preprocessor.linkedFiles];
        try {
            const result = await this.interpret(data);
            this.result = result.resultString;
            this.resolvedArgs = result.returnArgs;
        }
        catch (error) {
            throw new Error(`JS-Interpreter exited with ${error}`);
        }
        await this.postProcess(data, this.resolvedArgs);
    }
    async interpret(data) {
        return this.transpiler.interpreter.interpret(this.fileContent, data, this.args, this.transpiler.argParams);
    }
    decodeArgs() {
        const args = [];
        let argString = this.args.filter((x) => x !== '').join(' ');
        while (argString !== '') {
            if (argString.charAt(0) === '`') {
                const backtickIndex = argString.slice(1).indexOf('`');
                args.push(argString.slice(0, backtickIndex + 2));
                argString = argString.slice(backtickIndex + 3);
            }
            else {
                const blankIndex = argString.indexOf(' ');
                if (blankIndex !== -1) {
                    args.push(argString.slice(0, blankIndex));
                    argString = argString.slice(blankIndex + 1);
                }
                else if (argString !== '') {
                    args.push(argString);
                    argString = '';
                }
            }
        }
        this.args = args;
    }
}
exports.default = JsPrefabSnippet;
