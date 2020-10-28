Object.defineProperty(exports, "__esModule", { value: true });
exports._snippets2Strings = exports._resolveJsSnippets = exports._resolvePrefabSnippets = exports._resolveFileSnippets = exports._resolveDataSnippet = exports._resolveDataSnippets = exports._interpretPrefabSnippet = exports._interpretJSSnippet = exports._readSnippetFiles = exports._loadSnippetsFromDisk = exports._interpretSnippets = exports._groupSnippets = exports.resolve = void 0;
const worker_threads_1 = require("worker_threads");
const uuid_1 = require("uuid");
const read_write_1 = require("./read_write");
const interfaces_1 = require("./interfaces");
exports.resolve = async (codeSnippets, data) => {
    const groupedSnippets = exports._groupSnippets(codeSnippets);
    const loadedSnippets = await exports._loadSnippetsFromDisk(groupedSnippets);
    const interpretedSnippets = await exports._interpretSnippets(loadedSnippets, data);
    const resolvedSnippets = pipe(exports._resolveFileSnippets, exports._resolveDataSnippets, exports._resolvePrefabSnippets, exports._resolveJsSnippets)(interpretedSnippets, data);
    return exports._snippets2Strings(resolvedSnippets);
};
exports._groupSnippets = (codeSnippets) => {
    return codeSnippets.map((snippet_string) => {
        const snippet = {
            id: uuid_1.v4(),
            type: interfaces_1.snippet_type.data,
        };
        snippet_string = snippet_string.trim();
        if (snippet_string.indexOf('#') != -1) {
            //js snippet
            snippet.type = interfaces_1.snippet_type.js;
            snippet.value = snippet_string.replace('#', '');
        }
        else if (snippet_string.indexOf('!!') != -1) {
            const args = snippet_string.replace('!!', '').split(' ');
            const snippet_path = args.shift();
            if (!snippet_path)
                throw new Error('Cloud not resolve js-prefab! No filepath given!');
            //js prefab
            snippet.type = interfaces_1.snippet_type.prefab_js;
            snippet.path = [snippet_path];
            snippet.args = args;
        }
        else if (snippet_string.indexOf('!') != -1) {
            //html prefab
            snippet.type = interfaces_1.snippet_type.prefab_html;
            snippet.path = [snippet_string.replace('!', '')];
        }
        else if (snippet_string.indexOf('?') != -1) {
            //file snippet
            const args = snippet_string.replace('?', '').split(' ');
            const snippet_cmd = args.shift();
            if (!snippet_cmd)
                throw new Error('Could not resolve file-snippet! The given filetype is not supported!');
            snippet.type = interfaces_1.snippet_type.file;
            snippet.path = args;
            snippet.args = [snippet_cmd];
        }
        else {
            //data snippet
            snippet.value = snippet_string;
        }
        return snippet;
    });
};
exports._interpretSnippets = async (snippets, data) => {
    return Promise.all(snippets.map(async (snippet) => {
        if (snippet.type == interfaces_1.snippet_type.prefab_js) {
            //@ts-ignore
            return exports._interpretPrefabSnippet(snippet, data, snippet.args);
        }
        else if (snippet.type == interfaces_1.snippet_type.js) {
            return exports._interpretJSSnippet(snippet, data);
        }
        else {
            return snippet;
        }
    }));
};
exports._loadSnippetsFromDisk = async (snippets) => {
    return Promise.all(snippets.map(async (snippet) => {
        if (snippet.type == interfaces_1.snippet_type.file || snippet.type == interfaces_1.snippet_type.prefab_js || snippet.type == interfaces_1.snippet_type.prefab_html) {
            return exports._readSnippetFiles(snippet);
        }
        else {
            return snippet;
        }
    }));
};
exports._readSnippetFiles = async (snippet) => {
    const fileContents = await Promise.all(snippet.path.map((path) => {
        return read_write_1.readFileFromDisk(path);
    }));
    const value = fileContents.join(' ');
    snippet.value = value;
    return snippet;
};
exports._interpretJSSnippet = async (snippet, data) => {
    return new Promise((resolve, reject) => {
        const worker = new worker_threads_1.Worker('./dist/interpreter/js_interpreter.js', { workerData: { snippet, data } });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};
exports._interpretPrefabSnippet = async (snippet, data, args) => {
    return new Promise((resolve, reject) => {
        const worker = new worker_threads_1.Worker('./dist/interpreter/prefab_interpreter.js', { workerData: { snippet, data, args } });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};
exports._resolveDataSnippets = (snipepts, data) => {
    return snipepts.map((snippet) => {
        if (snippet.type == interfaces_1.snippet_type.data) {
            return exports._resolveDataSnippet(snippet, data);
        }
        else {
            return snippet;
        }
    });
};
exports._resolveDataSnippet = (snippet, data) => {
    var _a;
    let value = data;
    const snippetParts = (_a = snippet.value) === null || _a === void 0 ? void 0 : _a.split('.');
    try {
        for (let i = 0; i < snippetParts.length; i++) {
            value = value[snippetParts[i]];
            if (!value)
                throw new Error();
        }
    }
    catch (error) {
        throw Error('Could not resolve data-snippet. The requested value is undefined!');
    }
    return { resolvedValue: value, ...snippet };
};
exports._resolveFileSnippets = (snippets) => {
    return snippets.map((snippet) => {
        var _a, _b, _c, _d, _e;
        if (snippet.type == interfaces_1.snippet_type.file) {
            if ((_a = snippet.args) === null || _a === void 0 ? void 0 : _a.includes('css')) {
                return { resolvedValue: `<style>${snippet.value}</style>`, ...snippet };
            }
            else if (((_b = snippet.args) === null || _b === void 0 ? void 0 : _b.includes('sass')) || ((_c = snippet.args) === null || _c === void 0 ? void 0 : _c.includes('scss'))) {
                //resovle Sass
                return { resolvedValue: `<style>${snippet.value}</style>`, ...snippet };
            }
            else if ((_d = snippet.args) === null || _d === void 0 ? void 0 : _d.includes('svg')) {
                return { resolvedValue: snippet.value, ...snippet };
            }
            else if ((_e = snippet.args) === null || _e === void 0 ? void 0 : _e.includes('js')) {
                return { resolvedValue: `<script>${snippet.value}</script>`, ...snippet };
            }
            else {
                throw new Error('Could not resolve file-snippet! The given filetype is not supported!');
            }
        }
        else {
            return snippet;
        }
    });
};
exports._resolvePrefabSnippets = (snippets) => {
    return snippets.map((snippet) => {
        if (snippet.type == interfaces_1.snippet_type.prefab_html || snippet.type == interfaces_1.snippet_type.prefab_js) {
            return { resolvedValue: snippet.value, ...snippet };
        }
        else {
            return snippet;
        }
    });
};
exports._resolveJsSnippets = (snippets) => {
    return snippets.map((snippet) => {
        if (snippet.type == interfaces_1.snippet_type.js) {
            return { resolvedValue: snippet.value, ...snippet };
        }
        else {
            return snippet;
        }
    });
};
exports._snippets2Strings = (snippets) => {
    return snippets.map((snippet) => {
        return snippet.resolvedValue;
    });
};
const pipe = (...fns) => (x, ...args) => fns.reduce((v, f) => f(v, ...args), x);
