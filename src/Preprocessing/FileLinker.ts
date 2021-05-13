import * as pathLib from 'path'
import { replaceAll } from '../internal_lib'

export default class FileLinker {
    string: string
    path: string
    loadedFiles: string[]
    linkedFiles: { from: string; to: string }[]
    constructor(string: string, path: string) {
        this.string = string
        this.path = path
        this.loadedFiles = []
        this.linkedFiles = []
    }
    link() {
        while (this.string.indexOf('{{*') !== -1 && this.string.indexOf('*}}') !== -1) {
            const linkedFileString = this.string.slice(this.string.indexOf('{{*') + 3, this.string.indexOf('*}}'))

            const file = linkedFileString.trim()

            const filepath = pathLib.join(pathLib.dirname(this.path), file)
            this.loadedFiles.push(filepath)
            const linkedFilepath = pathLib.join(pathLib.dirname(this.path).replace('prefabs', 'dist'), file)
            this.linkedFiles.push({
                from: filepath,
                to: linkedFilepath,
            })
            const returnPath = replaceAll('/' + linkedFilepath.replace(`dist${pathLib.normalize('/')}`, ``), pathLib.normalize('/'), '/')

            this.string = this.string.replace(`{{*${linkedFileString}*}}`, returnPath)
        }
        return this.string
    }
}
