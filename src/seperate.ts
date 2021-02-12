import { DataSnippet } from './classes/DataSnippet'
import FileInlineSnippet from './classes/FileInlineSnippet'
import HtmlPrefabSnippet from './classes/HtmlPrefabSnippet'
import JsPrefabSnippet from './classes/JsPrefabSnippet'
import JsSnippet from './classes/JsSnippet'
import Snippet from './classes/Snippet'

export const seperate = (
    staticcString: string,
    start_seperator: string,
    end_seperator: string,
    path: string,
    experimental: boolean
): {
    plainHTMLSnippets: string[]
    codeSnippets: Snippet[]
} => {
    const numberOfLines = occurrences(staticcString, /\n/) + 1
    const oc: number = occurrences(staticcString, start_seperator)
    const plainHTMLSnippets: string[] = []
    const codeSnippets: Snippet[] = []
    for (let i = 0; i < oc; i++) {
        const [firstPart, middlePart, lastPart] = cutString(staticcString, start_seperator, end_seperator)
        plainHTMLSnippets.push(firstPart)
        codeSnippets.push(classifySnippet(middlePart, path, calculateLineNumber(numberOfLines, middlePart, lastPart), experimental))
        staticcString = lastPart
    }
    plainHTMLSnippets.push(staticcString)
    return { plainHTMLSnippets, codeSnippets }
}

export const occurrences = (string: string, subString: string | RegExp): number => {
    return string.split(subString).length - 1
}

export const cutString = (input_string: string, start_seperator: string, end_seperator: string): string[] => {
    const openingIndex: number = input_string.indexOf(start_seperator)
    const closingIndex: number = input_string.indexOf(end_seperator)
    const firstPart: string = input_string.slice(0, openingIndex)
    const middlePart: string = input_string.slice(openingIndex + start_seperator.length, closingIndex)
    const lastPart: string = input_string.slice(closingIndex + end_seperator.length)
    return [firstPart, middlePart, lastPart]
}

export const classifySnippet = (snippet_string: string, path: string, lineNumber: number, experimental: boolean): Snippet => {
    if (snippet_string.indexOf('#') != -1) {
        return new JsSnippet(snippet_string.replace('#', '').trim(), lineNumber, path, experimental)
    } else if (snippet_string.indexOf('!!') != -1) {
        return new JsPrefabSnippet(snippet_string.replace('!!', '').trim(), lineNumber, path, experimental)
    } else if (snippet_string.indexOf('!') != -1) {
        return new HtmlPrefabSnippet(snippet_string.replace('!', '').trim(), lineNumber, path, experimental)
    } else if (snippet_string.indexOf('?') != -1) {
        return new FileInlineSnippet(snippet_string.replace('?', '').trim(), lineNumber, path, experimental)
    } else {
        return new DataSnippet(snippet_string.trim(), lineNumber, path, experimental)
    }
}

export const calculateLineNumber = (totalNumberOfLines: number, middlePart: string, lastPart: string): number => {
    const linesInLastPart = occurrences(lastPart, /\n/)
    const linesInMiddlePart = occurrences(middlePart, /\n/)

    return totalNumberOfLines - (linesInLastPart + Math.round(linesInMiddlePart / 2))
}
