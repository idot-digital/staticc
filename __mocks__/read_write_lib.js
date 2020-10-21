const mod = jest.createMockFromModule('./read_write_lib');
let mockfiles = []

const readFileFromDisk = (filepath) => {
    return mockfiles[filepath];
};
  
const saveFileToDisk = (filepath, content) => {
    return;
};
  
const fileExists = (filepath) => {
    return mockfiles[filepath] != null
}

const __setMockFiles = (new_mockfiles) => {
    mockfiles = new_mockfiles;
}

mod.readFileFromDisk = readFileFromDisk
mod.saveFileToDisk = saveFileToDisk
mod.fileExists = fileExists
mod.__setMockFiles = __setMockFiles

module.exports = mod