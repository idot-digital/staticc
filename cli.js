#! /usr/bin/env node
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_js_1 = require("./lib.js");
const read_write_lib_js_1 = require("./read_write_lib.js");
const html_minifier_1 = require("html-minifier");
const glob_1 = __importDefault(require("glob"));
const imagemin_1 = __importDefault(require("imagemin"));
const imagemin_webp_1 = __importDefault(require("imagemin-webp"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const lite_server_1 = __importDefault(require("lite-server"));
const trycatch_js_1 = __importDefault(require("./trycatch.js"));
const child_process_1 = require("child_process");
const cross_spawn_1 = require("cross-spawn");
const args = process.argv.slice(2);
const help = args.indexOf("--help") >= 0 ||
    args.indexOf("-h") >= 0 ||
    args.indexOf("help") >= 0;
const version = args.indexOf("version") >= 0 ||
    args.indexOf("v") >= 0 ||
    args.indexOf("-v") >= 0;
const build_dev = args.indexOf("build-dev") >= 0;
const build_prod = args.indexOf("build") >= 0;
const serve = args.indexOf("serve") >= 0;
const init = args.indexOf("init") >= 0;
const data_json_override = args.indexOf("-data") >= 0 || args.indexOf("-d") >= 0;
let data_json_path = "data.json";
if (data_json_override) {
    const index = (args.indexOf("-d") !== -1 ? args.indexOf("-d") : args.indexOf("-data"));
    data_json_path = args[index + 1];
}
if (version) {
    const package_info = require("./package.json");
    console.log(package_info.version);
}
else if (help) {
    console.log("");
    console.log("Usage: staticc <command>");
    console.log("");
    console.log("where: <command> is one of:");
    console.log("v\t\t alias for version");
    console.log("version\t\t shows the version of the staticc-cli");
    console.log("build\t\t creates a production build of all html files");
    console.log("build-dev\t creates a development build of all html files");
    console.log("serve\t\t starts a development webserver");
    console.log("init\t\t initializes a new staticc project");
    console.log("");
    console.log("Visit https://github.com/luiskugel/staticc to learn more about staticc.");
}
else if (build_dev || build_prod) {
    build(build_prod);
}
else if (serve) {
    startServer();
}
else if (init) {
    console.log("");
    console.log("Initializing staticc project!");
    console.log("");
    const example_project = require("./example_project.json");
    Object.keys(example_project).forEach((filepath) => {
        read_write_lib_js_1.saveFileToDisk(filepath, example_project[filepath]);
    });
    const [yarnNotInstalled] = trycatch_js_1.default(child_process_1.execSync, "yarn -v");
    let error, child;
    if (yarnNotInstalled) {
        [error, child] = trycatch_js_1.default(cross_spawn_1.spawn, "npm", ["install"]);
    }
    else {
        [error, child] = trycatch_js_1.default(cross_spawn_1.spawn, "yarn", ["install"]);
    }
    if (error)
        console.error("Could not install babel and its packages.");
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
        console.log(chunk);
    });
    child.on('close', () => {
        console.log("Finished!");
    });
}
else {
    console.log("Use -h or --help for help!");
}
function startServer() {
    process.title = 'lite-server';
    //@ts-ignore
    process.argv = ['', '', '-c', path_1.default.join(require.main.path, 'bs-config.json')
    ];
    lite_server_1.default.server();
    console.log("Staticc server listening on http://localhost:8888/");
    let timeoutHandler;
    chokidar_1.default.watch('./', { ignored: /dist/ }).on('all', (event, path) => {
        clearTimeout(timeoutHandler);
        timeoutHandler = setTimeout(() => {
            //reload server
            build(false);
        }, 100);
    });
}
function build(build_prod) {
    const data = JSON.parse(read_write_lib_js_1.readFileFromDisk(data_json_path));
    console.log("");
    console.log("starting build!");
    const HTMLfiles = glob_1.default.sync("src/**/*.html");
    HTMLfiles.forEach((file) => {
        transpileFile(file, data, build_prod);
    });
    copyAllFiles([...lib_js_1.getImportedFiles(), ...HTMLfiles]);
    convertAllImages(lib_js_1.getImportedImages())
        .then(() => {
        console.log("finished build!");
    })
        .catch((err) => console.log(err));
}
function transpileFile(file, data, build_prod) {
    console.log("Building: " + file);
    const successful = generateNewFile(file, changeFilenameFromSrcToDist(file), (content, build_prod) => {
        let [transpilingError, transpiledCode] = trycatch_js_1.default(lib_js_1.transpile, content, data);
        if (transpilingError) {
            throw new Error("Could not transpile snippet: " + lib_js_1.getCurrentSnippet() + "There was the following error:" + transpilingError);
        }
        else {
            if (build_prod)
                transpiledCode = minifyHTML(transpiledCode);
        }
        return transpiledCode;
    }, build_prod);
    if (!successful) {
        console.log(file + " could not be transpiled!");
    }
    // const [readFileError, inputFile] = trycatch(readFileFromDisk(file));
    // let [transpilingError, transpiledCode] = trycatch(transpile, inputFile, data);
    // if(transpilingError){
    //   console.log("Error compiling Code snippet: " + getCurrentSnippet())
    // }else if(readFileError){
    //   console.log("Error: Could not read: " + file)
    // }
    // saveFileToDisk(changeFilenameFromSrcToDist(file), transpiledCode);
}
function generateNewFile(readFileName, writeFileName, fn, ...args) {
    const [readFileError, readFileContent] = trycatch_js_1.default(read_write_lib_js_1.readFileFromDisk, readFileName);
    let writeFileContent;
    if (readFileError) {
        //error reading file
        writeFileContent = readFileError.message;
    }
    else {
        //file read correctly
        writeFileContent = fn(readFileContent, ...args);
    }
    const [writeFileError] = trycatch_js_1.default(read_write_lib_js_1.saveFileToDisk, writeFileName, writeFileContent);
    if (writeFileError) {
        //file could not be saved
        throw writeFileError;
    }
    else {
        //file saved successfully
        return true;
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
function copyAllFiles(filter) {
    const allfiles = glob_1.default.sync("src/**/*.*");
    allfiles.forEach((file) => {
        if (filter.includes(file))
            return;
        const newFilepath = changeFilenameFromSrcToDist(file);
        const folderpath = newFilepath
            .split("/")
            .splice(0, newFilepath.split("/").length - 1)
            .join("/");
        if (folderpath)
            fs_1.default.mkdirSync(folderpath, { recursive: true });
        fs_1.default.copyFileSync(file, newFilepath);
    });
}
function changeFilenameFromSrcToDist(file) {
    return "dist" + file.substring(3);
}
async function convertAllImages(filepaths) {
    await imagemin_1.default(filepaths, {
        destination: "dist/",
        plugins: [imagemin_webp_1.default({ quality: 50 })],
    });
    console.log("Images optimized");
}
