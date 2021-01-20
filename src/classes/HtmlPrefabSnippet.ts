import { PrefabSnippet, PrefabType } from './PrefabSnippet'

class HtmlPrefabSnippet extends PrefabSnippet {
    constructor(input_string: string, lineNumber: Number, path: string) {
        super(input_string, PrefabType.HtmlPrefabSnippet, lineNumber, path)
    }
    async resolve(data: any): Promise<void> {
        await super.readFile()
        this.result = this.fileContent
        await this.postProcess(data)
    }
}

export default HtmlPrefabSnippet
