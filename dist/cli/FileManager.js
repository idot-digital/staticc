var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeFilenameFromSrcToDist = exports.FileManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const node_sass_1 = __importDefault(require("node-sass"));
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
        copyAllFiles(this.filesToIgnore);
        copyLinkedFiles(this.filesToCopy);
    }
}
exports.FileManager = FileManager;
function copyAllFiles(filter) {
    const allfiles = glob_1.glob.sync('src/**/*.*');
    allfiles.forEach((file) => {
        if (filter.includes(file))
            return;
        const newFilepath = changeFilenameFromSrcToDist(file);
        const folderpath = newFilepath
            .split('/')
            .splice(0, newFilepath.split('/').length - 1)
            .join('/');
        if (folderpath)
            fs_1.default.mkdirSync(folderpath, { recursive: true });
        fs_1.default.copyFileSync(file, newFilepath);
    });
}
async function copyLinkedFiles(files) {
    await Promise.all(files.map(async (file) => {
        fs_1.default.mkdirSync(path_1.default.dirname(file.to), { recursive: true });
        if (path_1.default.extname(file.from) === '.sass' || path_1.default.extname(file.from) === '.scss') {
            await copyAndResolveSass(file.from, file.to);
        }
        else {
            await fs_1.default.promises.copyFile(file.from, file.to);
        }
    }));
}
async function copyAndResolveSass(from, to) {
    const filecontent = await fs_1.default.promises.readFile(from, { encoding: 'utf-8' });
    try {
        const renderedSass = node_sass_1.default.renderSync({ data: filecontent }).css.toString();
        await fs_1.default.promises.writeFile(to.replace('.sass', '.css').replace('.scss', '.css'), renderedSass, { encoding: 'utf-8' });
    }
    catch (error) {
        console.error(`Rendering linked sass-file: ${from} exited with ${error.message}`);
    }
}
function changeFilenameFromSrcToDist(file) {
    return 'dist' + file.substring(3);
}
exports.changeFilenameFromSrcToDist = changeFilenameFromSrcToDist;
