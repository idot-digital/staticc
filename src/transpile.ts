import Snippet from './classes/Snippet'
import { replaceAll } from './lib'
import { preprocess } from './preprocess'
import { seperate } from './seperate'

export const transpile = async (staticcString: string, data: any, path: string, start_seperator: string = '{{', end_seperator: string = '}}') => {
    staticcString = preprocess(staticcString)

    //SEPERATOR ENGINE
    const { plainHTMLSnippets, codeSnippets } = seperate(staticcString, start_seperator, end_seperator, path)

    //RESOLVER ENGINE
    const { resolvedSnippets, loadedFiles, errorMsg } = await resolve(codeSnippets, data)

    //RECOMBINATOR ENGINE
    let htmlString = (errorMsg === "") ? recombine(plainHTMLSnippets, resolvedSnippets) : formatErrorToHtml(errorMsg)
    
    return { htmlString, loadedFiles }
}

export const resolve = async (snippets: Snippet[], data: any): Promise<{ resolvedSnippets: string[]; loadedFiles: string[], errorMsg: string }> => {
    let errorMsg = "";
    await Promise.all(
        snippets.map(async (snippet, index) => {
            try {
                await snippet.resolve(data)
            } catch (error) {
                errorMsg = `Error in Line ${snippet.lineNumber} in ${snippet.referencePath}\n${snippet.input_string}\n${error.message}\n`
                console.log(errorMsg)
            }
        })
    )
    const resolvedSnippets = snippets.map((snippet) => snippet.toString())
    const loadedFiles = snippets.map((snippet) => snippet.getLoadedFiles()).flat()

    return { resolvedSnippets, loadedFiles, errorMsg }
}

export const recombine = (plainHTMLSnippets: string[], resolvedSnippets: string[]): string => {
    let result = resolvedSnippets.reduce((total: string, currentValue: string, currentIndex: number) => {
        return total + plainHTMLSnippets[currentIndex] + currentValue
    }, '')
    result += plainHTMLSnippets[plainHTMLSnippets.length - 1]
    return result
}

export const formatErrorToHtml = (errorMsg: string) : string=>{
    errorMsg = replaceAll(errorMsg, "\n", "<br>")
    errorMsg = `${errorMsg}`
    return errorMsg
}
