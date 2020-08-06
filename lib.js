const fs = require("fs");

const transpile = (input_string, data) => {
	const [plainHTMLSnippets, jsSnippets] = seperateSnippets(input_string)
	const resolvedSnippets = resolveSnippets(jsSnippets, data)
	let result = resolvedSnippets.reduce((total, currentValue, currentIndex)=>{
		return total + plainHTMLSnippets[currentIndex] + currentValue
	}, "")
	result += plainHTMLSnippets[plainHTMLSnippets.length-1]
  return result
}

const resolveSnippets = (jsSnippets_array, data) => {
	return jsSnippets_array.map(snippet => {
		const js = snippet.indexOf("#")
		const prefab = snippet.indexOf("!")
		
		if(js != -1){
			return resolveJsSnippet(snippet, data)
		}else if(prefab != -1){
			return resolvePrefabSnippet(snippet, data)
		}else{
			return resolveDataSnippet(snippet, data)
		}
	})
}

const resolveDataSnippet = (snippet_string, data) => {
	return data[snippet_string.replace(/\s/g,'')]
}

const resolveJsSnippet = (snippet_string, data) => {
	snippet_string = snippet_string.trim().replace('#','');
	//is string or array of strings
	const evaluated_snippet = eval(snippet_string)
	return noramlizeJsReturns(evaluated_snippet)
}

const resolvePrefabSnippet = (snippet_string, data) => {
	snippet_string = snippet_string.trim().replace('!','');
	if(snippet_string.indexOf("!") != -1){
		//JS snippet
		snippet_string_parts = snippet_string.replace('!','').split(" ");
		snippet_path = snippet_string_parts.shift()
		const jsFile = readFileFromDisk("prefabs/" +  snippet_path + ".js");
		const evalResult = eval(jsFile)
		return noramlizeJsReturns(render(...decodePrefabArgs(snippet_string_parts, data)))
	}else{
		//HTML snippet
		return readFileFromDisk("prefabs/" +  snippet_string + ".html");
	}
}

const seperateSnippets = (input_string) => {
  const oc = occurrences(input_string, "{{");
  const plainHTMLSnippets = [];
  const jsSnippets = [];
  for (let i = 0; i < oc; i++) {
    const [firstPart, middlePart, lastPart] = cutString(input_string);
    input_string = lastPart;
    plainHTMLSnippets.push(firstPart);
    jsSnippets.push(middlePart);
	}
	plainHTMLSnippets.push(input_string);
	return [plainHTMLSnippets, jsSnippets]
}

const cutString = (input_string) => {
  const openingIndex = input_string.indexOf("{{");
  const cloringIndex = input_string.indexOf("}}");
  const firstPart = input_string.slice(0, openingIndex);
  const middlePart = input_string.slice(openingIndex + 2, cloringIndex);
	const lastPart = input_string.slice(cloringIndex + 2);
  return [firstPart, middlePart, lastPart];
}

const occurrences = (string, subString) => {
  return string.split(subString).length - 1;
}

const noramlizeJsReturns = (evaluated_snippet) => {
	if(evaluated_snippet.constructor == String){
		return evaluated_snippet
	}else if(evaluated_snippet.constructor == Array){
		return evaluated_snippet.reduce((total, current)=>{
			return total + current
		})
	}else{
		throw new Error("only strings or array of strings are allowed")
	}
}

const decodePrefabArgs = (args, data) => {
	args = args.map(arg=>{
		if(arg == "") return null;
		if(arg.charAt(0) == '"'){
			arg = arg.substring(1, arg.length-1)
			return arg
		}else{
			return data[arg]
		}
	})
	return args
}

const readFileFromDisk = (filepath) => {
	return fs.readFileSync(filepath, {
		encoding: "utf8"
	});
}

const saveFileToDisk = (filepath, content) => {
	const folderpath = filepath.split("/").splice(0, filepath.split("/").length-1).join("/")
	if(folderpath) fs.mkdirSync(folderpath, { recursive: true });
	fs.writeFileSync(filepath, content);
}

exports.saveFileToDisk = saveFileToDisk;
exports.readFileFromDisk = readFileFromDisk;
exports.transpile = transpile;