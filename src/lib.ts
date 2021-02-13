import * as fs from 'fs'
import * as pathLib from 'path'

export const readFileFromDisk = async (filepath: string): Promise<string> => {
    //read file from disk
    const [readFileError, content] = await trycatchasync(fs.promises.readFile, filepath, { encoding: 'utf8' })
    if (readFileError) throw new Error('Could not read file: ' + filepath)
    return content
}

export const saveFileToDisk = async (filepath: string, content: string): Promise<void> => {
    //save file to disk (+ create folders if neccesary)
    const folderpath: string = pathLib.dirname(filepath)
    if (folderpath) {
        const [mkdirError] = await trycatchasync(fs.promises.mkdir, folderpath, { recursive: true })
        if (mkdirError) throw new Error('Could not create a new folder: ' + folderpath)
    }
    const [writeFileError] = await trycatchasync(fs.promises.writeFile, filepath, content)
    if (writeFileError) throw new Error('Could not write to file: ' + filepath)
}

export const replaceAll = (string: string, searchValue: string, replaceValue: string) => {
    while (string.indexOf(searchValue) !== -1) {
        string = string.replace(searchValue, replaceValue)
    }
    return string
}

async function trycatchasync(fn: Function, ...args: any): Promise<[null | Error, any]> {
    try {
        const result = await fn(...args)
        return [null, result]
    } catch (error) {
        return [error, null]
    }
}
