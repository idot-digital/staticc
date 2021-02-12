import { Worker } from 'worker_threads'
import Snippet from './Snippet'
import pathLib from 'path'
import interpret from '../jsinterpreter'
import { noramlizeJsReturns } from '../interpreter/interpreter_libs'

//@ts-ignore
let modulePath: string = require.main.path
modulePath = modulePath.replace('__tests__', 'dist')

class JsSnippet extends Snippet {
    constructor(input_string: string, lineNumber: Number, path: string, experimental: boolean) {
        super(input_string, lineNumber, path, experimental)
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
        const input_string = this.input_string
        if (this.experimental) {
            return noramlizeJsReturns(await interpret(input_string, data))
        } else {
            return new Promise((res, rej) => {
                const worker = new Worker(pathLib.join(modulePath, 'interpreter', 'js_interpreter.js'), { workerData: { input_string, data } })
                worker.on('message', res)
                worker.on('error', rej)
                worker.on('exit', (code) => {
                    if (code !== 0) rej(new Error(`Worker stopped with exit code ${code}`))
                })
            })
        }
    }
}

export default JsSnippet
