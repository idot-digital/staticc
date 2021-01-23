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
Object.defineProperty(exports, "__esModule", { value: true });
const seperate_1 = require("./seperate");
const pathLib = __importStar(require("path"));
class Preprocessor {
    constructor(input_string) {
        this.input_string = input_string;
        this.loadedFiles = [];
        this.linkedFiles = [];
        this.path = '';
    }
    preprocess(path) {
        this.path = path;
        this.cleanComments();
        this.extractLinkedFiles();
        return this.input_string;
    }
    cleanComments() {
        let input_string = this.input_string;
        const oc = seperate_1.occurrences(input_string, '{{$');
        let cleanedString = '';
        for (let i = 0; i < oc; i++) {
            const [firstPart, _, lastPart] = seperate_1.cutString(input_string, '{{$', '$}}');
            cleanedString += firstPart;
            input_string = lastPart;
        }
        this.input_string = cleanedString + input_string;
    }
    extractLinkedFiles() {
        if (this.input_string.indexOf('{{*') === -1 || this.input_string.indexOf('*}}') === -1)
            return [];
        if (this.path.indexOf("src") !== -1)
            throw new Error("link in src");
        const linkedFileString = this.input_string.slice(this.input_string.indexOf('{{*') + 3, this.input_string.indexOf('*}}'));
        this.input_string = this.input_string.replace(`{{*${linkedFileString}*}}`, ``);
        if (this.input_string.indexOf('{{*') === -1)
            throw new Error("multi-links");
        const files = linkedFileString.trim().split(/\s+/);
        this.linkedFiles = files.map((file) => {
            const filepath = pathLib.join(pathLib.dirname(this.path), file);
            this.loadedFiles.push(filepath);
            return {
                from: filepath,
                to: pathLib.join(pathLib.dirname(this.path).replace('prefabs', 'dist'), file),
            };
        });
    }
}
exports.default = Preprocessor;
