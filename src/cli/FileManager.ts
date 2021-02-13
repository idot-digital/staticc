import { copyAllFiles, copyLinkedFiles } from './lib'

interface FileCopyObject {
    from: string
    to: string
}

export class FileManager {
    filesToIgnore: string[]
    filesToCopy: FileCopyObject[]
    constructor() {
        this.filesToIgnore = []
        this.filesToCopy = []
    }
    copyFiles(files: FileCopyObject[]) {
        this.filesToCopy = [...this.filesToCopy, ...files]
    }
    ignoreFiles(files: string[]) {
        this.filesToIgnore = [...this.filesToIgnore, ...files]
    }

    execute() {
        copyAllFiles(this.filesToIgnore)
        copyLinkedFiles(this.filesToCopy)
    }
}
