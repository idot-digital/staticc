import { transpile } from '../transpile'
import { replaceAll } from '../lib'
class Snippet {
    input_string: string
    result: string
    filepaths: string[]
    lineNumber: Number
    referencePath: string
    constructor(input_string: string, lineNumber: Number, path: string) {
        this.input_string = input_string
        this.result = ''
        this.filepaths = []
        this.lineNumber = lineNumber
        this.referencePath = path
        this.cleanSnippetString()
    }
    async resolve(_: any): Promise<void> {
        await wait()
    }
    toString(): string {
        return this.result
    }
    getLoadedFiles(): string[] {
        return this.filepaths
    }
    cleanSnippetString(): void {
        this.input_string = replaceAll(this.input_string, '\n', '')
    }
    async postProcess(data: any): Promise<void> {
        const { htmlString, loadedFiles } = await transpile(this.result, data, this.filepaths[0] || 'src')
        this.filepaths = [...this.filepaths, ...loadedFiles]
        this.result = htmlString
        return
    }
}

const wait = async (): Promise<void> => {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve()
        }, 0)
    })
}

export default Snippet
