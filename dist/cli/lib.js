var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyLinkedFiles = exports.generateNewFile = exports.copyAllFiles = exports.changeFilenameFromSrcToDist = exports.minifyHTML = exports.getInterpretingMode = exports.getDataJsonPath = void 0;
const JsInterpreter_1 = require("../classes/JsInterpreter");
const html_minifier_1 = require("html-minifier");
const node_sass_1 = __importDefault(require("node-sass"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const lib_1 = require("../lib");
function getDataJsonPath(args) {
    if (args.indexOf('-data') >= 0 || args.indexOf('-d') >= 0) {
        const index = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('-data');
        return args[index + 1];
    }
    else {
        return 'data.json';
    }
}
exports.getDataJsonPath = getDataJsonPath;
function getInterpretingMode(args) {
    const insecure = args.indexOf('insec') >= 0 || args.indexOf('-insec') >= 0 || args.indexOf('insecure') >= 0 || args.indexOf('-insecure') >= 0;
    const legacy = args.indexOf('--legacy') >= 0 || args.indexOf('-legacy') >= 0 || args.indexOf('legacy') >= 0 || args.indexOf('legacy') >= 0;
    const externalDeno = args.indexOf('--externalDeno') >= 0 || args.indexOf('-extDeno') >= 0 || args.indexOf('externalDeno') >= 0 || args.indexOf('extDeno') >= 0;
    const experimental = args.indexOf('exp') >= 0 || args.indexOf('-exp') >= 0 || args.indexOf('experimental') >= 0 || args.indexOf('-experimental') >= 0;
    if (experimental && !externalDeno) {
        return JsInterpreter_1.InterpretingMode.experimental;
    }
    else if (experimental && externalDeno) {
        return JsInterpreter_1.InterpretingMode.localDeno;
    }
    else if (insecure) {
        return JsInterpreter_1.InterpretingMode.insecure;
    }
    else if (legacy) {
        return JsInterpreter_1.InterpretingMode.legacy;
    }
    else {
        return JsInterpreter_1.InterpretingMode.default;
    }
}
exports.getInterpretingMode = getInterpretingMode;
function minifyHTML(html_String) {
    return html_minifier_1.minify(html_String, {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
    });
}
exports.minifyHTML = minifyHTML;
function changeFilenameFromSrcToDist(file) {
    return 'dist' + file.substring(3);
}
exports.changeFilenameFromSrcToDist = changeFilenameFromSrcToDist;
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
exports.copyAllFiles = copyAllFiles;
async function generateNewFile(readFileName, writeFileName, fn, ...args) {
    const readFileContent = await lib_1.readFileFromDisk(readFileName);
    let writeFileContent;
    //file read correctly
    writeFileContent = await fn(readFileContent, ...args);
    await lib_1.saveFileToDisk(writeFileName, writeFileContent);
    return true;
}
exports.generateNewFile = generateNewFile;
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
exports.copyLinkedFiles = copyLinkedFiles;
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
