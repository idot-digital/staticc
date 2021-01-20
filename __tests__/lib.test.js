const pathLib = require('path')
const { snippet_type } = require('../dist/interfaces')
jest.mock('../dist/read_write')
//jest.mock('sass')

const MOCK_FILE_INFO = {
    'file1.txt': 'test',
    'file2.js': '//random stuff',
    'style.css': 'body{background-color: green}',
}

MOCK_FILE_INFO[pathLib.join('prefabs', 'hello_world', 'prefab.html')] = '<h5>Hello, World!</h5> {{?css style.css}}'
MOCK_FILE_INFO[pathLib.join('prefabs', 'count_to_3', 'prefab.js')] = 'const arr = [];for(let i=0; i<4; i++){arr.push(i)};render(arr);'
MOCK_FILE_INFO[pathLib.join('prefabs', 'hello_world', 'style.css')] = 'body{background-color: blue}'
MOCK_FILE_INFO[pathLib.join('src', 'style.css')] = 'body{background-color: red}'

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

describe('resolve', () => {})

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
        expect(snippets).toEqual({
            htmlString:
                '<!DOCTYPE html><html><head><title>STATICC Webpage</title></head><body><h1>STATICC Webpage</h1><h2>Item 1</h2><h2>Item 2</h2><h2>Item 3</h2> <h5>Hello, World!</h5> <style> body{background-color: blue}</style> 0123 </body></html>',
            loadedFiles: ['prefabs\\hello_world\\prefab.html', 'style.css', 'prefabs\\count_to_3\\prefab.js'],
        })
    })
})
