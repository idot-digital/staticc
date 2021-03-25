const mod = jest.createMockFromModule('./lib');
let mockfiles = {};
const readFileFromDisk = (filepath) => {
    return mockfiles[filepath];
};
const saveFileToDisk = (filepath, content) => {
    return;
};
const __setMockFiles = (new_mockfiles) => {
    mockfiles = new_mockfiles;
};
const replaceAll = (string, searchValue, replaceValue) => {
    while (string.indexOf(searchValue) !== -1) {
        string = string.replace(searchValue, replaceValue);
    }
    return string;
};
mod.replaceAll = replaceAll;
mod.readFileFromDisk = readFileFromDisk;
mod.saveFileToDisk = saveFileToDisk;
mod.__setMockFiles = __setMockFiles;
module.exports = mod;
