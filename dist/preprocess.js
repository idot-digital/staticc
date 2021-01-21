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
exports.preprocess = void 0;
const seperate_1 = require("./seperate");
const pathLib = __importStar(require("path"));
exports.preprocess = (input_string, path) => {
    //cleanComments
    input_string = cleanComments(input_string);
    const { preprocessedString, filesToCopy } = getLinkedFiles(input_string, path);
    return { preprocessedString: preprocessedString, filesToCopyFromThisFile: filesToCopy };
};
const cleanComments = (inputString) => {
    const oc = seperate_1.occurrences(inputString, '{{$');
    let cleanedString = '';
    for (let i = 0; i < oc; i++) {
        const [firstPart, _, lastPart] = seperate_1.cutString(inputString, '{{$', '$}}');
        cleanedString += firstPart;
        inputString = lastPart;
    }
    return cleanedString + inputString;
};
const getLinkedFiles = (inputString, path) => {
    if (inputString.indexOf('{{*') === -1 || inputString.indexOf('*}}') === -1)
        return { preprocessedString: inputString, filesToCopy: [] };
    const linkedFileString = inputString.slice(inputString.indexOf('{{*') + 3, inputString.indexOf('*}}'));
    const preprocessedString = inputString.replace(`{{*${linkedFileString}*}}`, ``);
    const files = linkedFileString.trim().split(' ');
    const fileObjects = files.map((file) => {
        return {
            from: pathLib.join(pathLib.dirname(path), file),
            to: pathLib.join(pathLib.dirname(path).replace('prefabs', 'dist'), file),
        };
    });
    return { preprocessedString, filesToCopy: fileObjects };
};
