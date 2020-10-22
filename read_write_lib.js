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
exports.fileExists = exports.saveFileToDisk = exports.readFileFromDisk = void 0;
const fs = __importStar(require("fs"));
const pathLib = __importStar(require("path"));
const trycatch_js_1 = __importDefault(require("./trycatch.js"));
exports.readFileFromDisk = (filepath) => {
    //read file from disk
    const [readFileError, content] = trycatch_js_1.default(fs.readFileSync, filepath, { encoding: "utf8" });
    if (readFileError)
        throw new Error("Could not read file: " + filepath);
    return content;
};
exports.saveFileToDisk = (filepath, content) => {
    //save file to disk (+ create folders if neccesary)
    const folderpath = pathLib.join(...(filepath.split("/").splice(0, filepath.split("/").length - 1)));
    if (folderpath) {
        const [mkdirError] = trycatch_js_1.default(fs.mkdirSync, folderpath, { recursive: true });
        if (mkdirError)
            throw new Error("Could not create a new folder: " + folderpath);
    }
    const [writeFileError] = trycatch_js_1.default(fs.writeFileSync, filepath, content);
    if (writeFileError)
        throw new Error("Could not write to file: " + filepath);
};
exports.fileExists = (filepath) => {
    return fs.existsSync(filepath);
};
