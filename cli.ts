#! /usr/bin/env node
import {getCurrentSnippet, getImportedFiles, getImportedImages, transpile} from './lib.js'
import { readFileFromDisk, saveFileToDisk } from './read_write_lib.js';
import {minify} from 'html-minifier';
import glob from 'glob';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import lite_server  from 'lite-server';
import trycatch from './trycatch.js'
import { execSync } from 'child_process';
import { spawn } from 'cross-spawn';

const args = process.argv.slice(2);

const help : boolean =
  args.indexOf("--help") >= 0 ||
  args.indexOf("-h") >= 0 ||
  args.indexOf("help") >= 0;
const version : boolean =
  args.indexOf("version") >= 0 ||
  args.indexOf("v") >= 0 ||
  args.indexOf("-v") >= 0;
const build_dev : boolean = args.indexOf("build-dev") >= 0;
const build_prod : boolean = args.indexOf("build") >= 0;
const serve : boolean = args.indexOf("serve") >= 0;
const init : boolean = args.indexOf("init") >= 0;
const data_json_override : boolean = args.indexOf("-data") >= 0 || args.indexOf("-d") >= 0;

let data_json_path = "data.json"

if(data_json_override){
  const index = (args.indexOf("-d") !== -1 ? args.indexOf("-d") : args.indexOf("-data"))
  data_json_path = args[index+1]
}

if (version) {
  const package_info = require("./package.json");
  console.log(package_info.version);
} else if (help) {
  console.log("");
  console.log("Usage: staticc <command>");
  console.log("");
  console.log("where: <command> is one of:");
  console.log("v\t\t alias for version");
  console.log("version\t\t shows the version of the staticc-cli");
  console.log("build\t\t creates a production build of all html files");
  console.log("build-dev\t creates a development build of all html files");
  console.log("serve\t\t starts a development webserver");
  console.log("init\t\t initializes a new staticc project");
  console.log("");
  console.log(
    "Visit https://github.com/luiskugel/staticc to learn more about staticc."
  );
} else if (build_dev || build_prod) {
  build(build_prod)
} else if (serve) {
  startServer();
} else if (init) {
  console.log("");
  console.log("Initializing staticc project!");
  console.log("");
  const example_project = require("./example_project.json");
  Object.keys(example_project).forEach((filepath) => {
    saveFileToDisk(filepath, example_project[filepath]);
  });
  const [yarnNotInstalled] = trycatch(execSync, "yarn -v")
  let error, child;
   if(yarnNotInstalled){
     [error, child] = trycatch(spawn, "npm", ["install"])
   }else{
    
     [error, child] = trycatch(spawn, "yarn", ["install"])
   }
  if(error) console.error("Could not install babel and its packages.")
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk : any) => {
    console.log(chunk)
  });
  child.on('close', ()=>{
    console.log("Finished!");
  })
  
  
} else {
  console.log("Use -h or --help for help!");
}

function startServer() {
  process.title = 'lite-server';
  //@ts-ignore
  process.argv = ['','', '-c', path.join(require.main.path, 'bs-config.json')
  ]
  lite_server.server()
  console.log("Staticc server listening on http://localhost:8888/");
  
  let timeoutHandler : NodeJS.Timeout;
  chokidar.watch('./', { ignored: /dist/}).on('all', (event, path) => {
    clearTimeout(timeoutHandler);
    timeoutHandler = setTimeout(()=>{
      //reload server
      build(false);
    },100)
  });


}

function build(build_prod : boolean){
  const data = JSON.parse(readFileFromDisk(data_json_path));
  console.log("");
  console.log("starting build!");
  const HTMLfiles = glob.sync("src/**/*.html");
  HTMLfiles.forEach((file) => {
    transpileFile(file, data, build_prod)
  });

  copyAllFiles([...getImportedFiles(), ...HTMLfiles]);
  convertAllImages(getImportedImages())
    .then(() => {
      console.log("finished build!");
    })
    .catch((err) => console.log(err));
}

function transpileFile(file : string, data : any, build_prod : boolean){
  console.log("Building: " + file);
  const successful = generateNewFile(file, changeFilenameFromSrcToDist(file), (content : string, build_prod : boolean) : string => {
    let [transpilingError, transpiledCode] = trycatch(transpile, content, data);
    if(transpilingError){
      throw new Error("Could not transpile snippet: " + getCurrentSnippet() + "There was the following error:" + transpilingError)
    }else{
      if (build_prod) transpiledCode = minifyHTML(transpiledCode);
    }
    return transpiledCode;
  }, build_prod)

  if(!successful){
    console.log(file + " could not be transpiled!")
  }


  // const [readFileError, inputFile] = trycatch(readFileFromDisk(file));
  // let [transpilingError, transpiledCode] = trycatch(transpile, inputFile, data);
  // if(transpilingError){
  //   console.log("Error compiling Code snippet: " + getCurrentSnippet())
  // }else if(readFileError){
  //   console.log("Error: Could not read: " + file)
  // }
  
  // saveFileToDisk(changeFilenameFromSrcToDist(file), transpiledCode);
}

function generateNewFile(readFileName : string, writeFileName : string, fn : Function, ...args : any[]){
  const [readFileError, readFileContent] = trycatch(readFileFromDisk, readFileName);
  let writeFileContent : string;
  if(readFileError){
    //error reading file
    writeFileContent = readFileError.message
  }else{
    //file read correctly
    writeFileContent = fn(readFileContent, ...args)
  }
  const [writeFileError] = trycatch(saveFileToDisk, writeFileName, writeFileContent)
  if(writeFileError){
    //file could not be saved
    throw writeFileError;
  }else{
    //file saved successfully
    return true;
  }
}




function minifyHTML(html_String : string) {
  return minify(html_String, {
    removeComments: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
  });
}

function copyAllFiles(filter : string[]) {
  const allfiles = glob.sync("src/**/*.*");
  allfiles.forEach((file) => {
    if (filter.includes(file)) return;
    const newFilepath = changeFilenameFromSrcToDist(file);
    const folderpath = newFilepath
      .split("/")
      .splice(0, newFilepath.split("/").length - 1)
      .join("/");
    if (folderpath) fs.mkdirSync(folderpath, { recursive: true });
    fs.copyFileSync(file, newFilepath);
  });
}

function changeFilenameFromSrcToDist(file : string) {
  return "dist" + file.substring(3);
}

async function convertAllImages(filepaths : string[]) {
  await imagemin(filepaths, {
    destination: "dist/",
    plugins: [imageminWebp({ quality: 50 })],
  });
  console.log("Images optimized");
}