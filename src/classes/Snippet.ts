import { replaceAll } from '../lib'
import Transpiler from '../Transpiler'
class Snippet {
    input_string: string
    result: string
    filepaths: string[]
    lineNumber: Number
    referencePath: string
    filesToCopy: { from: string; to: string }[]
    experimental: boolean
    constructor(input_string: string, lineNumber: Number, path: string, experimental: boolean) {
        this.input_string = input_string
        this.result = ''
        this.filepaths = []
        this.lineNumber = lineNumber
        this.referencePath = path
        this.cleanSnippetString()
        this.filesToCopy = []
        this.experimental = experimental
    }
    async resolve(data: any): Promise<void> {
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
        const transpiler = new Transpiler(this.result, data, this.filepaths[0] || 'src', this.experimental)
        const htmlString = await transpiler.transpile()
        if (transpiler.errorMsg !== '') throw new Error(transpiler.errorMsg)
        this.filesToCopy = transpiler.filesToCopy
        this.filepaths = [...this.filepaths, ...transpiler.loadedFiles]
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
