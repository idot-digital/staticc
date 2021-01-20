import Snippet from './Snippet'
import sass from 'node-sass'
import pathLib from 'path'
import { readFileFromDisk } from '../read_write'

class FileInlineSnippet extends Snippet {
    fileContents: string
    fileIdentifier: string
    referencePath: string
    constructor(input_string: string, path: string) {
        super(input_string)
        this.fileContents = ''
        this.fileIdentifier = ''
        this.referencePath = path
    }
    async resolve(data: any): Promise<void> {
        await this.readFile()
        SupportedFileTypes.forEach((filetype) => {
            if (this.fileIdentifier == filetype.fileIdentifier) {
                this.result = filetype.resolve(this.fileContents)
            }
        })
        await this.postProcess(data)
    }
    async readFile() {
        let snippet_parts = this.input_string.split(' ')
        if (snippet_parts.length < 2) throw new Error('Not enough arguments! You need to at least give the File-Identifier and one filename!')
        snippet_parts = snippet_parts.filter((value) => value != '')
        //@ts-ignore
        this.fileIdentifier = snippet_parts.shift()
        this.filepaths = snippet_parts
        await Promise.all(
            this.filepaths.map(async (filepath) => {
                this.fileContents += ' ' + (await readFileFromDisk(pathLib.join(this.referencePath, filepath)))
               
            })
        )
    }
}

class FileType {
    fileIdentifier: string
    resolverFunction: (fileContent: string) => string
    constructor(fileIdentifier: string, resolverFunc: (fileContent: string) => string) {
        this.fileIdentifier = fileIdentifier
        this.resolverFunction = resolverFunc
    }
    resolve(fileContent: string) {
        return this.resolverFunction(fileContent)
    }
}

const Css = new FileType('css', (ctn) => `<style>${ctn}</style>`)
const Svg = new FileType('svg', (ctn) => ctn)
const Js = new FileType('js', (ctn) => `<script>${ctn}</script>`)
const Sass = new FileType('sass', (ctn) => `<style>${sass.renderSync({ data: ctn }).css.toString()}</style>`)

const SupportedFileTypes: FileType[] = [Css, Svg, Js, Sass]

export default FileInlineSnippet
