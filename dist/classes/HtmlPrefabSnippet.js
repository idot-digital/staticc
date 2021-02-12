Object.defineProperty(exports, "__esModule", { value: true });
const DataSnippet_1 = require("./DataSnippet");
const PrefabSnippet_1 = require("./PrefabSnippet");
class HtmlPrefabSnippet extends PrefabSnippet_1.PrefabSnippet {
    constructor(input_string, lineNumber, path, experimental) {
        super(input_string, PrefabSnippet_1.PrefabType.HtmlPrefabSnippet, lineNumber, path, experimental);
    }
    async resolve(data) {
        await super.readFile();
        this.result = this.fileContent;
        if (this.args.length > 1)
            throw new Error('You can only give one argument to html-prefabs!');
        const dataSelector = this.args.length < 1 ? data : DataSnippet_1.dataLookup(data, this.args[0]);
        await this.postProcess(dataSelector);
    }
}
exports.default = HtmlPrefabSnippet;
