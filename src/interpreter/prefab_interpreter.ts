import JsInterpreter from 'js-interpreter'
import { workerData, parentPort } from 'worker_threads'

const { snippet, data, args } = workerData

const preparationCode = 'var data = JSON.parse(_data); var args = JSON.parse(_args); function render(arg){_render(JSON.stringify(arg))}'
//babel transpilation
const code = preparationCode + snippet.value
const interpreter = new JsInterpreter(code, jsInterpretInitFn)
interpreter.setProperty(interpreter.globalObject, '_data', JSON.stringify(data))
interpreter.setProperty(interpreter.globalObject, '_args', JSON.stringify(decodePrefabArgs(args, data)))
interpreter.run()
const resolvedSnippet = JSON.parse(interpreter.globalObject.renderedContent)
const noramlizedSnippet = noramlizeJsReturns(resolvedSnippet)
console.log(noramlizedSnippet)
snippet.value = noramlizedSnippet
parentPort?.postMessage(snippet)

export function jsInterpretInitFn(interpreter: any, globalObject: any): void {
    const _render = (content: any) => {
        globalObject.renderedContent = content
    }
    const log = (something: any) => {
        console.log(something)
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

export function noramlizeJsReturns(interpreterResult: any): string {
    //check if the evaluated snippet is a string which can be returned or if its an array which needs to be reduced
    if (!interpreterResult) {
        return ''
    } else if (interpreterResult.constructor === String) {
        return interpreterResult as string
    } else if (interpreterResult.class === 'Array') {
        //@ts-ignore
        return Object.values(interpreterResult.properties).reduce((total: string, current: string) => {
            return total + current
        }, '')
    } else if (interpreterResult.constructor === Array) {
        //@ts-ignore
        return interpreterResult.reduce((total: string, current: string) => {
            return total + current
        }, '')
    } else {
        throw new Error('Prefab could not be resolved! Only strings or array of strings are allowed as return values!')
    }
}
