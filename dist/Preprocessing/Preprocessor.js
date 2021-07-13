var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cleanComments_1 = __importDefault(require("./cleanComments"));
const FileLinker_1 = __importDefault(require("./FileLinker"));
class Preprocessor {
    constructor(input_string, transpiler) {
        this.input_string = input_string;
        this.fileLinker = null;
        this.path = '';
        this.transpiler = transpiler;
    }
    preprocess(path) {
        this.path = path;
        this.input_string = cleanComments_1.default(this.input_string);
        this.fileLinker = new FileLinker_1.default(this.input_string, this.path);
        this.input_string = this.fileLinker.link();
        this.fileLinker.loadedFiles.forEach((loadedFile) => (loadedFile ? this.transpiler.addLoadedFile(loadedFile) : ''));
        this.fileLinker.linkedFiles.forEach(({ from, to }) => this.transpiler.addLinkedFile(from, to));
        return this.input_string;
    }
}
exports.default = Preprocessor;
