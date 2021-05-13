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
const pathLib = __importStar(require("path"));
const internal_lib_1 = require("../internal_lib");
class FileLinker {
    constructor(string, path) {
        this.string = string;
        this.path = path;
        this.loadedFiles = [];
        this.linkedFiles = [];
    }
    link() {
        while (this.string.indexOf('{{*') !== -1 && this.string.indexOf('*}}') !== -1) {
            const linkedFileString = this.string.slice(this.string.indexOf('{{*') + 3, this.string.indexOf('*}}'));
            const file = linkedFileString.trim();
            const filepath = pathLib.join(pathLib.dirname(this.path), file);
            this.loadedFiles.push(filepath);
            const linkedFilepath = pathLib.join(pathLib.dirname(this.path).replace('prefabs', 'dist'), file);
            this.linkedFiles.push({
                from: filepath,
                to: linkedFilepath,
            });
            const returnPath = internal_lib_1.replaceAll('/' + linkedFilepath.replace(`dist${pathLib.normalize('/')}`, ``), pathLib.normalize('/'), '/');
            this.string = this.string.replace(`{{*${linkedFileString}*}}`, returnPath);
        }
        return this.string;
    }
}
exports.default = FileLinker;
