#! /usr/bin/env node
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_spawn_1 = require("cross-spawn");
const child_process_1 = require("child_process");
const lib_1 = require("./lib");
const glob_1 = require("glob");
const fs_1 = __importDefault(require("fs"));
const html_minifier_1 = require("html-minifier");
const lite_server_1 = __importDefault(require("lite-server"));
const chokidar_1 = __importDefault(require("chokidar"));
const node_sass_1 = __importDefault(require("node-sass"));
const path_1 = __importDefault(require("path"));
const Transpiler_1 = __importDefault(require("./Transpiler"));
const args = process.argv.slice(2);
//check which args have been given
const help = args.indexOf('--help') >= 0 || args.indexOf('-h') >= 0 || args.indexOf('help') >= 0;
const version = args.indexOf('version') >= 0 || args.indexOf('v') >= 0 || args.indexOf('-v') >= 0;
const build_dev = args.indexOf('build-dev') >= 0;
const build_prod = args.indexOf('build') >= 0;
const serve = args.indexOf('serve') >= 0;
const init = args.indexOf('init') >= 0;
const data_json_override = args.indexOf('-data') >= 0 || args.indexOf('-d') >= 0;
//set/ override the path of the data file
let data_json_path = 'data.json';
if (data_json_override) {
    const index = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('-data');
    data_json_path = args[index + 1];
}
let alreadyLoadedFiles = [];
let filesToCopy = [];
if (version) {
    const package_info = require('../package.json');
    console.log(package_info.version);
}
else if (help) {
    const helpString = '\n\nUsage: staticc <command>\n\nwhere: <command> is one of:\nv                alias for version\nversion          shows the version of the staticc-cli\nbuild            creates a production build of all html files\nbuild-dev        creates a development build of all html files\nserve            starts a development webserver\ninit             initializes a new staticc project\n\nVisit https://github.com/idot-digital/staticc to learn more about staticc.';
    console.log(helpString);
}
else if (build_dev || build_prod) {
    //build
    ;
    (async () => {
        await build(build_prod);
    })();
}
else if (serve) {
    //start server
    startDevServer();
}
else if (init) {
    //init
    ;
    (async () => {
        console.log('\n\nInitializing staticc project!\n\n');
        const example_project = require('./example_project');
        Object.keys(example_project.files).forEach(async (filepath) => {
            try {
                await lib_1.saveFileToDisk(filepath, example_project.files[filepath]);
            }
            catch (error) {
                console.log(error);
            }
        });
        let child;
        try {
            child_process_1.execSync('yarn -v');
            child = cross_spawn_1.spawn('yarn', ['install']);
        }
        catch (error) {
            //yarn not installed
            try {
                child = cross_spawn_1.spawn('npm', ['install']);
            }
            catch (error) {
                if (error)
                    console.error('Could not install babel and its packages.');
                return;
            }
        }
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            console.log(chunk);
        });
        child.on('close', () => {
            console.log('Finished!');
        });
    })();
}
else {
    console.log('Use -h or --help for help!');
}
async function build(build_prod) {
    const data = JSON.parse(await lib_1.readFileFromDisk(data_json_path));
    console.log('\nstarting build!');
    const HTMLfiles = glob_1.glob.sync('src/**/*.html');
    await Promise.all(HTMLfiles.map(async (file) => {
        await transpileFile(file, data, build_prod);
    }));
    //exclude already imported files
    const inlinedFiles = alreadyLoadedFiles;
    copyAllFiles([...HTMLfiles, ...inlinedFiles]);
    copyLinkedFiles(filesToCopy);
}
function startDevServer() {
    process.title = 'lite-server';
    //@ts-ignore
    process.argv = ['', '', '-c', path_1.default.join(require.main.path.replace('dist', ''), 'bs-config.json')];
    lite_server_1.default.server();
    console.log('Staticc server listening on http://localhost:8888/');
    let timeoutHandler;
    chokidar_1.default.watch('./', { ignored: /dist/ }).on('all', (event, path) => {
        clearTimeout(timeoutHandler);
        timeoutHandler = setTimeout(async () => {
            //reload server
            await build(false);
        }, 100);
    });
}
async function transpileFile(file, data, build_prod) {
    console.log('Building: ' + file);
    const successful = await generateNewFile(file, changeFilenameFromSrcToDist(file), async (content, build_prod) => {
        const transpiler = new Transpiler_1.default(content, data, file);
        let transpiledCode = await transpiler.transpile();
        if (transpiler.errorMsg !== "") {
            console.log(transpiler.errorMsg);
            transpiledCode = transpiler.getErrorAsHtml();
        }
        filesToCopy = [...filesToCopy, ...transpiler.filesToCopy];
        alreadyLoadedFiles = [...alreadyLoadedFiles, ...transpiler.loadedFiles];
        if (build_prod)
            transpiledCode = minifyHTML(transpiledCode);
        return transpiledCode;
    }, build_prod);
    if (!successful) {
        console.log(file + ' could not be transpiled!');
    }
}
async function generateNewFile(readFileName, writeFileName, fn, ...args) {
    const readFileContent = await lib_1.readFileFromDisk(readFileName);
    let writeFileContent;
    //file read correctly
    writeFileContent = await fn(readFileContent, ...args);
    await lib_1.saveFileToDisk(writeFileName, writeFileContent);
    return true;
}
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
function changeFilenameFromSrcToDist(file) {
    return 'dist' + file.substring(3);
}
function minifyHTML(html_String) {
    return html_minifier_1.minify(html_String, {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
    });
}
async function copyLinkedFiles(files) {
    await Promise.all(files.map(async (file) => {
        fs_1.default.mkdirSync(path_1.default.dirname(file.to), { recursive: true });
        if (path_1.default.extname(file.from) === ".sass" || path_1.default.extname(file.from) === ".scss") {
            await copyAndResolveSass(file.from, file.to);
        }
        else {
            await fs_1.default.promises.copyFile(file.from, file.to);
        }
    }));
}
async function copyAndResolveSass(from, to) {
    const filecontent = await fs_1.default.promises.readFile(from, { encoding: "utf-8" });
    try {
        const renderedSass = node_sass_1.default.renderSync({ data: filecontent }).css.toString();
        await fs_1.default.promises.writeFile(to.replace(".sass", ".css").replace(".scss", ".css"), renderedSass, { encoding: "utf-8" });
    }
    catch (error) {
        console.error(`Rendering linked sass-file: ${from} exited with ${error.message}`);
    }
}
