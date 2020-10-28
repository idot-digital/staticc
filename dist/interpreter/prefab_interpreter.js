var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noramlizeJsReturns = exports.decodePrefabArgs = exports.jsInterpretInitFn = void 0;
const js_interpreter_1 = __importDefault(require("js-interpreter"));
const worker_threads_1 = require("worker_threads");
const { snippet, data, args } = worker_threads_1.workerData;
const preparationCode = 'var data = JSON.parse(_data); var args = JSON.parse(_args); function render(arg){_render(JSON.stringify(arg))}';
//babel transpilation
const code = preparationCode + snippet.value;
const interpreter = new js_interpreter_1.default(code, jsInterpretInitFn);
interpreter.setProperty(interpreter.globalObject, '_data', JSON.stringify(data));
interpreter.setProperty(interpreter.globalObject, '_args', JSON.stringify(decodePrefabArgs(args, data)));
interpreter.run();
const resolvedSnippet = JSON.parse(interpreter.globalObject.renderedContent);
const noramlizedSnippet = noramlizeJsReturns(resolvedSnippet);
console.log(noramlizedSnippet);
snippet.value = noramlizedSnippet;
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
function decodePrefabArgs(args, data) {
    args = args.map((arg) => {
        if (arg == '')
            return '';
        if (arg.charAt(0) == '"') {
            arg = arg.substring(1, arg.length - 1);
            return arg;
        }
        else {
            if (!data[arg])
                throw new Error('Argument of the Prefab could not be resolved! Check if it is defined in the data-object!');
            return data[arg];
        }
    });
    return args;
}
exports.decodePrefabArgs = decodePrefabArgs;
function noramlizeJsReturns(interpreterResult) {
    //check if the evaluated snippet is a string which can be returned or if its an array which needs to be reduced
    if (!interpreterResult) {
        return '';
    }
    else if (interpreterResult.constructor === String) {
        return interpreterResult;
    }
    else if (interpreterResult.class === 'Array') {
        //@ts-ignore
        return Object.values(interpreterResult.properties).reduce((total, current) => {
            return total + current;
        }, '');
    }
    else if (interpreterResult.constructor === Array) {
        //@ts-ignore
        return interpreterResult.reduce((total, current) => {
            return total + current;
        }, '');
    }
    else {
        throw new Error('Prefab could not be resolved! Only strings or array of strings are allowed as return values!');
    }
}
exports.noramlizeJsReturns = noramlizeJsReturns;
