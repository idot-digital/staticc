const pathLib = require('path')
const { snippet_type } = require('../dist/interfaces')
jest.mock('../dist/read_write')
//jest.mock('sass')

const MOCK_FILE_INFO = {
    'file1.txt': 'test',
    'file2.js': '//random stuff',
    'style.css': 'body{background-color: blue}',
}

// MOCK_FILE_INFO[pathLib.join('prefabs', 'html', 'prefab.html')] = '<h5>Hello, World!</h5>'
// MOCK_FILE_INFO[pathLib.join('prefabs', 'javascript', 'prefab.js')] = "function render(){return 'test'}"

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
        expect(snippets[1].path).toEqual(['javascript'])
        expect(snippets[1].args).toEqual(['lol'])
        expect(snippets[2].type).toBe(snippet_type.prefab_html)
        expect(snippets[2].path).toEqual(['html'])
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
        const snippets = await _interpretJSSnippet({ id: '789', type: snippet_type.js, value: '5+1' }, {})
        expect(snippets).toEqual({ id: '789', type: snippet_type.js, value: 6 })
    })
    test('_interpretPrefabSnippet', async () => {
        const { _interpretPrefabSnippet } = require('../dist/resolve')
        const snippets = await _interpretPrefabSnippet({ id: '789', type: snippet_type.js, value: 'render("test")' }, {}, [])
        expect(snippets).toEqual({ id: '789', type: snippet_type.js, value: 'test' })
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
            { id: '123', type: snippet_type.data, value: 'test', resolvedValue: 'lol' },
            { id: '456', type: snippet_type.js, args: ['"lol"'], value: 'leave it be' },
            { id: '789', type: snippet_type.data, value: 'test2.test3', resolvedValue: 'lol' },
        ])
    })
    test('_resolveDataSnippet', async () => {
        const { _resolveDataSnippet } = require('../dist/resolve')
        const snippets = await _resolveDataSnippet({ id: '123', type: snippet_type.data, value: 'test' }, { test: 'lol' })
        expect(snippets).toEqual({ id: '123', type: snippet_type.data, value: 'test', resolvedValue: 'lol' })
    })
    test('_resolveFileSnippets', async () => {
        const { _resolveFileSnippets } = require('../dist/resolve')
        const snippets = await _resolveFileSnippets(
            [
                { id: '123', type: snippet_type.file, value: 'test', args: ['sass'] },
                { id: '123', type: snippet_type.file, value: 'test', args: ['css'] },
                { id: '123', type: snippet_type.file, value: 'test', args: ['svg'] },
                { id: '456', type: snippet_type.js, value: 'leave it be' },
                { id: '789', type: snippet_type.file, value: 'test', args: ['js'] },
            ],
            { test: 'lol', test2: { test3: 'lol' } }
        )
        expect(snippets).toEqual([
            { id: '123', type: snippet_type.file, value: 'test', args: ['sass'], resolvedValue: '<style>test</style>' },
            { id: '123', type: snippet_type.file, value: 'test', args: ['css'], resolvedValue: '<style>test</style>' },
            { id: '123', type: snippet_type.file, value: 'test', args: ['svg'], resolvedValue: 'test' },
            { id: '456', type: snippet_type.js, value: 'leave it be' },
            { id: '789', type: snippet_type.file, value: 'test', args: ['js'], resolvedValue: '<script>test</script>' },
        ])
    })
    test('_resolvePrefabSnippets', async () => {
        const { _resolvePrefabSnippets } = require('../dist/resolve')
        const snippets = await _resolvePrefabSnippets(
            [
                { id: '123', type: snippet_type.prefab_html, value: 'test' },
                { id: '123', type: snippet_type.prefab_js, value: 'test' },
                { id: '456', type: snippet_type.file, value: 'leave it be' },
            ],
            { test: 'lol', test2: { test3: 'lol' } }
        )
        expect(snippets).toEqual([
            { id: '123', type: snippet_type.prefab_html, value: 'test', resolvedValue: 'test' },
            { id: '123', type: snippet_type.prefab_js, value: 'test', resolvedValue: 'test' },
            { id: '456', type: snippet_type.file, value: 'leave it be' },
        ])
    })
    test('_resolveJsSnippets', async () => {
        const { _resolveJsSnippets } = require('../dist/resolve')
        const snippets = await _resolveJsSnippets(
            [
                { id: '123', type: snippet_type.js, value: 'test' },
                { id: '456', type: snippet_type.file, value: 'leave it be' },
            ],
            { test: 'lol', test2: { test3: 'lol' } }
        )
        expect(snippets).toEqual([
            { id: '123', type: snippet_type.js, value: 'test', resolvedValue: 'test' },
            { id: '456', type: snippet_type.file, value: 'leave it be' },
        ])
    })
    test('_snippets2Strings', async () => {
        const { _snippets2Strings } = require('../dist/resolve')
        const snippets = await _snippets2Strings([
            { id: '123', type: snippet_type.file, value: 'test', args: ['sass'], resolvedValue: '<style>test</style>' },
            { id: '123', type: snippet_type.file, value: 'test', args: ['css'], resolvedValue: '<style>test</style>' },
            { id: '123', type: snippet_type.file, value: 'test', args: ['svg'], resolvedValue: 'test' },
            { id: '789', type: snippet_type.file, value: 'test', args: ['js'], resolvedValue: '<script>test</script>' },
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
        const snippets = await _transpile('Hello {{name}}, {{?css style.css}}', { name: 'user' })
        expect(snippets).toBe('Hello user, <style>body{background-color: blue}</style>')
    })
})
