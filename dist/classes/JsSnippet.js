var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Snippet_1 = __importDefault(require("./Snippet"));
//@ts-ignore
let modulePath = require.main.path;
modulePath = modulePath.replace('__tests__', 'dist');
class JsSnippet extends Snippet_1.default {
    constructor(input_string, lineNumber, path, transpiler) {
        super(input_string, lineNumber, path, transpiler);
    }
    async resolve(data) {
        try {
            const result = await this.interpret(data);
            this.result = result.resultString;
        }
        catch (error) {
            throw new Error(`JS-Interpreter exited with ${error}`);
        }
        await this.postProcess(data);
    }
    async interpret(data) {
        return this.transpiler.interpreter.interpret(this.input_string, data);
    }
}
exports.default = JsSnippet;
