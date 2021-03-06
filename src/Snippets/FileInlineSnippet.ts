import pathLib from 'path'
import sass from 'sass'
import Snippet from './Snippet'
import Transpiler from '../Transpiler'
import { readFileFromDisk } from '../internal_lib'

class FileInlineSnippet extends Snippet {
    fileContents: string
    fileIdentifier: string
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler) {
        super(input_string, lineNumber, path, transpiler)
        this.fileContents = ''
        this.fileIdentifier = ''
    }
    async resolve(data: any): Promise<void> {
        await this.readFile()
        let resolved = false
        SupportedFileTypes.forEach((filetype) => {
            if (this.fileIdentifier == filetype.fileIdentifier) {
                try {
                    this.result = filetype.resolve(this.fileContents)
                } catch (error) {
                    throw new Error(`Filehandler exited with ${error}`)
                }
                resolved = true
            }
        })
        if (!resolved) throw new Error(`There is no filehandler for ${this.fileIdentifier}!`)
        await this.postProcess(data)
    }
    async readFile() {
        let snippet_parts = this.input_string.split(' ')
        if (snippet_parts.length < 2) throw new Error('Not enough arguments! You need to at least give the File-Identifier and one filename!')
        snippet_parts = snippet_parts.filter((value) => value != '')
        //@ts-ignore
        this.fileIdentifier = snippet_parts.shift()
        const filepaths = snippet_parts
        await Promise.all(
            filepaths.map(async (filepath) => {
                const content = await readFileFromDisk(pathLib.join(pathLib.dirname(this.referencePath), filepath))
                this.fileContents += ' ' + content
                this.transpiler.addLoadedFile(filepath)
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
const Sass = new FileType('sass', (ctn) => `<style>${sass.renderSync({ data: ctn, indentedSyntax: true }).css.toString()}</style>`)

const SupportedFileTypes: FileType[] = [Css, Svg, Js, Sass]

export default FileInlineSnippet
