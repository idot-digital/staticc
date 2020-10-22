const fs = require("fs");
const pathLib = require("path");

const readFileFromDisk = (filepath) => {
    //read file from disk
    return fs.readFileSync(filepath, {
        encoding: "utf8",
    });
};
  
const saveFileToDisk = (filepath, content) => {
    //save file to disk (+ create folders if neccesary)
    const folderpath = pathLib.join(...(filepath.split("/").splice(0, filepath.split("/").length - 1)));
    if (folderpath) fs.mkdirSync(folderpath, { recursive: true });
    fs.writeFileSync(filepath, content);
};
  
const fileExists = (filepath) => {
    return fs.existsSync(filepath)
}

exports.readFileFromDisk = readFileFromDisk;
exports.saveFileToDisk = saveFileToDisk;
exports.fileExists = fileExists;