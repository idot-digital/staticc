Object.defineProperty(exports, "__esModule", { value: true });
const PrefabSnippet_1 = require("./PrefabSnippet");
//@ts-ignore
let modulePath = require.main.path;
modulePath = modulePath.replace('__tests__', 'dist');
class JsPrefabSnippet extends PrefabSnippet_1.PrefabSnippet {
    constructor(input_string, lineNumber, path, transpiler) {
        super(input_string, PrefabSnippet_1.PrefabType.JsPrefabSnippet, lineNumber, path, transpiler);
    }
    async resolve(data) {
        await super.readFile();
        try {
            const result = await this.interpret(data);
            this.result = result;
        }
        catch (error) {
            throw new Error(`JS-Interpreter exited with ${error}`);
        }
        await this.postProcess(data);
    }
    async interpret(data) {
        return this.transpiler.interpreter.interpret(this.fileContent, data, this.args);
    }
}
exports.default = JsPrefabSnippet;
