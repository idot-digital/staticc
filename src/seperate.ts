import { DataSnippet } from './Snippets/DataSnippet'
import FileInlineSnippet from './Snippets/FileInlineSnippet'
import HtmlPrefabSnippet from './Snippets/HtmlPrefabSnippet'
import JsPrefabSnippet from './Snippets/JsPrefabSnippet'
import JsSnippet from './Snippets/JsSnippet'
import Snippet from './Snippets/Snippet'
import Transpiler from './Transpiler'

export const seperate = (
    staticcString: string,
    start_seperator: string,
    end_seperator: string,
    path: string,
    transpiler: Transpiler
): {
    plainHTMLSnippets: string[]
    codeSnippets: Snippet[]
} => {
    const numberOfLines = occurrences(staticcString, /\n/) + 1
    const plainHTMLSnippets: string[] = []
    const codeSnippets: Snippet[] = []
    let finished = false
    while (!finished && occurrences(staticcString, start_seperator) !== 0) {
        const [firstPart, middlePart, lastPart, end] = cutString(staticcString, start_seperator, end_seperator)
        finished = end === 'true'
        if (!finished) {
            plainHTMLSnippets.push(firstPart)
            codeSnippets.push(classifySnippet(middlePart, path, calculateLineNumber(numberOfLines, middlePart, lastPart), transpiler))
        }
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
    let currentClosingIndex: number = input_string.indexOf(end_seperator)
    let currentOpeningIndex: number = input_string.indexOf(start_seperator, openingIndex + 1)
    while (currentClosingIndex !== -1 && currentOpeningIndex !== -1 && currentOpeningIndex < currentClosingIndex) {
        currentClosingIndex = input_string.indexOf(end_seperator, currentClosingIndex + 1)
        currentOpeningIndex = input_string.indexOf(start_seperator, currentOpeningIndex + 1)
    }
    const closingIndex = currentClosingIndex
    const end: string = openingIndex === -1 ? 'true' : 'false'
    const firstPart: string = input_string.slice(0, end === 'true' ? 0 : openingIndex)
    const middlePart: string = input_string.slice(end === 'true' ? 0 : openingIndex + start_seperator.length, end === 'true' ? 0 : closingIndex)
    const lastPart: string = input_string.slice(end === 'true' ? 0 : closingIndex + end_seperator.length)
    return [firstPart, middlePart, lastPart, end]
}

export const classifySnippet = (snippet_string: string, path: string, lineNumber: number, transpiler: Transpiler): Snippet => {
    if (snippet_string.indexOf('#') != -1) {
        return new JsSnippet(snippet_string.replace('#', '').trim(), lineNumber, path, transpiler)
    } else if (snippet_string.indexOf('!!') != -1) {
        return new JsPrefabSnippet(snippet_string.replace('!!', '').trim(), lineNumber, path, transpiler)
    } else if (snippet_string.indexOf('!') != -1) {
        return new HtmlPrefabSnippet(snippet_string.replace('!', '').trim(), lineNumber, path, transpiler)
    } else if (snippet_string.indexOf('?') != -1) {
        return new FileInlineSnippet(snippet_string.replace('?', '').trim(), lineNumber, path, transpiler)
    } else {
        return new DataSnippet(snippet_string.trim(), lineNumber, path, transpiler)
    }
}

export const calculateLineNumber = (totalNumberOfLines: number, middlePart: string, lastPart: string): number => {
    const linesInLastPart = occurrences(lastPart, /\n/)
    const linesInMiddlePart = occurrences(middlePart, /\n/)

    return totalNumberOfLines - (linesInLastPart + Math.round(linesInMiddlePart / 2))
}
