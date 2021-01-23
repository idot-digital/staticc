import { cutString, occurrences } from './seperate'
import * as pathLib from 'path'

class Preprocessor {
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
        const oc = occurrences(input_string, '{{$')
        let cleanedString = ''
        for (let i = 0; i < oc; i++) {
            const [firstPart, _, lastPart] = cutString(input_string, '{{$', '$}}')
            cleanedString += firstPart
            input_string = lastPart
        }
        this.input_string = cleanedString + input_string
    }
    extractLinkedFiles() {
        if (this.input_string.indexOf('{{*') === -1 || this.input_string.indexOf('*}}') === -1) return []
        if(this.path.indexOf("src") !== -1) throw new Error("link in src")

        const linkedFileString = this.input_string.slice(this.input_string.indexOf('{{*') + 3, this.input_string.indexOf('*}}'))
        this.input_string = this.input_string.replace(`{{*${linkedFileString}*}}`, ``)
        if(this.input_string.indexOf('{{*') === -1) throw new Error("multi-links")

        const files = linkedFileString.trim().split(/\s+/)

        this.linkedFiles = files.map((file) => {
            const filepath = pathLib.join(pathLib.dirname(this.path), file)
            this.loadedFiles.push(filepath)
            return {
                from: filepath,
                to: pathLib.join(pathLib.dirname(this.path).replace('prefabs', 'dist'), file),
            }
        })
    }
}

export default Preprocessor
