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
Object.defineProperty(exports, "__esModule", { value: true });
exports.noramlizeJsReturns = exports.babelTranspile = void 0;
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
