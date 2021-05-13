import Transpiler from '../Transpiler'
import cleanComments from './cleanComments'
import FileLinker from './FileLinker'

export default class Preprocessor {
    input_string: string
    path: string
    fileLinker: FileLinker | null
    transpiler: Transpiler
    constructor(input_string: string, transpiler: Transpiler) {
        this.input_string = input_string
        this.fileLinker = null
        this.path = ''
        this.transpiler = transpiler
    }
    preprocess(path: string) {
        this.path = path
        this.input_string = cleanComments(this.input_string)
        this.fileLinker = new FileLinker(this.input_string, this.path)
        this.input_string = this.fileLinker.link()

        this.fileLinker.loadedFiles.forEach((loadedFile) => (loadedFile ? this.transpiler.addLoadedFile(loadedFile) : ''))
        this.fileLinker.linkedFiles.forEach(({ from, to }) => this.transpiler.addLinkedFile(from, to))

        return this.input_string
    }
}
