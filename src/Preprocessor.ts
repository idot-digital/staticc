import { occurrences } from './seperate'
import * as pathLib from 'path'
import { replaceAll } from './internal_lib'

export default class Preprocessor {
    input_string: string
    loadedFiles: string[]
    linkedFiles: { from: string; to: string }[]
    path: string
    constructor(input_string: string) {
        this.input_string = input_string
        this.loadedFiles = []
        this.linkedFiles = []
        this.path = ''
    }
    preprocess(path: string) {
        this.path = path
        this.cleanComments()
        this.extractLinkedFiles()
        return this.input_string
    }
    cleanComments(): void {
        let input_string = this.input_string
        const oc = occurrences(input_string, '/~')
        let cleanedString = ''
        for (let i = 0; i < oc; i++) {
            const [firstPart, _, lastPart] = oldCutString(input_string, '/~', '~/')
            cleanedString += firstPart
            input_string = lastPart
        }
        this.input_string = cleanedString + input_string
    }
    extractLinkedFiles() {
        while (this.input_string.indexOf('{{*') !== -1 && this.input_string.indexOf('*}}') !== -1) {
            if (this.path.indexOf('src') !== -1) return new Error('link in src')

            const linkedFileString = this.input_string.slice(this.input_string.indexOf('{{*') + 3, this.input_string.indexOf('*}}'))

            const file = linkedFileString.trim()

            const filepath = pathLib.join(pathLib.dirname(this.path), file)
            this.loadedFiles.push(filepath)
            const linkedFilepath = pathLib.join(pathLib.dirname(this.path).replace('prefabs', 'dist'), file)
            this.linkedFiles.push({
                from: filepath,
                to: linkedFilepath,
            })
            const returnPath = replaceAll('/' + linkedFilepath.replace(`dist${pathLib.normalize('/')}`, ``), pathLib.normalize('/'), '/')

            this.input_string = this.input_string.replace(`{{*${linkedFileString}*}}`, returnPath)
        }
    }
}

const oldCutString = (input_string: string, start_seperator: string, end_seperator: string): string[] => {
    const openingIndex: number = input_string.indexOf(start_seperator)
    const closingIndex: number = input_string.indexOf(end_seperator)
    const firstPart: string = input_string.slice(0, openingIndex)
    const middlePart: string = input_string.slice(openingIndex + start_seperator.length, closingIndex)
    const lastPart: string = input_string.slice(closingIndex + end_seperator.length)
    return [firstPart, middlePart, lastPart]
}
