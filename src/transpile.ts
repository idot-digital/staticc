import Snippet from './classes/Snippet'
import { preprocess } from './preprocess'
import { seperate } from './seperate'

export const transpile = async (staticcString: string, data: any, path: string, start_seperator: string = '{{', end_seperator: string = '}}') => {
    staticcString = preprocess(staticcString)

    //SEPERATOR ENGINE
    const { plainHTMLSnippets, codeSnippets } = seperate(staticcString, start_seperator, end_seperator, path)

    //RESOLVER ENGINE
    const { resolvedSnippets, loadedFiles } = await resolve(codeSnippets, data)

    //RECOMBINATOR ENGINE
    const htmlString = recombine(plainHTMLSnippets, resolvedSnippets)
    return { htmlString, loadedFiles }
}

export const resolve = async (snippets: Snippet[], data: any): Promise<{ resolvedSnippets: string[]; loadedFiles: string[] }> => {
    await Promise.all(
        snippets.map(async (snippet, index) => {
            try {
                await snippet.resolve(data)
            } catch (error) {
                console.log(`Error in Line ${snippet.lineNumber} in ${snippet.referencePath}\n`)
                console.log(snippet.input_string)
                console.log(`\n${error.message}\n`)
                //console.error(error)
            }
        })
    )
    const resolvedSnippets = snippets.map((snippet) => snippet.toString())
    const loadedFiles = snippets.map((snippet) => snippet.getLoadedFiles()).flat()

    return { resolvedSnippets, loadedFiles }
}

export const recombine = (plainHTMLSnippets: string[], resolvedSnippets: string[]): string => {
    let result = resolvedSnippets.reduce((total: string, currentValue: string, currentIndex: number) => {
        return total + plainHTMLSnippets[currentIndex] + currentValue
    }, '')
    result += plainHTMLSnippets[plainHTMLSnippets.length - 1]
    return result
}
