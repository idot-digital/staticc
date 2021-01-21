import { cutString, occurrences } from './seperate'
import * as pathLib from 'path'

export const preprocess = (input_string: string, path: string): { preprocessedString: string; filesToCopyFromThisFile: { from: string; to: string }[] } => {
    //cleanComments
    input_string = cleanComments(input_string)
    const { preprocessedString, filesToCopy } = getLinkedFiles(input_string, path)
    return { preprocessedString: preprocessedString, filesToCopyFromThisFile: filesToCopy }
}

const cleanComments = (inputString: string) => {
    const oc = occurrences(inputString, '{{$')
    let cleanedString = ''
    for (let i = 0; i < oc; i++) {
        const [firstPart, _, lastPart] = cutString(inputString, '{{$', '$}}')
        cleanedString += firstPart
        inputString = lastPart
    }
    return cleanedString + inputString
}

const getLinkedFiles = (inputString: string, path: string): { preprocessedString: string; filesToCopy: { from: string; to: string }[] } => {
    if (inputString.indexOf('{{*') === -1 || inputString.indexOf('*}}') === -1) return { preprocessedString: inputString, filesToCopy: [] }

    const linkedFileString = inputString.slice(inputString.indexOf('{{*') + 3, inputString.indexOf('*}}'))
    const preprocessedString = inputString.replace(`{{*${linkedFileString}*}}`, ``)
    const files = linkedFileString.trim().split(' ')

    const fileObjects = files.map((file) => {
        return {
            from: pathLib.join(pathLib.dirname(path), file),
            to: pathLib.join(pathLib.dirname(path).replace('prefabs', 'dist'), file),
        }
    })

    return { preprocessedString, filesToCopy: fileObjects }
}
