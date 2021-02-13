import Transpiler from '../Transpiler'
import { dataLookup } from './DataSnippet'
import { PrefabSnippet, PrefabType } from './PrefabSnippet'

class HtmlPrefabSnippet extends PrefabSnippet {
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler) {
        super(input_string, PrefabType.HtmlPrefabSnippet, lineNumber, path, transpiler)
    }
    async resolve(data: any): Promise<void> {
        await super.readFile()
        this.result = this.fileContent
        if (this.args.length > 1) throw new Error('You can only give one argument to html-prefabs!')
        const dataSelector = this.args.length < 1 ? data : dataLookup(data, this.args[0])
        await this.postProcess(dataSelector)
    }
}

export default HtmlPrefabSnippet
