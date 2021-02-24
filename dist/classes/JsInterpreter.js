var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noramlizeJsReturns = exports.babelTranspile = exports.DenoInterpreter = exports.JsScriptInterpreter = exports.InsecureInterpreter = exports.JsInterpreter = exports.InterpretingMode = exports.decodePrefabArgs = void 0;
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const worker_threads_1 = require("worker_threads");
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
var InterpretingMode;
(function (InterpretingMode) {
    InterpretingMode[InterpretingMode["default"] = 0] = "default";
    InterpretingMode[InterpretingMode["experimental"] = 1] = "experimental";
    InterpretingMode[InterpretingMode["legacy"] = 2] = "legacy";
    InterpretingMode[InterpretingMode["remoteDeno"] = 3] = "remoteDeno";
    InterpretingMode[InterpretingMode["localDeno"] = 4] = "localDeno";
    InterpretingMode[InterpretingMode["jsScript"] = 5] = "jsScript";
    InterpretingMode[InterpretingMode["insecure"] = 6] = "insecure";
})(InterpretingMode = exports.InterpretingMode || (exports.InterpretingMode = {}));
class JsInterpreter {
    constructor() {
        this.interpretingMode = InterpretingMode.default;
    }
    static createInterpreter(mode) {
        let Interpreter;
        switch (mode) {
            case InterpretingMode.default:
                Interpreter = new JsScriptInterpreter();
                Interpreter.interpretingMode = mode;
                return Interpreter;
            case InterpretingMode.legacy:
                Interpreter = new JsScriptInterpreter();
                Interpreter.interpretingMode = mode;
                return Interpreter;
            case InterpretingMode.experimental:
                Interpreter = new DenoInterpreter(true);
                Interpreter.interpretingMode = mode;
                return Interpreter;
            case InterpretingMode.remoteDeno:
                Interpreter = new DenoInterpreter(true);
                Interpreter.interpretingMode = mode;
                return Interpreter;
            case InterpretingMode.localDeno:
                Interpreter = new DenoInterpreter(false);
                Interpreter.interpretingMode = mode;
                return Interpreter;
            case InterpretingMode.jsScript:
                Interpreter = new JsScriptInterpreter();
                Interpreter.interpretingMode = mode;
                return Interpreter;
            case InterpretingMode.insecure:
                Interpreter = new InsecureInterpreter();
                Interpreter.interpretingMode = mode;
                return Interpreter;
        }
    }
    async interpret(string, data, args = []) {
        return '';
    }
}
exports.JsInterpreter = JsInterpreter;
class InsecureInterpreter extends JsInterpreter {
    constructor() {
        super();
    }
    async interpret(string, data, args = []) {
        args = decodePrefabArgs(args, data);
        const javascriptCode = 'function render(value) {return value}';
        const res = eval(`${javascriptCode} ${string}`);
        return noramlizeJsReturns(res);
    }
}
exports.InsecureInterpreter = InsecureInterpreter;
class JsScriptInterpreter extends JsInterpreter {
    constructor() {
        super();
        //@ts-ignore
        this.modulePath = require.main.path;
        this.modulePath = this.modulePath.replace('__tests__', 'dist');
    }
    async interpret(codeString, data, args = []) {
        return new Promise((res, rej) => {
            const worker = new worker_threads_1.Worker(path_1.default.join(this.modulePath, 'jsScriptInterpreter.js'), { workerData: { codeString, data, args } });
            worker.on('message', res);
            worker.on('error', rej);
            worker.on('exit', (code) => {
                if (code !== 0)
                    rej(new Error(`Worker stopped with exit code ${code}`));
            });
        });
    }
}
exports.JsScriptInterpreter = JsScriptInterpreter;
class DenoInterpreter extends JsInterpreter {
    constructor(remote) {
        super();
        this.url = remote ? 'http://195.90.200.109:9999' : 'http://127.0.0.1:9999';
    }
    async interpret(string, data, args = []) {
        args = decodePrefabArgs(args, data);
        try {
            const result = await (await node_fetch_1.default(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: string,
                    data,
                    args,
                }),
            })).json();
            return noramlizeJsReturns(result);
        }
        catch (error) {
            throw new Error('Could not connect to interpreter! Is your Interpreter started and listening on port 9999?');
        }
    }
}
exports.DenoInterpreter = DenoInterpreter;
const babel = __importStar(require("@babel/core"));
function babelTranspile(code) {
    try {
        const babelObj = babel.transform(code, {
            presets: [['@babel/env', { targets: { chrome: 5 }, useBuiltIns: 'entry', corejs: 3 }]],
            plugins: [
                // ["@babel/plugin-transform-runtime", { corejs: 3 }],
                '@babel/plugin-transform-shorthand-properties',
                '@babel/plugin-transform-spread',
                '@babel/plugin-transform-exponentiation-operator',
                '@babel/plugin-transform-typeof-symbol',
                '@babel/plugin-transform-instanceof',
                '@babel/plugin-transform-sticky-regex',
                '@babel/plugin-transform-template-literals',
                '@babel/plugin-transform-for-of',
                '@babel/plugin-transform-literals',
            ],
        });
        const transpiledCode = babelObj === null || babelObj === void 0 ? void 0 : babelObj.code;
        if (!transpiledCode)
            throw new Error('Parsing of javascript returned null! Check if your code is valid!');
        return transpiledCode;
    }
    catch (error) {
        throw new Error('Parsing of javascript failed! Check if your code is valid! Error: ' + error);
    }
}
exports.babelTranspile = babelTranspile;
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
