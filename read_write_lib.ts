import * as fs from 'fs'
import * as pathLib from 'path'
import trycatch from './trycatch.js';

export const readFileFromDisk = (filepath : string) : string => {
    //read file from disk
    const [readFileError, content] = trycatch(fs.readFileSync, filepath, {encoding: "utf8"})
    if(readFileError) throw new Error("Could not read file: " + filepath)
    return content;
};
  
export const saveFileToDisk = (filepath : string, content : string) : void => {
    //save file to disk (+ create folders if neccesary)
    const folderpath : string = pathLib.join(...(filepath.split("/").splice(0, filepath.split("/").length - 1)));
    
    if (folderpath){
        const [mkdirError] = trycatch(fs.mkdirSync, folderpath, { recursive: true })
        if(mkdirError) throw new Error("Could not create a new folder: " + folderpath)
    }
    const [writeFileError] = trycatch(fs.writeFileSync, filepath, content)
    if(writeFileError) throw new Error("Could not write to file: " + filepath)
};
  
export const fileExists = (filepath : string) : boolean => {
    return fs.existsSync(filepath)
}

