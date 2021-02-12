var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsInterpretInitFn = void 0;
const js_interpreter_1 = __importDefault(require("js-interpreter"));
const worker_threads_1 = require("worker_threads");
const jsinterpreter_1 = require("../jsinterpreter");
const interpreter_libs_1 = require("./interpreter_libs");
const { fileContent, data, args } = worker_threads_1.workerData;
const preparationCode = 'var data = JSON.parse(_data); var args = JSON.parse(_args); function render(arg){_render(JSON.stringify(arg))}';
//babel transpilation
const code = interpreter_libs_1.babelTranspile(preparationCode + fileContent);
const interpreter = new js_interpreter_1.default(code, jsInterpretInitFn);
interpreter.setProperty(interpreter.globalObject, '_data', JSON.stringify(data));
interpreter.setProperty(interpreter.globalObject, '_args', JSON.stringify(jsinterpreter_1.decodePrefabArgs(args, data)));
interpreter.run();
if (!interpreter.globalObject.renderedContent) {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage("");
}
else {
    const resolvedSnippet = JSON.parse(interpreter.globalObject.renderedContent);
    const noramlizedSnippet = interpreter_libs_1.noramlizeJsReturns(resolvedSnippet);
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(noramlizedSnippet);
}
function jsInterpretInitFn(interpreter, globalObject) {
    const _render = (content) => {
        globalObject.renderedContent = content;
    };
    const log = (something) => {
        console.log("SNIPPET-LOG:", something);
    };
    interpreter.setProperty(globalObject, '_render', interpreter.createNativeFunction(_render));
    interpreter.setProperty(globalObject, 'log', interpreter.createNativeFunction(log));
}
exports.jsInterpretInitFn = jsInterpretInitFn;
