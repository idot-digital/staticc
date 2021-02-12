var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabType = exports.PrefabSnippet = void 0;
const lib_1 = require("../lib");
const Snippet_1 = __importDefault(require("./Snippet"));
const path_1 = __importDefault(require("path"));
var PrefabType;
(function (PrefabType) {
    PrefabType[PrefabType["JsPrefabSnippet"] = 0] = "JsPrefabSnippet";
    PrefabType[PrefabType["HtmlPrefabSnippet"] = 1] = "HtmlPrefabSnippet";
})(PrefabType || (PrefabType = {}));
exports.PrefabType = PrefabType;
class PrefabSnippet extends Snippet_1.default {
    constructor(input_string, type, lineNumber, path, experimental) {
        super(input_string, lineNumber, path, experimental);
        this.args = [];
        this.fileContent = '';
        this.type = type;
    }
    async resolve(_) { }
    async readFile() {
        let snippet_parts = this.input_string.split(' ').filter((value) => value != '');
        if (snippet_parts.length < 1)
            throw new Error('Not enough arguments! You need to at least give the filename!');
        //@ts-ignore
        this.filepaths = [path_1.default.join('prefabs', snippet_parts.shift(), this.type == PrefabType.JsPrefabSnippet ? 'prefab.js' : 'prefab.html')];
        this.args = snippet_parts;
        this.fileContent = await lib_1.readFileFromDisk(this.filepaths[0]);
    }
}
exports.PrefabSnippet = PrefabSnippet;
