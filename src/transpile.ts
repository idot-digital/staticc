import { preprocess } from './preprocess'
import { recombine } from './recombine'
import { resolve, _interpretSnippets } from './resolve'
import { seperate } from './seperate'

export const _transpile = async (staticcString: string, data: any, snippetPrefix: string = '', path: string = 'src/', start_seperator: string = '{{', end_seperator: string = '}}') => {
    staticcString = preprocess(staticcString)

    //SEPERATOR ENGINE
    const [plainHTMLSnippets, codeSnippets] = seperate(staticcString, start_seperator, end_seperator)

    //RESOLVER ENGINE
    const resolvedSnippets = await resolve(codeSnippets, data)

    //RECOMBINATOR ENGINE
    const htmlString = recombine(plainHTMLSnippets, resolvedSnippets)
    return htmlString
}
