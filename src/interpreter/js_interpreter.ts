import JsInterpreter from 'js-interpreter'
import { workerData, parentPort } from 'worker_threads'
import { noramlizeJsReturns, babelTranspile } from './interpreter_libs'

const { input_string, data } = workerData
const preparationCode = 'var data = JSON.parse(_data);'
const code = babelTranspile(preparationCode + input_string)
const interpreter = new JsInterpreter(code, jsInterpretInitFn)
interpreter.setProperty(interpreter.globalObject, '_data', JSON.stringify(data))
interpreter.run()
const noramlizedSnippet = noramlizeJsReturns(interpreter.value)
parentPort?.postMessage(noramlizedSnippet)

export function jsInterpretInitFn(interpreter: any, globalObject: any): void {
    const _render = (content: any) => {
        globalObject.renderedContent = content
    }
    const log = (something: any) => {
        console.log("SNIPPET-LOG:", something)
    }
    interpreter.setProperty(globalObject, '_render', interpreter.createNativeFunction(_render))
    interpreter.setProperty(globalObject, 'log', interpreter.createNativeFunction(log))
}
