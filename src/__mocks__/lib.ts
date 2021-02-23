const mod: any = jest.createMockFromModule('./lib')
let mockfiles: any = {}

const readFileFromDisk = (filepath: string): string => {
    return mockfiles[filepath]
}

const saveFileToDisk = (filepath: string, content: string) => {
    return
}

const __setMockFiles = (new_mockfiles: any) => {
    mockfiles = new_mockfiles
}

async function trycatchasync(fn: any, ...args: any) {
    try {
        const result = await fn(...args)
        return [null, result]
    } catch (error) {
        return [error, null]
    }
}

const replaceAll = (string: string, searchValue: string, replaceValue: string) => {
    while (string.indexOf(searchValue) !== -1) {
        string = string.replace(searchValue, replaceValue)
    }
    return string
}

mod.replaceAll = replaceAll
mod.trycatchasync = trycatchasync
mod.readFileFromDisk = readFileFromDisk
mod.saveFileToDisk = saveFileToDisk
mod.__setMockFiles = __setMockFiles

module.exports = mod
