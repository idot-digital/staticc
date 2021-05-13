const pathLib = require('path')
jest.mock('../dist/internal_lib.js')
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

const dummyTranspiler = {
    interpret: (a, b) => {
        return ''
    },
    interpreter: {
        interpretingMode: 0,
    },
}

beforeAll(() => {
    // Set up some mocked out file info before each test
    require('../dist/internal_lib.js').__setMockFiles(MOCK_FILE_INFO)
})

describe('Preprocessor', () => {
    const { default: Preprocessor } = require('../dist/Preprocessor')
    describe('cleanComments', () => {
        test('simple', () => {
            const p = new Preprocessor('/~ Yeet ~/Hello/~ Hui ~/, World!/~ LOL ~/')
            p.cleanComments()
            expect(p.input_string).toBe('Hello, World!')
        })
        test('multiline', () => {
            const p = new Preprocessor(`/~ Yeet ~/Hello/~ Hui
                this is to nice
                ~/, World!/~ LOL ~/`)
            p.cleanComments()
            expect(p.input_string).toBe('Hello, World!')
        })
        test('complex', () => {
            const p = new Preprocessor(`{{* test.txt /~ Yeet ~/ test2.css test3.gif *}}Hello/~ Hui ~/, World!/~ LOL ~/`)
            p.cleanComments()
            expect(p.input_string).toBe('{{* test.txt  test2.css test3.gif *}}Hello, World!')
        })
    })

    describe('extractLinkedFiles', () => {
        test('beginning', () => {
            const p = new Preprocessor('<link href="{{* test.txt *}}"><link href="{{*  test2.css *}}"><link href="{{* test3.gif *}}">Hello, World!')
            p.path = 'prefabs/helloWorld'
            p.extractLinkedFiles()
            expect(p.linkedFiles).toEqual([
                { from: pathLib.join('prefabs', 'test.txt'), to: pathLib.join('dist', 'test.txt') },
                { from: pathLib.join('prefabs', 'test2.css'), to: pathLib.join('dist', 'test2.css') },
                { from: pathLib.join('prefabs', 'test3.gif'), to: pathLib.join('dist', 'test3.gif') },
            ])
            expect(p.loadedFiles).toEqual([pathLib.join('prefabs', 'test.txt'), pathLib.join('prefabs', 'test2.css'), pathLib.join('prefabs', 'test3.gif')])
            expect(p.input_string).toBe('<link href="/test.txt"><link href="/test2.css"><link href="/test3.gif">Hello, World!')
        })
        test('middle', () => {
            const p = new Preprocessor('Hello,<link href="{{* test.txt *}}"><link href="{{*  test2.css *}}"><link href="{{* test3.gif *}}">World!')
            p.path = 'prefabs/helloWorld'
            p.extractLinkedFiles()
            expect(p.linkedFiles).toEqual([
                { from: pathLib.join('prefabs', 'test.txt'), to: pathLib.join('dist', 'test.txt') },
                { from: pathLib.join('prefabs', 'test2.css'), to: pathLib.join('dist', 'test2.css') },
                { from: pathLib.join('prefabs', 'test3.gif'), to: pathLib.join('dist', 'test3.gif') },
            ])
            expect(p.loadedFiles).toEqual([pathLib.join('prefabs', 'test.txt'), pathLib.join('prefabs', 'test2.css'), pathLib.join('prefabs', 'test3.gif')])
            expect(p.input_string).toBe('Hello,<link href="/test.txt"><link href="/test2.css"><link href="/test3.gif">World!')
        })
        test('end', () => {
            const p = new Preprocessor('Hello, World!<link href="{{* test.txt *}}"><link href="{{*  test2.css *}}"><link href="{{* test3.gif *}}">')
            p.path = 'prefabs/helloWorld'
            p.extractLinkedFiles()
            expect(p.linkedFiles).toEqual([
                { from: pathLib.join('prefabs', 'test.txt'), to: pathLib.join('dist', 'test.txt') },
                { from: pathLib.join('prefabs', 'test2.css'), to: pathLib.join('dist', 'test2.css') },
                { from: pathLib.join('prefabs', 'test3.gif'), to: pathLib.join('dist', 'test3.gif') },
            ])
            expect(p.loadedFiles).toEqual([pathLib.join('prefabs', 'test.txt'), pathLib.join('prefabs', 'test2.css'), pathLib.join('prefabs', 'test3.gif')])
            expect(p.input_string).toBe('Hello, World!<link href="/test.txt"><link href="/test2.css"><link href="/test3.gif">')
        })
    })
    describe('preprocess', () => {
        test('simple', () => {
            const p = new Preprocessor('<link href="{{* test.txt  /~ Yeet ~/ *}}">Hello/~ Hui ~/, World!/~ LOL ~/')
            p.preprocess('prefabs/helloWorld')
            expect(p.linkedFiles).toEqual([{ from: pathLib.join('prefabs', 'test.txt'), to: pathLib.join('dist', 'test.txt') }])
            expect(p.loadedFiles).toEqual([pathLib.join('prefabs', 'test.txt')])
            expect(p.input_string).toBe('<link href="/test.txt">Hello, World!')
        })
    })
})

describe('seperate', () => {
    test('occurrences', () => {
        const { occurrences } = require('../dist/seperate')
        const result = occurrences('Hello World! Hello Internet!', 'Hello')
        expect(result).toBe(2)
    })
    test('cutString false', () => {
        const { cutString } = require('../dist/seperate')
        const result = cutString('Hello World{{this is a test}}lol', '{{', '}}')
        expect(result).toEqual(['Hello World', 'this is a test', 'lol', 'false'])
    })
    test('cutString true', () => {
        const { cutString } = require('../dist/seperate')
        const result = cutString('Hello World lol', '{{', '}}')
        expect(result).toEqual(['', '', 'Hello World lol', 'true'])
    })
    describe('classifySnippet', () => {
        const { DataSnippet } = require('../dist/classes/DataSnippet')
        const { default: JsSnippet } = require('../dist/classes/JsSnippet')
        const { default: HtmlPrefabSnippet } = require('../dist/classes/HtmlPrefabSnippet')
        const { default: JsPrefabSnippet } = require('../dist/classes/JsPrefabSnippet')
        const { default: FileInlineSnippet } = require('../dist/classes/FileInlineSnippet')
        test('DataSnippet', () => {
            const { classifySnippet } = require('../dist/seperate')
            const result = classifySnippet('year', 'src/', 0, dummyTranspiler)
            expect(result).toEqual({ filepaths: [], filesToCopy: [], input_string: 'year', lineNumber: 0, referencePath: 'src/', result: '', transpiler: dummyTranspiler })
            expect(result.constructor).toEqual(DataSnippet)
        })
        test('JsPrefabSnippet', () => {
            const { classifySnippet } = require('../dist/seperate')
            const result = classifySnippet('!!year', 'src/', 0, dummyTranspiler)
            expect(result).toEqual(new JsPrefabSnippet('year', 0, 'src/', dummyTranspiler))
            expect(result.constructor).toEqual(JsPrefabSnippet)
        })
        test('HtmlPrefabSnippet', () => {
            const { classifySnippet } = require('../dist/seperate')
            const result = classifySnippet('!year', 'src/', 0, dummyTranspiler)
            expect(result).toEqual(new HtmlPrefabSnippet('year', 0, 'src/', dummyTranspiler))
            expect(result.constructor).toEqual(HtmlPrefabSnippet)
        })
        test('FileInlineSnippet', () => {
            const { classifySnippet } = require('../dist/seperate')
            const result = classifySnippet('?year', 'src/', 0, dummyTranspiler)
            expect(result).toEqual(new FileInlineSnippet('year', 0, 'src/', dummyTranspiler))
            expect(result.constructor).toEqual(FileInlineSnippet)
        })
        test('JsSnippet', () => {
            const { classifySnippet } = require('../dist/seperate')
            const result = classifySnippet('#year', 'src/', 0, dummyTranspiler)
            expect(result).toEqual(new JsSnippet('year', 0, 'src/', dummyTranspiler))
            expect(result.constructor).toEqual(JsSnippet)
        })
    })
    describe('calculateLineNumbers', () => {
        test('one line', () => {
            const { calculateLineNumber } = require('../dist/seperate')
            const result = calculateLineNumber(10, 'Hello,\nWorld!', '\n\n\n This is not ok!')
            expect(result).toEqual(6)
        })
        test('even line count', () => {
            const { calculateLineNumber } = require('../dist/seperate')
            const result = calculateLineNumber(15, '\n\nHello,\nWorld!\n', '\n\n\n This is not ok!')
            expect(result).toEqual(10)
        })
        test('odd line count', () => {
            const { calculateLineNumber } = require('../dist/seperate')
            const result = calculateLineNumber(10, '\nHello,\nWorld!\n', '\n\n\n This is not ok!')
            expect(result).toEqual(5)
        })
    })
    test('seperate', () => {
        const { seperate } = require('../dist/seperate')
        const { DataSnippet } = require('../dist/classes/DataSnippet')
        const { default: JsSnippet } = require('../dist/classes/JsSnippet')
        const { default: HtmlPrefabSnippet } = require('../dist/classes/HtmlPrefabSnippet')
        const { default: JsPrefabSnippet } = require('../dist/classes/JsPrefabSnippet')
        const result = seperate(
            '<!DOCTYPE html><html><head><title>{{title}}</title></head><body><h1>{{title}}</h1>{{ # data.shop_items.map(elmt=>{ return `<h2>${elmt}</h2>`}) }} {{ !hello_world }} {{ !!count_to_3 }} </body></html>',
            '{{',
            '}}',
            'src/index.html',
            dummyTranspiler
        )
        expect(result).toEqual({
            codeSnippets: [
                new DataSnippet('title', 1, 'src/index.html', dummyTranspiler),
                new DataSnippet('title', 1, 'src/index.html', dummyTranspiler),
                new JsSnippet('data.shop_items.map(elmt=>{ return `<h2>${elmt}</h2>`})', 1, 'src/index.html', dummyTranspiler),
                new HtmlPrefabSnippet('hello_world', 1, 'src/index.html', dummyTranspiler),
                new JsPrefabSnippet('count_to_3', 1, 'src/index.html', dummyTranspiler),
            ],
            plainHTMLSnippets: ['<!DOCTYPE html><html><head><title>', '</title></head><body><h1>', '</h1>', ' ', ' ', ' </body></html>'],
        })
        expect(result.codeSnippets.map((res) => res.constructor)).toEqual([DataSnippet, DataSnippet, JsSnippet, HtmlPrefabSnippet, JsPrefabSnippet])
    })
})

describe('transpile', () => {
    test('transpile', async () => {
        const { default: Transpiler } = require('../dist/Transpiler')
        const transpiler = new Transpiler(
            '<!DOCTYPE html><html><head><title>{{title}}</title></head><body><h1>{{title}}</h1>{{ # data.shop_items.map(elmt=>{ return `<h2>${elmt}</h2>`}) }} {{ !hello_world }} {{ !!count_to_3 }} </body></html>',
            { title: 'STATICC Webpage', shop_items: ['Item 1', 'Item 2', 'Item 3'], type: 'h6' },
            '/src/index.html',
            6
        )
        const snippets = await transpiler.transpile()
        expect(snippets).toEqual(
            '<!DOCTYPE html><html><head><title>STATICC Webpage</title></head><body><h1>STATICC Webpage</h1><h2>Item 1</h2><h2>Item 2</h2><h2>Item 3</h2> <h5>Hello, World!</h5> <style> body{background-color: blue}</style> 0123 </body></html>'
        )
    })
    test('transpile with error', async () => {
        const { default: Transpiler } = require('../dist/Transpiler')
        try {
            const transpiler = new Transpiler(
                '<!DOCTYPE html><html><head><title>{{title}}</title></head><body><h1>{{title}}</h1>{{ # data.shop_items.map(elmt=>{ return `<h2>${elmt}</h2>`}) }} {{ !hello_world }} {{ !!count_to_3 }} </body></html>',
                { shop_items: ['Item 1', 'Item 2', 'Item 3'], type: 'h6' },
                '/src/index.html',
                6
            )
            const snippets = await transpiler.transpile()
            expect(transpiler.getErrorAsHtml()).toEqual(
                '<br>Error in Line 1 in /src/index.html<br>title<br>Could not resolve data-snippet. The requested value is undefined!<br><br>Error in Line 1 in /src/index.html<br>title<br>Could not resolve data-snippet. The requested value is undefined!<br>'
            )
        } catch (error) {
            console.error(error)
        }
    })
    test('getErrorAsHtml', async () => {
        const { default: Transpiler } = require('../dist/Transpiler')
        const t = new Transpiler('', {}, '/src/index.html', 0)
        t.errorMsg = 'Error \n Occured'
        const result = t.getErrorAsHtml()
        expect(result).toEqual('Error <br> Occured')
    })
    test('recombine', async () => {
        const { default: Transpiler } = require('../dist/Transpiler')
        const t = new Transpiler('', {}, '/src/index.html', 0)
        t.resolvedSnippets = [', ']
        t.plainHTMLSnippets = ['Hello', 'World!']
        t.recombine()
        const result = t.input_string
        expect(result).toEqual('Hello, World!')
    })
})

describe('DataSnippet', () => {
    test('resolve', async () => {
        const { DataSnippet } = require('../dist/classes/DataSnippet')
        const s = new DataSnippet('data', 0, 'src/index.html', dummyTranspiler)
        s.resolve({ data: 'test' })
        expect(s.result).toBe('test')
    })
    test('resolve with error (undefined)', async () => {
        const { DataSnippet } = require('../dist/classes/DataSnippet')
        const s = new DataSnippet('lol', 0, 'src/index.html', dummyTranspiler)
        try {
            await s.resolve(undefined)
        } catch (err) {
            expect(err.message).toEqual('Could not resolve data-snippet. The requested value is undefined!')
            return
        }
        expect(1).toEqual(undefined)
    })
    test('resolve with error (array)', async () => {
        const { DataSnippet } = require('../dist/classes/DataSnippet')
        const s = new DataSnippet('lol', 0, 'src/index.html', dummyTranspiler)
        try {
            await s.resolve({ lol: [] })
        } catch (err) {
            expect(err.message).toEqual('Could not resolve data-snippet. The requested value is an array!')
            return
        }
        expect(1).toEqual(undefined)
    })
    test('resolve with error (object)', async () => {
        const { DataSnippet } = require('../dist/classes/DataSnippet')
        const s = new DataSnippet('lol', 0, 'src/index.html', dummyTranspiler)
        try {
            await s.resolve({ lol: {} })
        } catch (error) {
            expect(error.message).toEqual('Could not resolve data-snippet. The requested value is an object!')
            return
        }
        expect(1).toEqual(undefined)
    })
    test('dataLookup', async () => {
        const { dataLookup } = require('../dist/classes/DataSnippet')
        const result = dataLookup({ one: { two: { three: 'hello' } } }, 'one.two.three')
        expect(result).toEqual('hello')
    })
    test('dataLookup with error', async () => {
        const { dataLookup } = require('../dist/classes/DataSnippet')
        try {
            dataLookup({ one: { two: { three: 'hello' } } }, 'one.two.three.four')
        } catch (error) {
            expect(error.message).toEqual('Could not resolve data-snippet. The requested value is undefined!')
            return
        }
        expect(1).toEqual(undefined)
    })
})
