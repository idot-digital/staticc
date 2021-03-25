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
exports.replaceAll = exports.trycatchasync = exports.readFileFromDisk = void 0;
const fs = __importStar(require("fs"));
const readFileFromDisk = async (filepath) => {
    //read file from disk
    const [readFileError, content] = await trycatchasync(fs.promises.readFile, filepath, { encoding: 'utf8' });
    if (readFileError)
        throw new Error('Could not read file: ' + filepath);
    return content;
};
exports.readFileFromDisk = readFileFromDisk;
async function trycatchasync(fn, ...args) {
    try {
        const result = await fn(...args);
        return [null, result];
    }
    catch (error) {
        return [error, null];
    }
}
exports.trycatchasync = trycatchasync;
const replaceAll = (string, searchValue, replaceValue) => {
    while (string.indexOf(searchValue) !== -1) {
        string = string.replace(searchValue, replaceValue);
    }
    return string;
};
exports.replaceAll = replaceAll;
