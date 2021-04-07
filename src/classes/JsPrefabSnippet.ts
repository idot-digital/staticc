import Transpiler from '../Transpiler'
import Preprocessor from '../Preprocessor'
import { PrefabSnippet, PrefabType } from './PrefabSnippet'

//@ts-ignore
let modulePath: string = require.main.path
modulePath = modulePath.replace('__tests__', 'dist')

class JsPrefabSnippet extends PrefabSnippet {
    resolvedArgs: any
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler) {
        super(input_string, PrefabType.JsPrefabSnippet, lineNumber, path, transpiler)
        this.resolvedArgs = {}
    }
    async resolve(data: any): Promise<void> {
        await super.readFile()
        this.decodeArgs()
        const preprocessor = new Preprocessor(this.fileContent)
        preprocessor.path = this.filepaths[0]
        preprocessor.extractLinkedFiles()
        this.fileContent = preprocessor.input_string
        this.filesToCopy = [...this.filesToCopy, ...preprocessor.linkedFiles]
        try {
            const result = await this.interpret(data)
            this.result = result.resultString
            this.resolvedArgs = result.returnArgs
        } catch (error) {
            throw new Error(`JS-Interpreter exited with ${error}`)
        }
        await this.postProcess(data, this.resolvedArgs)
    }

    async interpret(data: any): Promise<{ resultString: string; returnArgs: any }> {
        return this.transpiler.interpreter.interpret(this.fileContent, data, this.args, this.transpiler.argParams)
    }

    decodeArgs() {
        const args = []
        let argString = this.args.filter((x) => x !== '').join(' ')
        while (argString !== '') {
            if (argString.charAt(0) === '`') {
                const backtickIndex = argString.slice(1).indexOf('`')
                args.push(argString.slice(0, backtickIndex + 2))
                argString = argString.slice(backtickIndex + 3)
            } else {
                const blankIndex = argString.indexOf(' ')
                if (blankIndex !== -1) {
                    args.push(argString.slice(0, blankIndex))
                    argString = argString.slice(blankIndex + 1)
                } else if (argString !== '') {
                    args.push(argString)
                    argString = ''
                }
            }
        }
        this.args = args
    }
}

export default JsPrefabSnippet
