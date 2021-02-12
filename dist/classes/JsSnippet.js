var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const Snippet_1 = __importDefault(require("./Snippet"));
const path_1 = __importDefault(require("path"));
const jsinterpreter_1 = __importDefault(require("../jsinterpreter"));
const interpreter_libs_1 = require("../interpreter/interpreter_libs");
//@ts-ignore
let modulePath = require.main.path;
modulePath = modulePath.replace('__tests__', 'dist');
class JsSnippet extends Snippet_1.default {
    constructor(input_string, lineNumber, path, experimental) {
        super(input_string, lineNumber, path, experimental);
    }
    async resolve(data) {
        try {
            this.result = await this.interpret(data);
        }
        catch (error) {
            throw new Error(`JS-Interpreter exited with ${error}`);
        }
        await this.postProcess(data);
    }
    async interpret(data) {
        const input_string = this.input_string;
        if (this.experimental) {
            return interpreter_libs_1.noramlizeJsReturns(await jsinterpreter_1.default(input_string, data));
        }
        else {
            return new Promise((res, rej) => {
                const worker = new worker_threads_1.Worker(path_1.default.join(modulePath, 'interpreter', 'js_interpreter.js'), { workerData: { input_string, data } });
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
exports.default = JsSnippet;
