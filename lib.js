const fs = require("fs");
const sass = require("sass");
const pathLib = require("path");

const { readFileFromDisk, saveFileToDisk, fileExists } = require("./read_write_lib")

const importedFiles = [];
const importedImages = [];
let currentSnippet = "";
let surpress_logs = false

const transpile = (input_string, data, snippetPrefix = "", path = "src/") => {
  input_string = cleanComments(input_string)
  //splits text into normal html code and code snippets
  const [plainHTMLSnippets, codeSnippets] = seperateSnippets(input_string, "{{", "}}");
  //convertes code snippets to actual value
  const resolvedSnippets = resolveSnippets(codeSnippets, data, snippetPrefix, path);
  //recombines html with the resolved code snippets
  let result = resolvedSnippets.reduce((total, currentValue, currentIndex) => {
    return total + plainHTMLSnippets[currentIndex] + currentValue;
  }, "");
  result += plainHTMLSnippets[plainHTMLSnippets.length - 1];
  return result;
};

const seperateSnippets = (input_string, start_seperator, end_seperator) => {
  //count number of {{ => number of code blocks
  const oc = occurrences(input_string, start_seperator);
  const plainHTMLSnippets = [];
  const codeSnippets = [];
  //for every code block, get the plain html and the code block and add it to the lists
  for (let i = 0; i < oc; i++) {
    const [firstPart, middlePart, lastPart] = cutString(input_string, start_seperator, end_seperator);
    plainHTMLSnippets.push(firstPart);
    codeSnippets.push(middlePart);
    input_string = lastPart;
  }
  plainHTMLSnippets.push(input_string);
  return [plainHTMLSnippets, codeSnippets];
};

const occurrences = (string, subString) => {
  return string.split(subString).length - 1;
};

const cutString = (input_string, start_seperator, end_seperator) => {
  const openingIndex = input_string.indexOf(start_seperator);
  const cloringIndex = input_string.indexOf(end_seperator);
  const firstPart = input_string.slice(0, openingIndex);
  const middlePart = input_string.slice(openingIndex + 2, cloringIndex);
  const lastPart = input_string.slice(cloringIndex + 2);
  return [firstPart, middlePart, lastPart];
};

const resolveSnippets = (jsSnippets_array, data, snippetPrefix, path) => {
  return jsSnippets_array.map((snippet, index) => {
    index = index + 1
    if(!surpress_console_logs) console.log("Resolving Snippet: " + snippetPrefix + index)
    currentSnippet = snippet;
    const js = snippet.indexOf("#");
    const prefab = snippet.indexOf("!");
    const cmd = snippet.indexOf("?");

    if (js != -1) {
      const resolvedSnippet = resolveJsSnippet(snippet, data);
      return transpile(resolvedSnippet, data, snippetPrefix + index + ".");
    } else if (prefab != -1) {
      const {resolvedSnippet, prefab_path} = resolvePrefabSnippet(snippet, data);
      return transpile(resolvedSnippet, data, snippetPrefix + index + ".", prefab_path);
    } else if (cmd != -1) {
      return resolveCmdSnippet(snippet, path);
    } else {
      return resolveDataSnippet(snippet, data);
    }
  });
};

const resolveJsSnippet = (snippet_string, data) => {
  //remove spaces and the #
  snippet_string = snippet_string.trim().replace("#", "");
  //run the js code and convert string array to array
  const evaluated_snippet = eval(snippet_string);
  return noramlizeJsReturns(evaluated_snippet);
};

const resolvePrefabSnippet = (snippet_string, data) => {
  //remove spaces and first !
  snippet_string = snippet_string.trim().replace("!", "");
  //seperate the path of the snippet from the args
  snippet_string_parts = snippet_string.split(" ");
  snippet_path = snippet_string_parts.shift();
  //check if its a js or html prefab
  const prefab_path = pathLib.join("prefabs" ,  snippet_path)
  if(fileExists(pathLib.join(prefab_path, "prefab.html"))){
    //=> HTML snippet
    //read in html file from disk and return it
    importedFiles.push(pathLib.join(prefab_path, "prefab.html"));
    return {resolvedSnippet: readFileFromDisk(pathLib.join(prefab_path, "prefab.html")), prefab_path}
  }else if(fileExists(pathLib.join(prefab_path, "prefab.js"))){
    //=> JS snippet
    //read in the file
    const jsFile = readFileFromDisk(pathLib.join(prefab_path, "prefab.js"));
    //parse the js code
    eval(jsFile);
    return {resolvedSnippet: noramlizeJsReturns(
      render(...decodePrefabArgs(snippet_string_parts, data))
    ), prefab_path}
  }else{
    //ERROR with prefab
    if(!surpress_console_logs) console.log("ERROR: Could not find prefab file (Prefab: " + snippet_path + ")")
    throw new Error("ERROR: Could not find prefab file (Prefab: " + snippet_path + ")");
  }
};

const resolveCmdSnippet = (snippet_string, path) => {
  //remove spaces and ?
  snippet_string_parts = snippet_string.trim().replace("?", "").split(" ");
  const snippet_cmd = snippet_string_parts.shift();
  if(snippet_cmd === "svg"){
    return importSvg(snippet_string_parts, path);
  }else if(snippet_cmd === "css"){
    return importCss(snippet_string_parts, path);
  }else if(snippet_cmd === "sass" || snippet_cmd === "scss"){
    return importSass(snippet_string_parts, path);
  }else if(snippet_cmd === "js"){
    return importJs(snippet_string_parts, path);
  }else if(snippet_cmd === "img"){
    return importImg(snippet_string_parts, path);
  }else{
    return "";
  }
};

const resolveDataSnippet = (snippet_string, data) => {
  let value = data;
  const snippetParts = snippet_string.replace(/\s/g, "").split(".");
  for (let i = 0; i < snippetParts.length; i++) {
    value = value[snippetParts[i]];
  }
  return value;
};

const noramlizeJsReturns = (evaluated_snippet) => {
  //check if the evaluated snippet is a string which can be returned or if its an array which needs to be reduced
  if(!evaluated_snippet){
    return ""
  }else if (evaluated_snippet.constructor == String) {
    return evaluated_snippet;
  } else if (evaluated_snippet.constructor == Array) {
    return evaluated_snippet.reduce((total, current) => {
      return total + current;
    });
  } else {
    throw new Error("only strings or array of strings are allowed");
  }
};

const decodePrefabArgs = (args, data) => {
  args = args.map((arg) => {
    if (arg == "") return null;
    if (arg.charAt(0) == '"') {
      arg = arg.substring(1, arg.length - 1);
      return arg;
    } else {
      return data[arg];
    }
  });
  return args;
};

const importSvg = (args, path) => {
  let resolvedSnippet = ""
  for (let i = 0; i < args.length; i++) {
    const filepath = pathLib.join(path, args[i])
    importedFiles.push(filepath);
    resolvedSnippet += readFileFromDisk(filepath);
  }
  return resolvedSnippet; 
};

const importCss = (args, path) => {
  let stylesheet = ""
  for (let i = 0; i < args.length; i++) {
    const filepath = pathLib.join(path, args[i])
    importedFiles.push(filepath);
    stylesheet += readFileFromDisk(filepath);
  }
  return `<style>${stylesheet}</style>`;
};

const importSass = (args, path) => {
  let stylesheet = ""
  for (let i = 0; i < args.length; i++) {
    const filepath = pathLib.join(path, args[i])
    importedFiles.push(filepath);
    stylesheet += sass.renderSync({ file: filepath }).css.toString()
  }
  return `<style>${stylesheet}</style>`;
};

const importJs = (args, path) => {
  let script = ""
  for (let i = 0; i < args.length; i++) {
    const filepath = pathLib.join(path, args[i])
    importedFiles.push(filepath);
    script += readFileFromDisk(filepath);
  }
  return `<script>${script}</script>`;
};

const importImg = (args, path, onlyWebP = false) => {
  const [ filepath, alt_text, id, className ] = args;
  const imgPath = pathLib.join(path, filepath)
  importedImages.push(imgPath);
  const imagePathParts = imgPath.split(".");
  imagePathParts.pop();
  const imagepathWithoutExt = imagePathParts.join(".");
  if(onlyWebP){
    return `<picture class="${className}" id="${id}"><source srcset="${imagepathWithoutExt}.webp" type="image/webp"><img srcset="${imgPath}" alt="${alt_text}"></picture>`;
  }else{
    return `<picture class="${className}" id="${id}"><source srcset="${imagepathWithoutExt}.webp" type="image/webp"><source srcset="${imagepathWithoutExt}.jp2" type="image/jp2"><img srcset="${imgPath}" alt="${alt_text}"></picture>`;
  }
  
};

const cleanComments = (input_string) => {
  const [nonCommentSnippets] = seperateSnippets(input_string, "{#", "#}")
  const result = nonCommentSnippets.reduce((total, currentValue)=>{
    return total + currentValue
  }, "")
  return result
}

const getImportedFiles = () => {
  return [...new Set(importedFiles)];
};

const getImportedImages = () => {
  return [...new Set(importedImages)];
};

const getCurrentSnippet = () => {
  return currentSnippet;
};

const surpress_console_logs = () => {
  surpress_logs = true
};


exports.transpile = transpile;
exports.getImportedFiles = getImportedFiles;
exports.getImportedImages = getImportedImages;
exports.getCurrentSnippet = getCurrentSnippet;

exports.importSvg = importSvg;
exports.importCss = importCss;
exports.importSass = importSass;
exports.importJs = importJs;
exports.importImg = importImg;
exports.importSvg = importSvg;
exports.cleanComments = cleanComments;

exports.resolveDataSnippet = resolveDataSnippet;
exports.resolveJsSnippet = resolveJsSnippet;
exports.resolvePrefabSnippet = resolvePrefabSnippet;
exports.resolveCmdSnippet = resolveCmdSnippet;
exports.resolveSnippets = resolveSnippets;

exports.occurrences = occurrences;
exports.cutString = cutString;
exports.seperateSnippets = seperateSnippets;
exports.noramlizeJsReturns = noramlizeJsReturns;
exports.decodePrefabArgs = decodePrefabArgs;

exports.surpress_console_logs = surpress_console_logs;