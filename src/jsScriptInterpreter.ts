import JsInterpreter from 'js-interpreter'
import { workerData, parentPort } from 'worker_threads'
import { babelTranspile, decodePrefabArgs, noramlizeJsReturns } from './classes/JsInterpreter'

const { codeString, data, args } = workerData

const preparationCode = 'var data = JSON.parse(_data); var args = JSON.parse(_args); function render(arg){_render(JSON.stringify(arg))}'
//babel transpilation
const code = babelTranspile(preparationCode + codeString)
const interpreter = new JsInterpreter(code, jsInterpretInitFn)
interpreter.setProperty(interpreter.globalObject, '_data', JSON.stringify(data))
interpreter.setProperty(interpreter.globalObject, '_rendered', false)
interpreter.setProperty(interpreter.globalObject, '_args', JSON.stringify(decodePrefabArgs(args, data)))
interpreter.run()
if (interpreter.globalObject._rendered) {
    const resolvedSnippet = JSON.parse(interpreter.globalObject.renderedContent)
    const noramlizedSnippet = noramlizeJsReturns(resolvedSnippet)
    parentPort?.postMessage({resultString: noramlizedSnippet})
} else {
    const noramlizedSnippet = noramlizeJsReturns(interpreter.value)
    parentPort?.postMessage({resultString: noramlizedSnippet})
}

export function jsInterpretInitFn(interpreter: any, globalObject: any): void {
    const _render = (content: any) => {
        globalObject._rendered = true
        globalObject.renderedContent = content
    }
    const log = (something: any) => {
        console.info('SNIPPET-LOG:', something)
    }
    interpreter.setProperty(globalObject, '_render', interpreter.createNativeFunction(_render))
    interpreter.setProperty(globalObject, 'log', interpreter.createNativeFunction(log))
}
