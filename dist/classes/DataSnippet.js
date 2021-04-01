var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataLookup = exports.DataSnippet = void 0;
const Snippet_1 = __importDefault(require("./Snippet"));
class DataSnippet extends Snippet_1.default {
    constructor(input_string, lineNumber, path, transpiler) {
        super(input_string, lineNumber, path, transpiler);
    }
    async resolve(data) {
        const value = exports.dataLookup(data, this.input_string);
        if (value.constructor === Object) {
            throw Error('Could not resolve data-snippet. The requested value is an object!');
        }
        else if (value.constructor === Array) {
            throw Error('Could not resolve data-snippet. The requested value is an array!');
        }
        this.result = value;
        await this.postProcess(data);
    }
}
exports.DataSnippet = DataSnippet;
const dataLookup = (data, selector) => {
    const snippetParts = selector.split('.');
    try {
        snippetParts.forEach((snippetPart) => {
            data = data[snippetPart];
            if (!data)
                throw new Error();
        });
    }
    catch (error) {
        throw Error('Could not resolve data-snippet. The requested value is undefined!');
    }
    return data;
};
exports.dataLookup = dataLookup;
