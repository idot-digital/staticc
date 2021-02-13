var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const glob_1 = require("glob");
const timer_1 = require("./timer");
const html_minifier_1 = require("html-minifier");
const Transpiler_1 = __importDefault(require("../Transpiler"));
const lib_1 = require("../lib");
const FileManager_1 = require("./FileManager");
async function build(build_prod, data_json_path, interpretingMode, filesToBuild = []) {
    const data = JSON.parse(await lib_1.readFileFromDisk(data_json_path));
    const buildableFiles = getAllBuildableFiles();
    const fileManager = new FileManager_1.FileManager();
    console.log(filesToBuild);
    fileManager.ignoreFiles(buildableFiles);
    if (filesToBuild.length === 0)
        filesToBuild = buildableFiles;
    console.log('\nstarting build!');
    await Promise.all(filesToBuild.map(async (file) => {
        console.log(file);
        const timer = new timer_1.Timer(`Finished ${file} after`);
        await transpileFile(file, data, build_prod, interpretingMode, fileManager);
        timer.print();
    }));
    fileManager.execute();
}
exports.build = build;
async function transpileFile(file, data, build_prod, interpretingMode, fileManager) {
    console.log('Building: ' + file);
    const successful = await generateNewFile(file, FileManager_1.changeFilenameFromSrcToDist(file), async (content, build_prod) => {
        const transpiler = new Transpiler_1.default(content, data, file, interpretingMode);
        let transpiledCode = await transpiler.transpile();
        if (transpiler.errorMsg !== '') {
            console.log(transpiler.errorMsg);
            transpiledCode = transpiler.getErrorAsHtml();
        }
        fileManager.copyFiles(transpiler.filesToCopy);
        fileManager.ignoreFiles(transpiler.loadedFiles);
        if (build_prod)
            transpiledCode = minifyHTML(transpiledCode);
        return transpiledCode;
    }, build_prod);
    if (!successful) {
        console.log(file + ' could not be transpiled!');
    }
}
function minifyHTML(html_String) {
    return html_minifier_1.minify(html_String, {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
    });
}
async function generateNewFile(readFileName, writeFileName, fn, ...args) {
    const readFileContent = await lib_1.readFileFromDisk(readFileName);
    let writeFileContent;
    //file read correctly
    writeFileContent = await fn(readFileContent, ...args);
    await lib_1.saveFileToDisk(writeFileName, writeFileContent);
    return true;
}
function getAllBuildableFiles() {
    return glob_1.glob.sync('src/**/*.html');
}
