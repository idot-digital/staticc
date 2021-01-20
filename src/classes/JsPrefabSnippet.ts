import { PrefabSnippet, PrefabType } from './PrefabSnippet'
import { Worker } from 'worker_threads'
import pathLib from 'path'

//@ts-ignore
let modulePath: string = require.main.path
modulePath = modulePath.replace('__tests__', 'dist')

class JsPrefabSnippet extends PrefabSnippet {
    constructor(input_string: string, lineNumber: Number, path: string) {
        super(input_string, PrefabType.JsPrefabSnippet, lineNumber, path)
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
        const fileContent = this.fileContent
        const args = this.args
        return new Promise((res, rej) => {
            const worker = new Worker(pathLib.join(modulePath, 'interpreter', 'prefab_interpreter.js'), { workerData: { fileContent, data, args } })
            worker.on('message', res)
            worker.on('error', rej)
            worker.on('exit', (code) => {
                if (code !== 0) rej(new Error(`Worker stopped with exit code ${code}`))
            })
        })
    }
}

export default JsPrefabSnippet
