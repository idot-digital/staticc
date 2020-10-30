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
exports.saveFileToDisk = exports.readFileFromDisk = void 0;
const fs = __importStar(require("fs"));
const pathLib = __importStar(require("path"));
const trycatch_1 = require("./trycatch");
exports.readFileFromDisk = async (filepath) => {
    //read file from disk
    const [readFileError, content] = await trycatch_1.trycatchasync(fs.promises.readFile, filepath, { encoding: 'utf8' });
    if (readFileError)
        throw new Error('Could not read file: ' + filepath);
    return content;
};
exports.saveFileToDisk = async (filepath, content) => {
    //save file to disk (+ create folders if neccesary)
    const folderpath = pathLib.dirname(filepath);
    if (folderpath) {
        const [mkdirError] = await trycatch_1.trycatchasync(fs.promises.mkdir, folderpath, { recursive: true });
        if (mkdirError)
            throw new Error('Could not create a new folder: ' + folderpath);
    }
    const [writeFileError] = await trycatch_1.trycatchasync(fs.promises.writeFile, filepath, content);
    if (writeFileError)
        throw new Error('Could not write to file: ' + filepath);
};
