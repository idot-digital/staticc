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
