var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Snippet_1 = __importDefault(require("./Snippet"));
const node_sass_1 = __importDefault(require("node-sass"));
const path_1 = __importDefault(require("path"));
const lib_1 = require("../lib");
class FileInlineSnippet extends Snippet_1.default {
    constructor(input_string, lineNumber, path, transpiler) {
        super(input_string, lineNumber, path, transpiler);
        this.fileContents = '';
        this.fileIdentifier = '';
    }
    async resolve(data) {
        await this.readFile();
        let resolved = false;
        SupportedFileTypes.forEach((filetype) => {
            if (this.fileIdentifier == filetype.fileIdentifier) {
                try {
                    this.result = filetype.resolve(this.fileContents);
                }
                catch (error) {
                    throw new Error(`Filehandler exited with ${error}`);
                }
                resolved = true;
            }
        });
        if (!resolved)
            throw new Error(`There is no filehandler for ${this.fileIdentifier}!`);
        await this.postProcess(data);
    }
    async readFile() {
        let snippet_parts = this.input_string.split(' ');
        if (snippet_parts.length < 2)
            throw new Error('Not enough arguments! You need to at least give the File-Identifier and one filename!');
        snippet_parts = snippet_parts.filter((value) => value != '');
        //@ts-ignore
        this.fileIdentifier = snippet_parts.shift();
        this.filepaths = snippet_parts;
        await Promise.all(this.filepaths.map(async (filepath) => {
            const content = await lib_1.readFileFromDisk(path_1.default.join(path_1.default.dirname(this.referencePath), filepath));
            this.fileContents += ' ' + content;
        }));
    }
}
class FileType {
    constructor(fileIdentifier, resolverFunc) {
        this.fileIdentifier = fileIdentifier;
        this.resolverFunction = resolverFunc;
    }
    resolve(fileContent) {
        return this.resolverFunction(fileContent);
    }
}
const Css = new FileType('css', (ctn) => `<style>${ctn}</style>`);
const Svg = new FileType('svg', (ctn) => ctn);
const Js = new FileType('js', (ctn) => `<script>${ctn}</script>`);
const Sass = new FileType('sass', (ctn) => `<style>${node_sass_1.default.renderSync({ data: ctn }).css.toString()}</style>`);
const SupportedFileTypes = [Css, Svg, Js, Sass];
exports.default = FileInlineSnippet;
