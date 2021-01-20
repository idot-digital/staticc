import JsInterpreter from 'js-interpreter'
import { workerData, parentPort } from 'worker_threads'
import { noramlizeJsReturns, babelTranspile } from './interpreter_libs'

const { fileContent, data, args } = workerData

const preparationCode = 'var data = JSON.parse(_data); var args = JSON.parse(_args); function render(arg){_render(JSON.stringify(arg))}'
//babel transpilation
const code = babelTranspile(preparationCode + fileContent)
const interpreter = new JsInterpreter(code, jsInterpretInitFn)
interpreter.setProperty(interpreter.globalObject, '_data', JSON.stringify(data))
interpreter.setProperty(interpreter.globalObject, '_args', JSON.stringify(decodePrefabArgs(args, data)))
interpreter.run()
if(!interpreter.globalObject.renderedContent){
    parentPort?.postMessage("")
}else{
    const resolvedSnippet = JSON.parse(interpreter.globalObject.renderedContent)
    const noramlizedSnippet = noramlizeJsReturns(resolvedSnippet)
    parentPort?.postMessage(noramlizedSnippet)
}

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

export function decodePrefabArgs(args: string[], data: any): string[] {
    args = args.map((arg: string) => {
        if (arg == '') return ''
        if (arg.charAt(0) == '"') {
            arg = arg.substring(1, arg.length - 1)
            return arg
        } else {
            if (!data[arg]) throw new Error('Argument of the Prefab could not be resolved! Check if it is defined in the data-object!')
            return data[arg] as string
        }
    })
    return args
}
