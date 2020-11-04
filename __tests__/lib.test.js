const pathLib = require('path')
const { snippet_type } = require('../dist/interfaces')
jest.mock('../dist/read_write')
//jest.mock('sass')

const MOCK_FILE_INFO = {
    'file1.txt': 'test',
    'file2.js': '//random stuff',
    'style.css': 'body{background-color: blue}',
}


MOCK_FILE_INFO[pathLib.join('prefabs', 'hello_world', 'prefab.html')] = '<h5>Hello, World!</h5> {{?css style.css}}'
MOCK_FILE_INFO[pathLib.join('prefabs', 'count_to_3', 'prefab.js')] = 'const arr = [];for(let i=0; i<4; i++){arr.push(i)};render(arr);'
MOCK_FILE_INFO[pathLib.join('prefabs', 'hello_world', 'style.css')] = 'body{background-color: blue}'

beforeAll(() => {
    // Set up some mocked out file info before each test
    require('../dist/read_write.js').__setMockFiles(MOCK_FILE_INFO)
})


describe('preprocess', () => {
    test('preprocess', () => {
        const { preprocess } = require('../dist/preprocess')
        const result = preprocess('test')
        expect(result).toBe('test')
    })
})

describe('seperate', () => {
    test('seperate', () => {
        const { seperate } = require('../dist/seperate')
        const [plainHTMLSnippets, codeSnippets] = seperate('{{lol}}test{{test}}', '{{', '}}')
        expect(plainHTMLSnippets).toEqual(['', 'test', ''])
        expect(codeSnippets).toEqual(['lol', 'test'])
    })
    test('_occurrences', () => {
        const { _occurrences } = require('../dist/seperate')
        const result = _occurrences('Hello World! Hello Internet!', 'Hello')
        expect(result).toBe(2)
    })
    test('_cutString', () => {
        const { _cutString } = require('../dist/seperate')
        const result = _cutString('Hello World{{this is a test}}lol', '{{', '}}')
        expect(result).toEqual(['Hello World', 'this is a test', 'lol'])
    })
})

describe('resolve', () => {
    test('_groupSnippets', () => {
        const { _groupSnippets } = require('../dist/resolve')
        const snippets = _groupSnippets(['# "+49" + data.tele', '!!javascript lol', '!html', '?svg file.svg', 'hui'])
        expect(snippets[0].type).toBe(snippet_type.js)
        expect(snippets[0].value).toBe(' "+49" + data.tele')
        expect(snippets[1].type).toBe(snippet_type.prefab_js)
        expect(snippets[1].path).toEqual(['prefabs\\javascript\\prefab.js'])
        expect(snippets[1].args).toEqual(['lol'])
        expect(snippets[2].type).toBe(snippet_type.prefab_html)
        expect(snippets[2].path).toEqual(['prefabs\\html\\prefab.html'])
        expect(snippets[3].type).toBe(snippet_type.file)
        expect(snippets[3].path).toEqual(['file.svg'])
        expect(snippets[4].type).toBe(snippet_type.data)
    })
    test('_interpretSnippets', async () => {
        const { _interpretSnippets } = require('../dist/resolve')
        const snippets = await _interpretSnippets(
            [
                { id: '123', type: snippet_type.prefab_js, args: [], value: 'render("test")' },
                { id: '456', type: snippet_type.prefab_js, args: ['"lol"'], value: 'render(args[0])' },
                { id: '789', type: snippet_type.js, value: '"hello world " + data.lol' },
            ],
            { lol: '!' }
        )
        expect(snippets).toEqual([
            { id: '123', type: snippet_type.prefab_js, args: [], value: 'test' },
            { id: '456', type: snippet_type.prefab_js, args: ['"lol"'], value: 'lol' },
            { id: '789', type: snippet_type.js, value: 'hello world !' },
        ])
    })
    test('_loadSnippetsFromDisk', async () => {
        const { _loadSnippetsFromDisk } = require('../dist/resolve')
        const snippets = await _loadSnippetsFromDisk([
            { id: '123', type: snippet_type.file, args: [], value: '', path: ['file1.txt'] },
            { id: '456', type: snippet_type.prefab_js, args: ['"lol"'], value: '', path: ['file2.js'] },
            { id: '789', type: snippet_type.prefab_html, value: '', path: ['file1.txt', 'file2.js'] },
        ])
        expect(snippets).toEqual([
            { id: '123', type: snippet_type.file, args: [], value: 'test', path: ['file1.txt'] },
            { id: '456', type: snippet_type.prefab_js, args: ['"lol"'], value: '//random stuff', path: ['file2.js'] },
            { id: '789', type: snippet_type.prefab_html, value: 'test //random stuff', path: ['file1.txt', 'file2.js'] },
        ])
    })
    test('_readSnippetFiles', async () => {
        const { _readSnippetFiles } = require('../dist/resolve')
        const snippets = await _readSnippetFiles({ id: '789', type: snippet_type.prefab_html, value: '', path: ['file1.txt', 'file2.js'] })
        expect(snippets).toEqual({ id: '789', type: snippet_type.prefab_html, value: 'test //random stuff', path: ['file1.txt', 'file2.js'] })
    })
    test('_interpretJSSnippet', async () => {
        const { _interpretJSSnippet } = require('../dist/resolve')
        const snippets = await _interpretJSSnippet({ id: '789', type: snippet_type.js, value: 'data.title.map(elmt=>elmt)' }, { title: ['test', 'test2', 'test3'] })
        expect(snippets).toEqual({ id: '789', type: snippet_type.js, value: 'testtest2test3' })
    })
    test('_interpretPrefabSnippet', async () => {
        const { _interpretPrefabSnippet } = require('../dist/resolve')
        const snippets = await _interpretPrefabSnippet({ id: '789', type: snippet_type.js, value: 'let test = ["lol"]; render(...test)' }, {}, [])
        expect(snippets).toEqual({ id: '789', type: snippet_type.js, value: 'lol' })
    })
    test('_resolveDataSnippets', async () => {
        const { _resolveDataSnippets } = require('../dist/resolve')
        const snippets = await _resolveDataSnippets(
            [
                { id: '123', type: snippet_type.data, value: 'test' },
                { id: '456', type: snippet_type.js, args: ['"lol"'], value: 'leave it be' },
                { id: '789', type: snippet_type.data, value: 'test2.test3' },
            ],
            { test: 'lol', test2: { test3: 'lol' } }
        )
        expect(snippets).toEqual([
            { id: '123', type: snippet_type.data, value: 'lol' },
            { id: '456', type: snippet_type.js, args: ['"lol"'], value: 'leave it be' },
            { id: '789', type: snippet_type.data, value: 'lol' },
        ])
    })
    test('_resolveDataSnippet', async () => {
        const { _resolveDataSnippet } = require('../dist/resolve')
        const snippets = await _resolveDataSnippet({ id: '123', type: snippet_type.data, value: 'test' }, { test: 'lol' })
        expect(snippets).toEqual({ id: '123', type: snippet_type.data, value: 'lol' })
    })
    test('_resolveFileSnippets', async () => {
        const { _resolveFileSnippets } = require('../dist/resolve')
        const snippets = await _resolveFileSnippets(
            [
                { id: '123', type: snippet_type.file, value: 'body{background-color: blue}', args: ['sass'] },
                { id: '123', type: snippet_type.file, value: 'test', args: ['css'] },
                { id: '123', type: snippet_type.file, value: 'test', args: ['svg'] },
                { id: '456', type: snippet_type.js, value: 'leave it be' },
                { id: '789', type: snippet_type.file, value: 'test', args: ['js'] },
            ],
            { test: 'lol', test2: { test3: 'lol' } }
        )
        expect(snippets).toEqual([
            { id: '123', type: snippet_type.file, value: '<style>body{background-color: blue}</style>', args: ['sass'] },
            { id: '123', type: snippet_type.file, value: '<style>test</style>', args: ['css'] },
            { id: '123', type: snippet_type.file, value: 'test', args: ['svg'] },
            { id: '456', type: snippet_type.js, value: 'leave it be' },
            { id: '789', type: snippet_type.file, value: '<script>test</script>', args: ['js'] },
        ])
    })
    test('_snippets2Strings', async () => {
        const { _snippets2Strings } = require('../dist/resolve')
        const snippets = await _snippets2Strings([
            { id: '123', type: snippet_type.file, value: '<style>test</style>', args: ['sass'] },
            { id: '123', type: snippet_type.file, value: '<style>test</style>', args: ['css'] },
            { id: '123', type: snippet_type.file, value: 'test', args: ['svg'] },
            { id: '789', type: snippet_type.file, value: '<script>test</script>', args: ['js'] },
        ])
        expect(snippets).toEqual(['<style>test</style>', '<style>test</style>', 'test', '<script>test</script>'])
    })
})

describe('recombine', () => {
    test('recombine', async () => {
        const { recombine } = require('../dist/recombine')
        const snippets = await recombine(['html1', 'html2', 'html3', 'html4', 'html5', 'html6'], ['codeI', 'codeII', 'codeIII', 'codeIV', 'codeV'])
        expect(snippets).toBe('html1codeIhtml2codeIIhtml3codeIIIhtml4codeIVhtml5codeVhtml6')
    })
})

describe('transpile', () => {
    test('_transpile', async () => {
        const { _transpile } = require('../dist/transpile')
        const snippets = await _transpile(
            '<!DOCTYPE html><html><head><title>{{title}}</title></head><body><h1>{{title}}</h1>{{ # data.shop_items.map(elmt=>{ return `<h2>${elmt}</h2>`}) }} {{ !hello_world }} {{!!count_to_3}} </body></html>',
            { title: 'STATICC Webpage', shop_items: ['Item 1', 'Item 2', 'Item 3'], type: 'h6' }
        )
        expect(snippets).toEqual(
            {htmlString: "<!DOCTYPE html><html><head><title>STATICC Webpage</title></head><body><h1>STATICC Webpage</h1><h2>Item 1</h2><h2>Item 2</h2><h2>Item 3</h2> <h5>Hello, World!</h5> <style>body{background-color: blue}</style> 0123 </body></html>", loadedFiles: ["prefabs\\hello_world\\prefab.html","style.css", "prefabs\\count_to_3\\prefab.js"]}
        )
    })
})
