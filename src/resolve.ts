import { Worker } from 'worker_threads'
import { v4 as uuid } from 'uuid'
import { readFileFromDisk } from './read_write'
import { snippet_type, snippet, fileSnippet, dataSnippet, jsPrefabSnippet } from './interfaces'

export const resolve = async (codeSnippets: string[], data: any): Promise<string[]> => {
    const groupedSnippets = _groupSnippets(codeSnippets)
    const loadedSnippets = await _loadSnippetsFromDisk(groupedSnippets)
    const interpretedSnippets = await _interpretSnippets(loadedSnippets, data)
    const resolvedSnippets = pipe(_resolveFileSnippets, _resolveDataSnippets, _resolvePrefabSnippets, _resolveJsSnippets)(interpretedSnippets, data)

    return _snippets2Strings(resolvedSnippets)
}

export const _groupSnippets = (codeSnippets: string[]): snippet[] => {
    return codeSnippets.map(
        (snippet_string: string): snippet => {
            const snippet: any = {
                id: uuid(),
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
                snippet.path = [snippet_path]
                snippet.args = args
            } else if (snippet_string.indexOf('!') != -1) {
                //html prefab
                snippet.type = snippet_type.prefab_html
                snippet.path = [snippet_string.replace('!', '')]
            } else if (snippet_string.indexOf('?') != -1) {
                //file snippet
                const args = snippet_string.replace('?', '').split(' ')
                const snippet_cmd = args.shift()
                if (!snippet_cmd) throw new Error('Could not resolve file-snippet! The given filetype is not supported!')
                snippet.type = snippet_type.file
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
        snippets.map(async (snippet) => {
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

export const _loadSnippetsFromDisk = async (snippets: snippet[]): Promise<snippet[]> => {
    return Promise.all(
        snippets.map(async (snippet) => {
            if (snippet.type == snippet_type.file || snippet.type == snippet_type.prefab_js || snippet.type == snippet_type.prefab_html) {
                return _readSnippetFiles(snippet as fileSnippet)
            } else {
                return snippet
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
    const value = fileContents.join(' ')
    snippet.value = value
    return snippet
}

export const _interpretJSSnippet = async (snippet: snippet, data: any): Promise<snippet> => {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./dist/interpreter/js_interpreter.js', { workerData: { snippet, data } })
        worker.on('message', resolve)
        worker.on('error', reject)
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
        })
    })
}
export const _interpretPrefabSnippet = async (snippet: snippet, data: any, args: string[]): Promise<snippet> => {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./dist/interpreter/prefab_interpreter.js', { workerData: { snippet, data, args } })
        worker.on('message', resolve)
        worker.on('error', reject)
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
        })
    })
}

export const _resolveDataSnippets = (snipepts: snippet[], data: any): snippet[] => {
    return snipepts.map((snippet) => {
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
    return { resolvedValue: value, ...snippet }
}

export const _resolveFileSnippets = (snippets: snippet[]): snippet[] => {
    return snippets.map((snippet) => {
        if (snippet.type == snippet_type.file) {
            if (snippet.args?.includes('css')) {
                return { resolvedValue: `<style>${snippet.value}</style>`, ...snippet }
            } else if (snippet.args?.includes('sass') || snippet.args?.includes('scss')) {
                //resovle Sass
                return { resolvedValue: `<style>${snippet.value}</style>`, ...snippet }
            } else if (snippet.args?.includes('svg')) {
                return { resolvedValue: snippet.value, ...snippet }
            } else if (snippet.args?.includes('js')) {
                return { resolvedValue: `<script>${snippet.value}</script>`, ...snippet }
            } else {
                throw new Error('Could not resolve file-snippet! The given filetype is not supported!')
            }
        } else {
            return snippet
        }
    })
}

export const _resolvePrefabSnippets = (snippets: snippet[]): snippet[] => {
    return snippets.map((snippet) => {
        if (snippet.type == snippet_type.prefab_html || snippet.type == snippet_type.prefab_js) {
            return { resolvedValue: snippet.value, ...snippet }
        } else {
            return snippet
        }
    })
}

export const _resolveJsSnippets = (snippets: snippet[]): snippet[] => {
    return snippets.map((snippet) => {
        if (snippet.type == snippet_type.js) {
            return { resolvedValue: snippet.value, ...snippet }
        } else {
            return snippet
        }
    })
}

export const _snippets2Strings = (snippets: snippet[]): string[] => {
    return snippets.map((snippet) => {
        return snippet.resolvedValue as string
    })
}

const pipe = (...fns: Function[]) => (x: snippet[], ...args: any[]) => fns.reduce((v, f) => f(v, ...args), x)
