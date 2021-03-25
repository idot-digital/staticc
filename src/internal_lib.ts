import * as fs from 'fs'
export const readFileFromDisk = async (filepath: string): Promise<string> => {
    //read file from disk
    const [readFileError, content] = await trycatchasync(fs.promises.readFile, filepath, { encoding: 'utf8' })
    if (readFileError) throw new Error('Could not read file: ' + filepath)
    return content
}
export async function trycatchasync(fn: Function, ...args: any): Promise<[null | Error, any]> {
    try {
        const result = await fn(...args)
        return [null, result]
    } catch (error) {
        return [error, null]
    }
}
export const replaceAll = (string: string, searchValue: string, replaceValue: string) => {
    while (string.indexOf(searchValue) !== -1) {
        string = string.replace(searchValue, replaceValue)
    }
    return string
}
