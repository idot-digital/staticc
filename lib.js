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
exports.surpress_console_logs = exports.getCurrentSnippet = exports.getImportedImages = exports.getImportedFiles = exports.cleanComments = exports.importImg = exports.importJs = exports.importSass = exports.importCss = exports.importSvg = exports.decodePrefabArgs = exports.noramlizeJsReturns = exports.resolveDataSnippet = exports.resolveCmdSnippet = exports.resolvePrefabSnippet = exports.resolveJsSnippet = exports.resolveSnippets = exports.cutString = exports.occurrences = exports.seperateSnippets = exports._transpile = exports.transpile = void 0;
const sass = __importStar(require("sass"));
const pathLib = __importStar(require("path"));
const read_write_lib_js_1 = require("./read_write_lib.js");
const trycatch_js_1 = __importDefault(require("./trycatch.js"));
const importedFiles = [];
const importedImages = [];
let currentSnippet = "";
let surpress_logs = false;
exports.transpile = (input_string, data, snippetPrefix = "", path = "src/") => {
    return exports._transpile(input_string, data, snippetPrefix, path);
};
exports._transpile = (input_string, data, snippetPrefix = "", path = "src/") => {
    input_string = exports.cleanComments(input_string);
    //splits text into normal html code and code snippets
    const [plainHTMLSnippets, codeSnippets] = exports.seperateSnippets(input_string, "{{", "}}");
    //convertes code snippets to actual value
    const [resolvingError, resolvedSnippets] = trycatch_js_1.default(exports.resolveSnippets, codeSnippets, data, snippetPrefix, path);
    if (resolvingError)
        console.log(resolvingError);
    //const resolvedSnippets = resolveSnippets(codeSnippets, data, snippetPrefix, path);
    //recombines html with the resolved code snippets
    let result = resolvedSnippets.reduce((total, currentValue, currentIndex) => {
        return total + plainHTMLSnippets[currentIndex] + currentValue;
    }, "");
    result += plainHTMLSnippets[plainHTMLSnippets.length - 1];
    return result;
};
exports.seperateSnippets = (input_string, start_seperator, end_seperator) => {
    //count number of {{ => number of code blocks
    const oc = exports.occurrences(input_string, start_seperator);
    const plainHTMLSnippets = [];
    const codeSnippets = [];
    //for every code block, get the plain html and the code block and add it to the lists
    for (let i = 0; i < oc; i++) {
        const [firstPart, middlePart, lastPart] = exports.cutString(input_string, start_seperator, end_seperator);
        plainHTMLSnippets.push(firstPart);
        codeSnippets.push(middlePart);
        input_string = lastPart;
    }
    plainHTMLSnippets.push(input_string);
    return [plainHTMLSnippets, codeSnippets];
};
exports.occurrences = (string, subString) => {
    return string.split(subString).length - 1;
};
exports.cutString = (input_string, start_seperator, end_seperator) => {
    const openingIndex = input_string.indexOf(start_seperator);
    const cloringIndex = input_string.indexOf(end_seperator);
    const firstPart = input_string.slice(0, openingIndex);
    const middlePart = input_string.slice(openingIndex + 2, cloringIndex);
    const lastPart = input_string.slice(cloringIndex + 2);
    return [firstPart, middlePart, lastPart];
};
exports.resolveSnippets = (jsSnippets_array, data, snippetPrefix, path) => {
    return jsSnippets_array.map((snippet, index) => {
        index = index + 1;
        if (!surpress_logs)
            console.log("Resolving Snippet: " + snippetPrefix + index);
        currentSnippet = snippet;
        const js = snippet.indexOf("#");
        const prefab = snippet.indexOf("!");
        const cmd = snippet.indexOf("?");
        if (js != -1) {
            const resolvedSnippet = exports.resolveJsSnippet(snippet, data);
            return exports._transpile(resolvedSnippet, data, snippetPrefix + index + ".");
        }
        else if (prefab != -1) {
            const { resolvedSnippet, prefab_path } = exports.resolvePrefabSnippet(snippet, data);
            return exports._transpile(resolvedSnippet, data, snippetPrefix + index + ".", prefab_path);
        }
        else if (cmd != -1) {
            return exports.resolveCmdSnippet(snippet, path);
        }
        else {
            return exports.resolveDataSnippet(snippet, data);
        }
    });
};
exports.resolveJsSnippet = (snippet_string, data) => {
    //remove spaces and the #
    snippet_string = snippet_string.trim().replace("#", "");
    //run the js code and convert string array to array
    try {
        const evaluated_snippet = eval(snippet_string);
        return exports.noramlizeJsReturns(evaluated_snippet);
    }
    catch (executionError) {
        throw new Error("Could not execute js-snippet! Javascript-Error: " + executionError);
    }
};
exports.resolvePrefabSnippet = (snippet_string, data) => {
    //remove spaces and first !
    snippet_string = snippet_string.trim().replace("!", "");
    //seperate the path of the snippet from the args
    let snippet_string_parts = snippet_string.split(" ");
    let snippet_path = snippet_string_parts.shift();
    if (!snippet_path)
        throw new Error("You need to provide a path to the snippet!");
    //check if its a js or html prefab
    const prefab_path = pathLib.join("prefabs", snippet_path);
    if (read_write_lib_js_1.fileExists(pathLib.join(prefab_path, "prefab.html"))) {
        //=> HTML snippet
        //read in html file from disk and return it
        importedFiles.push(pathLib.join(prefab_path, "prefab.html"));
        return { resolvedSnippet: read_write_lib_js_1.readFileFromDisk(pathLib.join(prefab_path, "prefab.html")), prefab_path };
    }
    else if (read_write_lib_js_1.fileExists(pathLib.join(prefab_path, "prefab.js"))) {
        //=> JS snippet
        //read in the file
        const jsFile = read_write_lib_js_1.readFileFromDisk(pathLib.join(prefab_path, "prefab.js"));
        //parse the js code
        // eval(jsFile);
        // const args = decodePrefabArgs(snippet_string_parts, data)
        // //@ts-ignore
        // const resolvedSnippet = render(...args)
        // const noramlizedSnippet = noramlizeJsReturns(resolvedSnippet)
        return { resolvedSnippet: "", prefab_path };
    }
    else {
        //ERROR with prefab => No prefab file found
        throw new Error("ERROR: Could not find prefab file (Prefab: " + snippet_path + ")");
    }
};
exports.resolveCmdSnippet = (snippet_string, path) => {
    //remove spaces and ?
    let snippet_string_parts = snippet_string.trim().replace("?", "").split(" ");
    const snippet_cmd = snippet_string_parts.shift();
    if (snippet_cmd === "svg") {
        return exports.importSvg(snippet_string_parts, path);
    }
    else if (snippet_cmd === "css") {
        return exports.importCss(snippet_string_parts, path);
    }
    else if (snippet_cmd === "sass" || snippet_cmd === "scss") {
        return exports.importSass(snippet_string_parts, path);
    }
    else if (snippet_cmd === "js") {
        return exports.importJs(snippet_string_parts, path);
    }
    else if (snippet_cmd === "img") {
        return exports.importImg(snippet_string_parts, path);
    }
    else {
        throw new Error("Could not resolve file-snippet! The given filetype is not supported!");
    }
};
exports.resolveDataSnippet = (snippet_string, data) => {
    let value = data;
    const snippetParts = snippet_string.replace(/\s/g, "").split(".");
    try {
        for (let i = 0; i < snippetParts.length; i++) {
            value = value[snippetParts[i]];
            if (!value)
                throw new Error();
        }
    }
    catch (error) {
        throw Error("Could not resolve data-snippet. The requested value is undefined!");
    }
    return value;
};
exports.noramlizeJsReturns = (evaluated_snippet) => {
    //check if the evaluated snippet is a string which can be returned or if its an array which needs to be reduced
    if (!evaluated_snippet) {
        return "";
    }
    else if (evaluated_snippet.constructor === String) {
        return evaluated_snippet;
    }
    else if (evaluated_snippet.constructor === Array) {
        return evaluated_snippet.reduce((total, current) => {
            return total + current;
        });
    }
    else {
        throw new Error("Prefab could not be resolved! Only strings or array of strings are allowed as return values!");
    }
};
exports.decodePrefabArgs = (args, data) => {
    args = args.map((arg) => {
        if (arg == "")
            return "";
        if (arg.charAt(0) == '"') {
            arg = arg.substring(1, arg.length - 1);
            return arg;
        }
        else {
            if (!data[arg])
                throw new Error("Argument of the Prefab could not be resolved! Check if it is defined in the data-object!");
            return data[arg];
        }
    });
    return args;
};
exports.importSvg = (args, path) => {
    let resolvedSnippet = "";
    for (let i = 0; i < args.length; i++) {
        const filepath = pathLib.join(path, args[i]);
        importedFiles.push(filepath);
        resolvedSnippet += read_write_lib_js_1.readFileFromDisk(filepath);
    }
    return resolvedSnippet;
};
exports.importCss = (args, path) => {
    let stylesheet = "";
    for (let i = 0; i < args.length; i++) {
        const filepath = pathLib.join(path, args[i]);
        importedFiles.push(filepath);
        stylesheet += read_write_lib_js_1.readFileFromDisk(filepath);
    }
    return `<style>${stylesheet}</style>`;
};
exports.importSass = (args, path) => {
    let stylesheet = "";
    for (let i = 0; i < args.length; i++) {
        const filepath = pathLib.join(path, args[i]);
        importedFiles.push(filepath);
        stylesheet += sass.renderSync({ file: filepath }).css.toString();
    }
    return `<style>${stylesheet}</style>`;
};
exports.importJs = (args, path) => {
    let script = "";
    for (let i = 0; i < args.length; i++) {
        const filepath = pathLib.join(path, args[i]);
        importedFiles.push(filepath);
        script += read_write_lib_js_1.readFileFromDisk(filepath);
    }
    return `<script>${script}</script>`;
};
exports.importImg = (args, path, onlyWebP = false) => {
    const [filepath, alt_text, id, className] = args;
    const imgPath = pathLib.join(path, filepath);
    importedImages.push(imgPath);
    const imagePathParts = imgPath.split(".");
    imagePathParts.pop();
    const imagepathWithoutExt = imagePathParts.join(".");
    if (onlyWebP) {
        return `<picture class="${className}" id="${id}"><source srcset="${imagepathWithoutExt}.webp" type="image/webp"><img srcset="${imgPath}" alt="${alt_text}"></picture>`;
    }
    else {
        return `<picture class="${className}" id="${id}"><source srcset="${imagepathWithoutExt}.webp" type="image/webp"><source srcset="${imagepathWithoutExt}.jp2" type="image/jp2"><img srcset="${imgPath}" alt="${alt_text}"></picture>`;
    }
};
exports.cleanComments = (input_string) => {
    const [nonCommentSnippets] = exports.seperateSnippets(input_string, "{#", "#}");
    const result = nonCommentSnippets.reduce((total, currentValue) => {
        return total + currentValue;
    }, "");
    return result;
};
exports.getImportedFiles = () => {
    //@ts-ignore
    return [...new Set(importedFiles)];
};
exports.getImportedImages = () => {
    //@ts-ignore
    return [...new Set(importedImages)];
};
exports.getCurrentSnippet = () => {
    return currentSnippet;
};
exports.surpress_console_logs = () => {
    surpress_logs = true;
};
// exports.transpile = transpile;
// exports.getImportedFiles = getImportedFiles;
// exports.getImportedImages = getImportedImages;
// exports.getCurrentSnippet = getCurrentSnippet;
// exports.importSvg = importSvg;
// exports.importCss = importCss;
// exports.importSass = importSass;
// exports.importJs = importJs;
// exports.importImg = importImg;
// exports.importSvg = importSvg;
// exports.cleanComments = cleanComments;
// exports.resolveDataSnippet = resolveDataSnippet;
// exports.resolveJsSnippet = resolveJsSnippet;
// exports.resolvePrefabSnippet = resolvePrefabSnippet;
// exports.resolveCmdSnippet = resolveCmdSnippet;
// exports.resolveSnippets = resolveSnippets;
// exports.occurrences = occurrences;
// exports.cutString = cutString;
// exports.seperateSnippets = seperateSnippets;
// exports.noramlizeJsReturns = noramlizeJsReturns;
// exports.decodePrefabArgs = decodePrefabArgs;
// exports.surpress_console_logs = surpress_console_logs;
