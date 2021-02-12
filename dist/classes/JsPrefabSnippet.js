var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PrefabSnippet_1 = require("./PrefabSnippet");
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
const jsinterpreter_1 = __importDefault(require("../jsinterpreter"));
const interpreter_libs_1 = require("../interpreter/interpreter_libs");
const jsinterpreter_2 = require("../jsinterpreter");
//@ts-ignore
let modulePath = require.main.path;
modulePath = modulePath.replace('__tests__', 'dist');
class JsPrefabSnippet extends PrefabSnippet_1.PrefabSnippet {
    constructor(input_string, lineNumber, path, experimental) {
        super(input_string, PrefabSnippet_1.PrefabType.JsPrefabSnippet, lineNumber, path, experimental);
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
        const fileContent = this.fileContent;
        const args = this.args;
        if (this.experimental) {
            return interpreter_libs_1.noramlizeJsReturns(await jsinterpreter_1.default(this.fileContent, data, jsinterpreter_2.decodePrefabArgs(args, data)));
        }
        else {
            return new Promise((res, rej) => {
                const worker = new worker_threads_1.Worker(path_1.default.join(modulePath, 'interpreter', 'prefab_interpreter.js'), { workerData: { fileContent, data, args } });
                worker.on('message', res);
                worker.on('error', rej);
                worker.on('exit', (code) => {
                    if (code !== 0)
                        rej(new Error(`Worker stopped with exit code ${code}`));
                });
            });
        }
    }
}
exports.default = JsPrefabSnippet;
