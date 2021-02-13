import { PrefabSnippet, PrefabType } from './PrefabSnippet'
import { Worker } from 'worker_threads'
import pathLib from 'path'
import Transpiler from '../Transpiler'

//@ts-ignore
let modulePath: string = require.main.path
modulePath = modulePath.replace('__tests__', 'dist')

class JsPrefabSnippet extends PrefabSnippet {
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler) {
        super(input_string, PrefabType.JsPrefabSnippet, lineNumber, path, transpiler)
    }
    async resolve(data: any): Promise<void> {
        await super.readFile()
        try {
            const result = await this.interpret(data)
            this.result = result
        } catch (error) {
            throw new Error(`JS-Interpreter exited with ${error}`)
        }
        await this.postProcess(data)
    }

    async interpret(data: any): Promise<string> {
        return this.transpiler.interpreter.interpret(this.fileContent, data, this.args)
    }
}

export default JsPrefabSnippet
