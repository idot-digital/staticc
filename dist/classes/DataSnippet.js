var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Snippet_1 = __importDefault(require("./Snippet"));
class DataSnippet extends Snippet_1.default {
    constructor(input_string, lineNumber, path) {
        super(input_string, lineNumber, path);
    }
    async resolve(data) {
        let value = data;
        const snippetParts = this.input_string.split('.');
        try {
            snippetParts.forEach((snippetPart) => {
                value = value[snippetPart];
                if (!value)
                    throw new Error();
            });
        }
        catch (error) {
            throw Error('Could not resolve data-snippet. The requested value is undefined!');
        }
        this.result = value;
        await this.postProcess(data);
    }
}
exports.default = DataSnippet;
