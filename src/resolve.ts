import { _transpile } from './transpile'
import JsSnippet from './classes/JsSnippet'
import JsPrefabSnippet from './classes/JsPrefabSnippet'
import HtmlPrefabSnippet from './classes/HtmlPrefabSnippet'
import FileInlineSnippet from './classes/FileInlineSnippet'
import DataSnippet from './classes/DataSnippet'
import Snippet from './classes/Snippet'

export const resolve = async (codeSnippets: string[], data: any, path: string): Promise<{ resolvedSnippets: string[]; loadedFiles: string[] }> => {
    const snippets = classifySnippets(codeSnippets, path)
    await Promise.all(
        snippets.map(async (snippet) => {
            await snippet.resolve(data)
        })
    )
    const resolvedSnippets = snippets.map((snippet) => snippet.toString())
    const loadedFiles = snippets.map((snippet) => snippet.getLoadedFiles()).flat()

    return { resolvedSnippets, loadedFiles }
}

export const classifySnippets = (codeSnippets: string[], path: string): Snippet[] => {
    return codeSnippets.map((snippet_string: string, index) => {
        if (snippet_string.indexOf('#') != -1) {
            console.log(index,"JsSnippet")
            return new JsSnippet(snippet_string.replace('#', ''))
        } else if (snippet_string.indexOf('!!') != -1) {
            console.log(index,"JsPrefabSnippet")
            return new JsPrefabSnippet(snippet_string.replace('!!', ''))
        } else if (snippet_string.indexOf('!') != -1) {
            console.log(index,"HtmlPrefabSnippet")
            return new HtmlPrefabSnippet(snippet_string.replace('!', ''))
        } else if (snippet_string.indexOf('?') != -1) {
            console.log(index,"FileInlineSnippet")
            return new FileInlineSnippet(snippet_string.replace('?', ''), path)
        } else {
            console.log(index,"DataSnippet")
            return new DataSnippet(snippet_string)
        }
    })
}
