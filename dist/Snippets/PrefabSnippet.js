var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabType = exports.PrefabSnippet = void 0;
const path_1 = __importDefault(require("path"));
const Snippet_1 = __importDefault(require("./Snippet"));
const internal_lib_1 = require("../internal_lib");
var PrefabType;
(function (PrefabType) {
    PrefabType[PrefabType["JsPrefabSnippet"] = 0] = "JsPrefabSnippet";
    PrefabType[PrefabType["HtmlPrefabSnippet"] = 1] = "HtmlPrefabSnippet";
})(PrefabType || (PrefabType = {}));
exports.PrefabType = PrefabType;
class PrefabSnippet extends Snippet_1.default {
    constructor(input_string, type, lineNumber, path, transpiler) {
        super(input_string, lineNumber, path, transpiler);
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
        this.filepath = path_1.default.join(this.transpiler.baseFolder, 'prefabs', snippet_parts.shift(), this.type == PrefabType.JsPrefabSnippet ? 'prefab.js' : 'prefab.html');
        this.args = snippet_parts;
        this.fileContent = await internal_lib_1.readFileFromDisk(this.filepath);
    }
}
exports.PrefabSnippet = PrefabSnippet;
