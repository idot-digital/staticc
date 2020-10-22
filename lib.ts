import * as sass from 'sass';
import * as pathLib from 'path'
import { fileExists, readFileFromDisk } from './read_write_lib.js';
import trycatch from './trycatch.js';


const importedFiles : string[] = [];
const importedImages : string[] = [];
let currentSnippet = "";
let surpress_logs = false

export const transpile = (input_string : string, data : any, snippetPrefix : string = "", path : string = "src/") =>{
  return _transpile(input_string, data, snippetPrefix, path)
}

export const _transpile = (input_string : string, data : any, snippetPrefix : string = "", path : string = "src/") : string => {
  input_string = cleanComments(input_string)
  //splits text into normal html code and code snippets
  const [plainHTMLSnippets, codeSnippets] = seperateSnippets(input_string, "{{", "}}");
  //convertes code snippets to actual value
  const [resolvingError, resolvedSnippets] = trycatch(resolveSnippets, codeSnippets, data, snippetPrefix, path)
  if(resolvingError) console.log(resolvingError)
  //const resolvedSnippets = resolveSnippets(codeSnippets, data, snippetPrefix, path);
  //recombines html with the resolved code snippets
  let result = resolvedSnippets.reduce((total : string, currentValue : string, currentIndex : number) => {
    return total + plainHTMLSnippets[currentIndex] + currentValue;
  }, "");
  result += plainHTMLSnippets[plainHTMLSnippets.length - 1];
  return result;
};

export const seperateSnippets = (input_string : string, start_seperator : string, end_seperator : string) : string[][] => {
  //count number of {{ => number of code blocks
  const oc : number = occurrences(input_string, start_seperator);
  const plainHTMLSnippets : string[] = [];
  const codeSnippets : string[] = [];
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

export const occurrences = (string : string, subString : string) : number => {
  return string.split(subString).length - 1;
};

export const cutString = (input_string : string, start_seperator : string, end_seperator : string) : string[] => {
  const openingIndex : number = input_string.indexOf(start_seperator);
  const cloringIndex : number = input_string.indexOf(end_seperator);
  const firstPart : string = input_string.slice(0, openingIndex);
  const middlePart : string = input_string.slice(openingIndex + 2, cloringIndex);
  const lastPart : string = input_string.slice(cloringIndex + 2);
  return [firstPart, middlePart, lastPart];
};

export const resolveSnippets = (jsSnippets_array : string[], data : any, snippetPrefix : string, path : string) : string[] => {
  return jsSnippets_array.map((snippet : string, index : number) => {
    index = index + 1
    if(!surpress_logs) console.log("Resolving Snippet: " + snippetPrefix + index)
    currentSnippet = snippet;
    const js : number = snippet.indexOf("#");
    const prefab : number = snippet.indexOf("!");
    const cmd : number = snippet.indexOf("?");

    if (js != -1) {
      const resolvedSnippet = resolveJsSnippet(snippet, data);
      return _transpile(resolvedSnippet, data, snippetPrefix + index + ".");
    } else if (prefab != -1) {
      const {resolvedSnippet, prefab_path} = resolvePrefabSnippet(snippet, data);
      return _transpile(resolvedSnippet, data, snippetPrefix + index + ".", prefab_path);
    } else if (cmd != -1) {
      return resolveCmdSnippet(snippet, path);
    } else {
      return resolveDataSnippet(snippet, data);
    }
  });
};

export const resolveJsSnippet = (snippet_string : string, data : any) : string => {
  //remove spaces and the #
  snippet_string = snippet_string.trim().replace("#", "");
  //run the js code and convert string array to array
  try {
    const evaluated_snippet  = eval(snippet_string)
    return noramlizeJsReturns(evaluated_snippet);
  } catch (executionError) {
    throw new Error("Could not execute js-snippet! Javascript-Error: " + executionError)
  }
};

export const resolvePrefabSnippet = (snippet_string : string, data : any) : {resolvedSnippet: string, prefab_path: string} => {
  //remove spaces and first !
  snippet_string = snippet_string.trim().replace("!", "");
  //seperate the path of the snippet from the args
  let snippet_string_parts : string[] = snippet_string.split(" ");
  let snippet_path : (undefined|string) = snippet_string_parts.shift();
  if(!snippet_path) throw new Error("You need to provide a path to the snippet!");
  //check if its a js or html prefab
  const prefab_path : string = pathLib.join("prefabs" ,  snippet_path)
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
    
    // eval(jsFile);

    // const args = decodePrefabArgs(snippet_string_parts, data)
    // //@ts-ignore
    // const resolvedSnippet = render(...args)
    // const noramlizedSnippet = noramlizeJsReturns(resolvedSnippet)
    return {resolvedSnippet: "", prefab_path}
  }else{
    //ERROR with prefab => No prefab file found
    throw new Error("ERROR: Could not find prefab file (Prefab: " + snippet_path + ")");
  }
};

export const resolveCmdSnippet = (snippet_string : string, path : string) : string => {
  //remove spaces and ?
  let snippet_string_parts : string[] = snippet_string.trim().replace("?", "").split(" ");
  const snippet_cmd : (undefined|string) = snippet_string_parts.shift();
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
    throw new Error("Could not resolve file-snippet! The given filetype is not supported!")
  }
};

export const resolveDataSnippet = (snippet_string : string, data : any) : string => {
  let value = data;
  const snippetParts : string[] = snippet_string.replace(/\s/g, "").split(".");
  try {
    for (let i = 0; i < snippetParts.length; i++) {
      value = value[snippetParts[i]];
      if(!value) throw new Error()
    }
  } catch (error) {
    throw Error("Could not resolve data-snippet. The requested value is undefined!")
  }
  return value;
};

export const noramlizeJsReturns = (evaluated_snippet : any) : string => {
  //check if the evaluated snippet is a string which can be returned or if its an array which needs to be reduced
  if(!evaluated_snippet){
    return ""
  }else if (evaluated_snippet.constructor === String) {
    return evaluated_snippet as string;
  } else if (evaluated_snippet.constructor === Array) {
    return evaluated_snippet.reduce((total, current) => {
      return total + current;
    });
  } else {
    throw new Error("Prefab could not be resolved! Only strings or array of strings are allowed as return values!");
  }
};

export const decodePrefabArgs = (args : string[], data : any) : string[] => {
  args = args.map((arg : string) => {
    if (arg == "") return "";
    if (arg.charAt(0) == '"') {
      arg = arg.substring(1, arg.length - 1);
      return arg;
    } else {
      if(!data[arg]) throw new Error("Argument of the Prefab could not be resolved! Check if it is defined in the data-object!")
      return data[arg] as string;
    }
  });
  return args;
};

export const importSvg = (args : string[], path : string) : string => {
  let resolvedSnippet : string = ""
  for (let i = 0; i < args.length; i++) {
    const filepath : string = pathLib.join(path, args[i])
    importedFiles.push(filepath);
    resolvedSnippet += readFileFromDisk(filepath);
  }
  return resolvedSnippet; 
};

export const importCss = (args : string[], path : string) : string => {
  let stylesheet : string = ""
  for (let i = 0; i < args.length; i++) {
    const filepath : string = pathLib.join(path, args[i])
    importedFiles.push(filepath);
    stylesheet += readFileFromDisk(filepath);
  }
  return `<style>${stylesheet}</style>`;
};

export const importSass = (args : string[], path : string) : string => {
  let stylesheet : string = ""
  for (let i = 0; i < args.length; i++) {
    const filepath : string = pathLib.join(path, args[i])
    importedFiles.push(filepath);
    stylesheet += sass.renderSync({ file: filepath }).css.toString()
  }
  return `<style>${stylesheet}</style>`;
};

export const importJs = (args : string[], path : string) : string => {
  let script : string = ""
  for (let i = 0; i < args.length; i++) {
    const filepath : string = pathLib.join(path, args[i])
    importedFiles.push(filepath);
    script += readFileFromDisk(filepath);
  }
  return `<script>${script}</script>`;
};

export const importImg = (args : string[], path : string, onlyWebP : boolean = false) : string => {
  const [ filepath, alt_text, id, className ] = args;
  const imgPath : string = pathLib.join(path, filepath)
  importedImages.push(imgPath);
  const imagePathParts : string[] = imgPath.split(".");
  imagePathParts.pop();
  const imagepathWithoutExt : string = imagePathParts.join(".");
  if(onlyWebP){
    return `<picture class="${className}" id="${id}"><source srcset="${imagepathWithoutExt}.webp" type="image/webp"><img srcset="${imgPath}" alt="${alt_text}"></picture>`;
  }else{
    return `<picture class="${className}" id="${id}"><source srcset="${imagepathWithoutExt}.webp" type="image/webp"><source srcset="${imagepathWithoutExt}.jp2" type="image/jp2"><img srcset="${imgPath}" alt="${alt_text}"></picture>`;
  }
  
};

export const cleanComments = (input_string : string) : string => {
  const [nonCommentSnippets] = seperateSnippets(input_string, "{#", "#}")
  const result : string = nonCommentSnippets.reduce((total : string, currentValue : string)=>{
    return total + currentValue
  }, "")
  return result
}

export const getImportedFiles = () : string[] => {
  //@ts-ignore
  return [...new Set(importedFiles)];
};

export const getImportedImages = () : string[] => {
  //@ts-ignore
  return [...new Set(importedImages)];
};

export const getCurrentSnippet = () : string => {
  return currentSnippet;
};

export const surpress_console_logs = () : void => {
  surpress_logs = true
};


// exports.transpile = transpile;
// exports.getImportedFiles = getImportedFiles;
// exports.getImportedImages = getImportedImages;
// exports.getCurrentSnippet = getCurrentSnippet;

// exports.importSvg = importSvg;
// exports.importCss = importCss;
// exports.importSass = importSass;
// exports.importJs = importJs;
// exports.importImg = importImg;
// exports.importSvg = importSvg;
// exports.cleanComments = cleanComments;

// exports.resolveDataSnippet = resolveDataSnippet;
// exports.resolveJsSnippet = resolveJsSnippet;
// exports.resolvePrefabSnippet = resolvePrefabSnippet;
// exports.resolveCmdSnippet = resolveCmdSnippet;
// exports.resolveSnippets = resolveSnippets;

// exports.occurrences = occurrences;
// exports.cutString = cutString;
// exports.seperateSnippets = seperateSnippets;
// exports.noramlizeJsReturns = noramlizeJsReturns;
// exports.decodePrefabArgs = decodePrefabArgs;

// exports.surpress_console_logs = surpress_console_logs;