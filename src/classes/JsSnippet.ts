import { Worker } from 'worker_threads'
import Snippet from './Snippet'
import pathLib from 'path'

//@ts-ignore
let modulePath: string = require.main.path
modulePath = modulePath.replace('__tests__', 'dist')

class JsSnippet extends Snippet {
    constructor(input_string: string, lineNumber: Number, path: string) {
        super(input_string, lineNumber, path)
    }
    async resolve(data: any): Promise<void> {
        this.result = await this.interpret(data)
        await this.postProcess(data)
    }

    async interpret(data: any): Promise<string> {
        const input_string = this.input_string
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

export default JsSnippet
