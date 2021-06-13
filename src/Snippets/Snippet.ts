import { replaceAll } from '../internal_lib'
import Transpiler from '../Transpiler'
class Snippet {
    input_string: string
    result: string
    lineNumber: Number
    referencePath: string
    transpiler: Transpiler
    filepath: string
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler) {
        this.input_string = input_string
        this.result = ''
        this.filepath = 'src'
        this.lineNumber = lineNumber
        this.referencePath = path
        this.cleanSnippetString()
        this.transpiler = transpiler
    }
    async resolve(data: any): Promise<void> {
        await wait()
    }
    toString(): string {
        return this.result
    }
    cleanSnippetString(): void {
        this.input_string = replaceAll(this.input_string, '\n', '')
    }
    async postProcess(data: any, resolvedArgs: any = undefined): Promise<void> {
        this.result = `${this.result}`
        const transpiler = new Transpiler(
            this.result,
            data,
            this.filepath,
            this.transpiler.interpreter.interpretingMode,
            this.transpiler.baseFolder,
            this.transpiler.start_seperator,
            this.transpiler.end_seperator,
            resolvedArgs
        )
        const htmlString = await transpiler.transpile()
        if (transpiler.errorMsg !== '') throw new Error(transpiler.errorMsg)
        transpiler.filesToCopy.forEach(({ from, to }) => this.transpiler.addLinkedFile(from, to))
        transpiler.loadedFiles.forEach((loadedFile) => this.transpiler.addLoadedFile(loadedFile))
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
