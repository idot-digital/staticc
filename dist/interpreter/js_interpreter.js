var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsInterpretInitFn = void 0;
const js_interpreter_1 = __importDefault(require("js-interpreter"));
const worker_threads_1 = require("worker_threads");
const { snippet, data } = worker_threads_1.workerData;
const preparationCode = 'var data = JSON.parse(_data);';
//babel transpilation
const code = preparationCode + snippet.value;
const interpreter = new js_interpreter_1.default(code, jsInterpretInitFn);
interpreter.setProperty(interpreter.globalObject, '_data', JSON.stringify(data));
interpreter.run();
snippet.value = interpreter.value;
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(snippet);
function jsInterpretInitFn(interpreter, globalObject) {
    const _render = (content) => {
        globalObject.renderedContent = content;
    };
    const log = (something) => {
        console.log(something);
    };
    interpreter.setProperty(globalObject, '_render', interpreter.createNativeFunction(_render));
    interpreter.setProperty(globalObject, 'log', interpreter.createNativeFunction(log));
}
exports.jsInterpretInitFn = jsInterpretInitFn;
