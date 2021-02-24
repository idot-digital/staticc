import pathLib from 'path'
import fetch from 'node-fetch'
import { Worker } from 'worker_threads'

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
                Interpreter = new JsScriptInterpreter()
                Interpreter.interpretingMode = mode
                return Interpreter
            case InterpretingMode.legacy:
                Interpreter = new JsScriptInterpreter()
                Interpreter.interpretingMode = mode
                return Interpreter
            case InterpretingMode.experimental:
                Interpreter = new DenoInterpreter(true)
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
    async interpret(string: string, data: any, args: any[] = []): Promise<string> {
        return ''
    }
}

export class InsecureInterpreter extends JsInterpreter {
    constructor() {
        super()
    }
    async interpret(string: string, data: any, args: any[] = []): Promise<string> {
        args = decodePrefabArgs(args, data)
        const javascriptCode = 'function render(value) {return value}'
        const res = eval(`${javascriptCode} ${string}`)
        return noramlizeJsReturns(res)
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
    async interpret(codeString: string, data: any, args: any[] = []): Promise<string> {
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
    async interpret(string: string, data: any, args: any[] = []): Promise<string> {
        args = decodePrefabArgs(args, data)
        try {
            const result = await (
                await fetch(this.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: string,
                        data,
                        args,
                    }),
                })
            ).json()
            return noramlizeJsReturns(result)
        } catch (error) {
            throw new Error('Could not connect to interpreter! Is your Interpreter started and listening on port 9999?')
        }
    }
}

import * as babel from '@babel/core'
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
