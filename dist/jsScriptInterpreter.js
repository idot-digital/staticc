var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsInterpretInitFn = void 0;
const js_interpreter_1 = __importDefault(require("js-interpreter"));
const worker_threads_1 = require("worker_threads");
const JsInterpreter_1 = require("./classes/JsInterpreter");
const { codeString, data, args } = worker_threads_1.workerData;
const preparationCode = 'var data = JSON.parse(_data); var args = JSON.parse(_args); function render(arg){_render(JSON.stringify(arg))}';
//babel transpilation
const code = JsInterpreter_1.babelTranspile(preparationCode + codeString);
const interpreter = new js_interpreter_1.default(code, jsInterpretInitFn);
interpreter.setProperty(interpreter.globalObject, '_data', JSON.stringify(data));
interpreter.setProperty(interpreter.globalObject, '_rendered', false);
interpreter.setProperty(interpreter.globalObject, '_args', JSON.stringify(JsInterpreter_1.decodePrefabArgs(args, data)));
interpreter.run();
if (interpreter.globalObject._rendered) {
    const resolvedSnippet = JSON.parse(interpreter.globalObject.renderedContent);
    const noramlizedSnippet = JsInterpreter_1.noramlizeJsReturns(resolvedSnippet);
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ resultString: noramlizedSnippet });
}
else {
    const noramlizedSnippet = JsInterpreter_1.noramlizeJsReturns(interpreter.value);
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ resultString: noramlizedSnippet });
}
function jsInterpretInitFn(interpreter, globalObject) {
    const _render = (content) => {
        globalObject._rendered = true;
        globalObject.renderedContent = content;
    };
    const log = (something) => {
        console.info('SNIPPET-LOG:', something);
    };
    interpreter.setProperty(globalObject, '_render', interpreter.createNativeFunction(_render));
    interpreter.setProperty(globalObject, 'log', interpreter.createNativeFunction(log));
}
exports.jsInterpretInitFn = jsInterpretInitFn;
