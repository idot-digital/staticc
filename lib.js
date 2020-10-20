const fs = require("fs");
const sass = require("sass");
const pathLib = require("path");

const importedFiles = [];
const importedImages = [];
let currentSnippet = "";

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
    console.log("Resolving Snippet: " + snippetPrefix + index)
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
    console.log("ERROR: Could not find prefab file (Prefab: " + snippet_path + ")")
    return ""
  }
};

const resolveCmdSnippet = (snippet_string, path) => {
  //remove spaces and ?
  snippet_string_parts = snippet_string.trim().replace("?", "").split(" ");
  const snippet_cmd = snippet_string_parts.shift();
  let resolvedString = "";
  for (let i = 0; i < snippet_string_parts.length; i++) {
    const filepath = pathLib.join(path, snippet_string_parts[i])
    if(snippet_cmd === "svg"){
      resolvedString += importSvg(filepath);
    }else if(snippet_cmd === "css"){
      resolvedString += importCss(filepath);
    }else if(snippet_cmd === "sass"){
      resolvedString += importSass(filepath);
    }else if(snippet_cmd === "js"){
      resolvedString += importJs(filepath);
    }else if(snippet_cmd === "img"){
      resolvedString += importImg(filepath);
    }
  }
  return resolvedString;
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

const importSvg = (svgPath) => {
  importedFiles.push(svgPath);
  return readFileFromDisk(svgPath);
};

const importCss = (cssPath) => {
  importedFiles.push(cssPath);
  const styleSheet = readFileFromDisk(cssPath);
  return `<style>${styleSheet}</style>`;
};

const importSass = (sassPath) => {
  importedFiles.push(sassPath);
  var styleSheet = sass.renderSync({ file: sassPath }).css.toString();
  return `<style>${styleSheet}</style>`;
};

const importJs = (jsPath) => {
  importedFiles.push(jsPath);
  const jsCode = readFileFromDisk(jsPath);
  return `<script>${jsCode}</script>`;
};

const importImg = (imgPath) => {
  importedImages.push(imgPath);
  const imagePathParts = imgPath.split(".");
  imagePathParts.pop();
  const imagepathWithoutExt = imagePathParts.join(".");
  return `
<picture>
  <source srcset='${imagepathWithoutExt}.webp' type='image/webp'>
  <img srcset='${imgPath}' alt='ein bild'>
</picture>`;
};

const cleanComments = (input_string) => {
  const [nonCommentSnippets] = seperateSnippets(input_string, "{#", "#}")
  const result = nonCommentSnippets.reduce((total, currentValue)=>{
    return total + currentValue
  }, "")
  return result
}

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

const getImportedFiles = () => {
  return importedFiles;
};

const getImportedImages = () => {
  return importedImages;
};

const getCurrentSnippet = () => {
  return currentSnippet;
};


exports.saveFileToDisk = saveFileToDisk;
exports.readFileFromDisk = readFileFromDisk;
exports.transpile = transpile;
exports.getImportedFiles = getImportedFiles;
exports.getImportedImages = getImportedImages;
exports.getCurrentSnippet = getCurrentSnippet;