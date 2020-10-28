const mod = jest.createMockFromModule('./read_write')
let mockfiles = []

const readFileFromDisk = (filepath) => {
    return mockfiles[filepath]
}

const saveFileToDisk = (filepath, content) => {
    return
}

const __setMockFiles = (new_mockfiles) => {
    mockfiles = new_mockfiles
}

mod.readFileFromDisk = readFileFromDisk
mod.saveFileToDisk = saveFileToDisk
mod.__setMockFiles = __setMockFiles

module.exports = mod
