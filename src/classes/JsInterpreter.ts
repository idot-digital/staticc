import pathLib from 'path'
import fetch from 'node-fetch'
import { Worker } from 'worker_threads'

export function decodePrefabArgs(args: string[], data: any, argParams: any = undefined): string[] {
    args = args.map((arg: string) => {
        const argLowerCase = arg.toLocaleLowerCase()
        if (argLowerCase === 'null' || argLowerCase === 'undefined') return null
        //null or undefined
        else if (arg.charAt(0) === '`') return arg.substring(1, arg.length - 1)
        //string
        else if (!isNaN(Number(arg))) return Number(arg)
        //number
        else if (argLowerCase === 'true') return true
        //boolean true
        else if (argLowerCase === 'false') return false
        // boolean false
        else if(arg.charAt(0) === "{" && arg.charAt(1) === "{") return dataLookup(data, arg.slice(2, arg.length-2)) //datajson
        else return argParams[arg] //arg param
    })
    return args
}

export enum InterpretingMode {
    default,
    experimental,
    legacy,

    remoteDeno,
    localDeno,
    jsScript,
    insecure,
}

export class JsInterpreter {
    interpretingMode = InterpretingMode.default
    constructor() {}
    static createInterpreter(mode: InterpretingMode) {
        let Interpreter
        switch (mode) {
            case InterpretingMode.default:
                Interpreter = new DenoInterpreter(true)
                Interpreter.interpretingMode = mode
                return Interpreter
            case InterpretingMode.legacy:
                Interpreter = new JsScriptInterpreter()
                Interpreter.interpretingMode = mode
                return Interpreter
            case InterpretingMode.experimental:
                Interpreter = new DenoInterpreter(false)
                Interpreter.interpretingMode = mode
                return Interpreter
            case InterpretingMode.remoteDeno:
                Interpreter = new DenoInterpreter(true)
                Interpreter.interpretingMode = mode
                return Interpreter
            case InterpretingMode.localDeno:
                Interpreter = new DenoInterpreter(false)
                Interpreter.interpretingMode = mode
                return Interpreter
            case InterpretingMode.jsScript:
                Interpreter = new JsScriptInterpreter()
                Interpreter.interpretingMode = mode
                return Interpreter
            case InterpretingMode.insecure:
                Interpreter = new InsecureInterpreter()
                Interpreter.interpretingMode = mode
                return Interpreter
        }
    }
    async interpret(string: string, data: any, args: any[] = [], argParams: any = undefined): Promise<{resultString: string, returnArgs: any}> {
        return {
            resultString: "",
            returnArgs: null
        }
    }
}

export class InsecureInterpreter extends JsInterpreter {
    constructor() {
        super()
    }
    async interpret(string: string, data: any, args: any[] = [], argParams: any = undefined): Promise<{resultString: string, returnArgs: any}> {
        args = decodePrefabArgs(args, data, argParams)
        const preparedJsCode = prepareJs(string)
        let res = eval(preparedJsCode)
        if (res.resultArgs === undefined) res = { value: res, returnArgs: [] }
        return {
            resultString: noramlizeJsReturns(res.value),
            returnArgs: res.resultArgs,
        }
    }
}

export class JsScriptInterpreter extends JsInterpreter {
    modulePath: any
    constructor() {
        super()
        //@ts-ignore
        this.modulePath = require.main.path
        this.modulePath = this.modulePath.replace('__tests__', 'dist')
    }
    async interpret(codeString: string, data: any, args: any[] = [], argParams: any = undefined): Promise<{resultString: string, returnArgs: any}> {
        return new Promise((res, rej) => {
            const worker = new Worker(pathLib.join(this.modulePath, 'jsScriptInterpreter.js'), { workerData: { codeString, data, args } })
            worker.on('message', res)
            worker.on('error', rej)
            worker.on('exit', (code) => {
                if (code !== 0) rej(new Error(`Worker stopped with exit code ${code}`))
            })
        })
    }
}
export class DenoInterpreter extends JsInterpreter {
    url: string
    constructor(remote: boolean) {
        super()
        this.url = remote ? 'http://195.90.200.109:9999' : 'http://127.0.0.1:9999'
    }
    async interpret(string: string, data: any, args: any[] = [], argParams: any = undefined): Promise<{resultString: string, returnArgs: any}> {
        args = decodePrefabArgs(args, data, argParams)
        const preparedJsCode = prepareJs(string)
        try {
            const result = await (
                await fetch(this.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: preparedJsCode,
                        data,
                        args,
                    }),
                })
            ).text()
            return seperateArgsAndResult(result)
        } catch (error) {
            throw new Error('Could not connect to interpreter! Is your Interpreter started and listening on port 9999?')
        }
    }
}

import * as babel from '@babel/core'
import { replaceAll } from '../internal_lib'
import { dataLookup } from './DataSnippet'
export function babelTranspile(code: string): string {
    try {
        const babelObj = babel.transform(code, {
            presets: [['@babel/env', { targets: { chrome: 5 }, useBuiltIns: 'entry', corejs: 3 }]],
            plugins: [
                // ["@babel/plugin-transform-runtime", { corejs: 3 }],
                '@babel/plugin-transform-shorthand-properties',
                '@babel/plugin-transform-spread',
                '@babel/plugin-transform-exponentiation-operator',
                '@babel/plugin-transform-typeof-symbol',
                '@babel/plugin-transform-instanceof',
                '@babel/plugin-transform-sticky-regex',
                '@babel/plugin-transform-template-literals',
                '@babel/plugin-transform-for-of',
                '@babel/plugin-transform-literals',
            ],
        })
        const transpiledCode = babelObj?.code
        if (!transpiledCode) throw new Error('Parsing of javascript returned null! Check if your code is valid!')
        return transpiledCode
    } catch (error) {
        throw new Error('Parsing of javascript failed! Check if your code is valid! Error: ' + error)
    }
}

export function noramlizeJsReturns(interpreterResult: any): string {
    //check if the evaluated snippet is a string which can be returned or if its an array which needs to be reduced
    if (interpreterResult === undefined || interpreterResult === null) {
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
    } else if (interpreterResult.constructor === Boolean || interpreterResult.constructor === Number) {
        //@ts-ignore
        return interpreterResult.toString()
    } else {
        throw new Error('Prefab could not be resolved! Only strings or array of strings are allowed as return values!')
    }
}

function prepareJs(scriptText:string) {
    let argVariables = []
    argVariables = [...findAllVariables(scriptText, "const:arg"), ...findAllVariables(scriptText, "let:arg")]
    scriptText = replaceAll(scriptText, "const:arg", "const")
    scriptText = replaceAll(scriptText, "let:arg", "let")
    scriptText = scriptText.replace('render(', `const _resultArgs = {${argVariables.join(',')}};render(`)
    return `${scriptText}; function render(value) {return {value, resultArgs: _resultArgs}}`
}

function findAllVariables(scriptText:string,  declarationPrefix: string) {
    const argVariables = []
    let returnString : string | null = scriptText
        while (returnString !== null){
            const [variableName, endOfScriptString] = findVariable(returnString, "const:arg")
            returnString = endOfScriptString
            if(variableName) argVariables.push(variableName)
        }
    return argVariables
}

function findVariable(scriptText:string, declarationPrefix: string) {
    const index = scriptText.indexOf(declarationPrefix)
    if(index !== -1){
        const partOfScriptString = scriptText.slice(index + 10)
        const indexOfNextEquals = partOfScriptString.indexOf('=')
        const indexOfNextBlank = partOfScriptString.indexOf(' ')
        const indexOfNextSemicolon = partOfScriptString.indexOf(';')

        let endOfVariableName = Math.min(...[indexOfNextEquals, indexOfNextBlank, indexOfNextSemicolon])

        const variableName = partOfScriptString.slice(0, endOfVariableName)
        const endOfScriptString = partOfScriptString.slice(endOfVariableName)
        return [variableName, endOfScriptString]
    }
    return [null, null]
}

function seperateArgsAndResult(resultString:string) {
    const seperator = "-----$!seperator!$-----";
    const result = resultString.split(seperator)
    return {
        resultString: noramlizeJsReturns(result[0]),
        returnArgs: JSON.parse(result[1])
    }
}