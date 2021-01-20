var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PrefabSnippet_1 = require("./PrefabSnippet");
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
//@ts-ignore
let modulePath = require.main.path;
modulePath = modulePath.replace('__tests__', 'dist');
class JsPrefabSnippet extends PrefabSnippet_1.PrefabSnippet {
    constructor(input_string, lineNumber, path) {
        super(input_string, PrefabSnippet_1.PrefabType.JsPrefabSnippet, lineNumber, path);
    }
    async resolve(data) {
        await super.readFile();
        const result = await this.interpret(data);
        this.result = result;
        await this.postProcess(data);
    }
    async interpret(data) {
        const fileContent = this.fileContent;
        const args = this.args;
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
exports.default = JsPrefabSnippet;
