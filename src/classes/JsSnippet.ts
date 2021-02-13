import { Worker } from 'worker_threads'
import Snippet from './Snippet'
import pathLib from 'path'
import Transpiler from '../Transpiler'

//@ts-ignore
let modulePath: string = require.main.path
modulePath = modulePath.replace('__tests__', 'dist')

class JsSnippet extends Snippet {
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler) {
        super(input_string, lineNumber, path, transpiler)
    }
    async resolve(data: any): Promise<void> {
        try {
            this.result = await this.interpret(data)
        } catch (error) {
            throw new Error(`JS-Interpreter exited with ${error}`)
        }
        await this.postProcess(data)
    }

    async interpret(data: any): Promise<string> {
        return this.transpiler.interpreter.interpret(this.input_string, data)
    }
}

export default JsSnippet
