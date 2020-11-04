import { Worker } from 'worker_threads'
//import { v4 as uuid } from 'uuid'
import { readFileFromDisk } from './read_write'
import { snippet_type, snippet, fileSnippet, dataSnippet, jsPrefabSnippet, transpileableSnippet, loadedSnippet } from './interfaces'
import { _transpile } from './transpile'
import path from 'path'
import sass from 'node-sass'

export const resolve = async (codeSnippets: string[], data: any): Promise<{resolvedSnippets: string[], loadedFiles: string[]}> => {
    const groupedSnippets = _groupSnippets(codeSnippets)
    const loadedSnippets = await _loadSnippetsFromDisk(groupedSnippets)
    const interpretedSnippets = await _interpretSnippets(loadedSnippets, data)
    const transpiledContentOfSnippets = await _transpileSnippetString(interpretedSnippets as transpileableSnippet[], data)
    const resolvedSnippets = pipe(_resolveFileSnippets, _resolveDataSnippets)(transpiledContentOfSnippets, data)

    const loadedFiles = _getLoadedFiles(resolvedSnippets)

    return {resolvedSnippets: _snippets2Strings(resolvedSnippets), loadedFiles: loadedFiles}
}

//@ts-ignore 
let modulePath: string = require.main.path
modulePath = modulePath.replace("__tests__", "dist")


export const _groupSnippets = (codeSnippets: string[]): snippet[] => {
    return codeSnippets.map(
        (snippet_string: string, index): snippet => {
            console.log('Grouping Snippet: ' + (index + 1))
            const snippet: any = {
                //id: uuid(),
                type: snippet_type.data,
            }
            snippet_string = snippet_string.trim()
            if (snippet_string.indexOf('#') != -1) {
                //js snippet
                snippet.type = snippet_type.js
                snippet.value = snippet_string.replace('#', '')
            } else if (snippet_string.indexOf('!!') != -1) {
                const args = snippet_string.replace('!!', '').split(' ')
                const snippet_path = args.shift()
                if (!snippet_path) throw new Error('Cloud not resolve js-prefab! No filepath given!')
                //js prefab
                snippet.type = snippet_type.prefab_js
                snippet.path = [path.join('prefabs', snippet_path, 'prefab.js')]
                snippet.args = args
            } else if (snippet_string.indexOf('!') != -1) {
                //html prefab
                snippet.type = snippet_type.prefab_html
                snippet.path = [path.join('prefabs', snippet_string.replace('!', ''), 'prefab.html')]
            } else if (snippet_string.indexOf('?') != -1) {
                //file snippet
                const args = snippet_string.replace('?', '').split(' ')
                const snippet_cmd = args.shift()
                if (!snippet_cmd) throw new Error('Could not resolve file-snippet! The given filetype is not supported!')
                snippet.type = snippet_type.file
                snippet.path = args.map((filepath) => {
                    return path.join('src', filepath)
                })
                snippet.path = args
                snippet.args = [snippet_cmd]
            } else {
                //data snippet
                snippet.value = snippet_string
            }
            return snippet
        }
    )
}

export const _interpretSnippets = async (snippets: snippet[], data: any): Promise<snippet[]> => {
    return Promise.all(
        snippets.map(async (snippet, index) => {
            console.log('Interpreting Snippet: ' + (index + 1))
            if (snippet.type == snippet_type.prefab_js) {
                //@ts-ignore
                return _interpretPrefabSnippet(snippet, data, snippet.args)
            } else if (snippet.type == snippet_type.js) {
                return _interpretJSSnippet(snippet, data)
            } else {
                return snippet
            }
        })
    )
}

export const _loadSnippetsFromDisk = async (snippets: snippet[]): Promise<loadedSnippet[]> => {
    return Promise.all(
        snippets.map(async (snippet, index) => {
            console.log('Loading Snippet Files: ' + (index + 1))
            if (snippet.type == snippet_type.file || snippet.type == snippet_type.prefab_js || snippet.type == snippet_type.prefab_html) {
                return _readSnippetFiles(snippet as fileSnippet) as Promise<loadedSnippet>
            } else {
                return snippet as loadedSnippet
            }
        })
    )
}

export const _readSnippetFiles = async (snippet: fileSnippet): Promise<snippet> => {
    const fileContents = await Promise.all(
        snippet.path.map((path) => {
            return readFileFromDisk(path)
        })
    )
    let value = fileContents.join(' ')
    if (fileContents.length === 1) value = fileContents[0]
    snippet.value = value
    return snippet
}

export const _interpretJSSnippet = async (snippet: snippet, data: any): Promise<snippet> => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(modulePath, 'interpreter', 'js_interpreter.js'), { workerData: { snippet, data } })
        worker.on('message', resolve)
        worker.on('error', reject)
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
        })
    })
}
export const _interpretPrefabSnippet = async (snippet: snippet, data: any, args: string[]): Promise<snippet> => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(modulePath, 'interpreter', 'prefab_interpreter.js'), { workerData: { snippet, data, args } })
        worker.on('message', resolve)
        worker.on('error', reject)
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
        })
    })
}

export const _resolveDataSnippets = (snipepts: snippet[], data: any): snippet[] => {
    return snipepts.map((snippet, index) => {
        console.log('Resolving Snippet Data: ' + (index + 1))
        if (snippet.type == snippet_type.data) {
            return _resolveDataSnippet(snippet as dataSnippet, data)
        } else {
            return snippet
        }
    })
}

export const _resolveDataSnippet = (snippet: dataSnippet, data: any): snippet => {
    let value = data
    const snippetParts = snippet.value?.split('.')
    try {
        for (let i = 0; i < snippetParts.length; i++) {
            value = value[snippetParts[i]]
            if (!value) throw new Error()
        }
    } catch (error) {
        throw Error('Could not resolve data-snippet. The requested value is undefined!')
    }
    return { ...snippet, value: value }
}

export const _resolveFileSnippets = (snippets: snippet[]): snippet[] => {
    return snippets.map((snippet, index) => {
        console.log('Inligning Snippet: ' + (index + 1))
        if (snippet.type == snippet_type.file) {
            if (snippet.args?.includes('css')) {
                return { ...snippet, value: `<style>${snippet.value}</style>` }
            } else if (snippet.args?.includes('sass') || snippet.args?.includes('scss')) {
                //resovle Sass
                let css = ''
                if (snippet.value) css = renderSass(snippet.value)
                return { ...snippet, value: `<style>${snippet.value}</style>` }
            } else if (snippet.args?.includes('svg')) {
                return snippet
            } else if (snippet.args?.includes('js')) {
                return { ...snippet, value: `<script>${snippet.value}</script>` }
            } else {
                throw new Error('Could not resolve file-snippet! The given filetype is not supported!')
            }
        } else {
            return snippet
        }
    })
}

export const _transpileSnippetString = async (snippets: transpileableSnippet[], data: any): Promise<snippet[]> => {
    return await Promise.all(
        snippets.map(async (snippet, index) => {
            if (snippet.type === snippet_type.js || snippet.type === snippet_type.prefab_js || snippet.type === snippet_type.prefab_html) {
                const path = (snippet.path || [])[0] || ''
                const {htmlString, loadedFiles} = await _transpile(snippet.value, data, index.toString())
                snippet.value = htmlString
                snippet.path = [path, ...loadedFiles]
                return snippet;
            }
            return snippet
        })
    )
}

export const _snippets2Strings = (snippets: snippet[]): string[] => {
    return snippets.map((snippet) => {
        return snippet.value as string
    })
}

const pipe = (...fns: Function[]) => (x: snippet[], ...args: any[]) => fns.reduce((v, f) => f(v, ...args), x)

const renderSass = (str: string): string => {
    return sass.renderSync({ data: str }).css.toString()
}

export const _getLoadedFiles = (snippets: snippet[]): string[] => {
    //@ts-ignore
    let paths =  snippets.map((snippet) => {
        if(snippet.type == snippet_type.file || snippet.type == snippet_type.prefab_js || snippet.type == snippet_type.prefab_html){
                return snippet.path
        }
        return undefined
    })
    paths = paths.filter(e => e)
    //@ts-ignore
    return paths.flat()
}

