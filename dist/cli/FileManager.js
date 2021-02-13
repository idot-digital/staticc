Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const lib_1 = require("./lib");
class FileManager {
    constructor() {
        this.filesToIgnore = [];
        this.filesToCopy = [];
    }
    copyFiles(files) {
        this.filesToCopy = [...this.filesToCopy, ...files];
    }
    ignoreFiles(files) {
        this.filesToIgnore = [...this.filesToIgnore, ...files];
    }
    execute() {
        lib_1.copyAllFiles(this.filesToIgnore);
        lib_1.copyLinkedFiles(this.filesToCopy);
    }
}
exports.FileManager = FileManager;
