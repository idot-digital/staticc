const pathLib = require("path")
jest.mock("../read_write_lib")
jest.mock("sass")

const MOCK_FILE_INFO = {
    "image1.svg": "<svg>1</svg>",
    "image2.svg": "<svg>2</svg>",
    "style1.css": "body{background-color: red;}",
    "style2.css": "h2{color: blue;}",
    "script1.js": "alert('hello');",
    "script2.js": "document.getElementById('test').innerHTML = 'lol'",
};

MOCK_FILE_INFO[pathLib.join("prefabs", "html", "prefab.html")] = "<h5>Hello, World!</h5>"
MOCK_FILE_INFO[pathLib.join("prefabs", "javascript", "prefab.js")] = "function render(){return 'test'}"


beforeAll(() => {
    // Set up some mocked out file info before each test
    require('../read_write_lib').__setMockFiles(MOCK_FILE_INFO)
    const {surpress_console_logs} = require("../lib");
    surpress_console_logs()
});

describe('CMD Snippets', () => {
    test('importSVG single file', () => {
        const {importSvg} = require('../lib');
        const resolvedSnippet = importSvg(['image1.svg'], "")
        expect(resolvedSnippet).toBe("<svg>1</svg>");
    });

    test('importSVG two files', () => {
        const {importSvg} = require('../lib');
        const resolvedSnippet = importSvg(['image1.svg', 'image2.svg'], "")
        expect(resolvedSnippet).toBe("<svg>1</svg><svg>2</svg>");
    });

    test('importCSS single file', () => {
        const {importCss} = require('../lib');
        const resolvedSnippet = importCss(['style1.css'], "")
        expect(resolvedSnippet).toBe("<style>body{background-color: red;}</style>");
    });

    test('importCSS two files', () => {
        const {importCss} = require('../lib');
        const resolvedSnippet = importCss(['style1.css', 'style2.css'], "")
        expect(resolvedSnippet).toBe("<style>body{background-color: red;}h2{color: blue;}</style>");
    });

    test('importSASS single file', () => {
        const {importSass} = require('../lib');
        const resolvedSnippet = importSass(['style1.sass'], "")
        expect(resolvedSnippet).toBe("<style>h1{color: aquablue;}</style>");
    });

    test('importSASS two files', () => {
        const {importSass} = require('../lib');
        const resolvedSnippet = importSass(['style1.sass', 'style1.sass'], "")
        expect(resolvedSnippet).toBe("<style>h1{color: aquablue;}h1{color: aquablue;}</style>");
    });

    test('importJS single file', () => {
        const {importJs} = require('../lib');
        const resolvedSnippet = importJs(['script1.js'], "")
        expect(resolvedSnippet).toBe("<script>alert('hello');</script>");
    });

    test('importJS two files', () => {
        const {importJs} = require('../lib');
        const resolvedSnippet = importJs(['script1.js', 'script2.js'], "")
        expect(resolvedSnippet).toBe("<script>alert('hello');document.getElementById('test').innerHTML = 'lol'</script>");
    });

    test('importImg without args', () => {
        const {importImg} = require('../lib');
        const resolvedSnippet = importImg(['image.jpg'], "")
        expect(resolvedSnippet).toBe('<picture class="undefined" id="undefined"><source srcset="image.webp" type="image/webp"><source srcset="image.jp2" type="image/jp2"><img srcset="image.jpg" alt="undefined"></picture>');
    });

    test('importImg with args', () => {
        const {importImg} = require('../lib');
        const resolvedSnippet = importImg(['image.jpg', 'some picture', 'test-id', 'test-class'], "")
        expect(resolvedSnippet).toBe('<picture class="test-class" id="test-id"><source srcset="image.webp" type="image/webp"><source srcset="image.jp2" type="image/jp2"><img srcset="image.jpg" alt="some picture"></picture>');
    });

    test('importImg webP only', () => {
        const {importImg} = require('../lib');
        const resolvedSnippet = importImg(['image.jpg'], "", true)
        expect(resolvedSnippet).toBe('<picture class="undefined" id="undefined"><source srcset="image.webp" type="image/webp"><img srcset="image.jpg" alt="undefined"></picture>');
    });
});

describe('Resolver Functions', () => {
    test('resolveDataSnippet stage 1', () => {
        const {resolveDataSnippet} = require('../lib');
        const cleanedString = resolveDataSnippet("title", {title: "test"})
        expect(cleanedString).toBe("test");
    });

    test('resolveDataSnippet stage 2', () => {
        const {resolveDataSnippet} = require('../lib');
        const cleanedString = resolveDataSnippet("title.test", {title: {test: "lol"}})
        expect(cleanedString).toBe("lol");
    });

    test('resolveJsSnippet simple data', () => {
        const {resolveJsSnippet} = require('../lib');
        const cleanedString = resolveJsSnippet("# data.test", {test: "hello"})
        expect(cleanedString).toBe("hello");
    });

    test('resolveJsSnippet array structure', () => {
        const {resolveJsSnippet} = require('../lib');
        const cleanedString = resolveJsSnippet("# data.shop_items.map(function(item){return `<h2>${item}</h2>`})", {shop_items: ["Item 1", "Item 2", "Item 3"]})
        expect(cleanedString).toBe("<h2>Item 1</h2><h2>Item 2</h2><h2>Item 3</h2>");
    });

    test('resolvePrefabSnippet html', () => {
        const {resolvePrefabSnippet} = require('../lib');
        const {resolvedSnippet} = resolvePrefabSnippet("!html")
        expect(resolvedSnippet).toBe("<h5>Hello, World!</h5>");
    });

    test('resolvePrefabSnippet js', () => {
        const {resolvePrefabSnippet} = require('../lib');
        const {resolvedSnippet} = resolvePrefabSnippet("!javascript")
        expect(resolvedSnippet).toBe("test");
    });

    test('resolvePrefabSnippet error', () => {
        const {resolvePrefabSnippet} = require('../lib');
        expect(()=>{resolvePrefabSnippet("!lol")}).toThrow("ERROR: Could not find prefab file (Prefab: lol)");  
         
    });

    test('resolveCmdSnippet svg', () => {
        const {resolveCmdSnippet} = require('../lib');
        const resolvedSnippet = resolveCmdSnippet("?svg image1.svg image2.svg", "")
        expect(resolvedSnippet).toBe("<svg>1</svg><svg>2</svg>");
    });

    test('resolveCmdSnippet css', () => {
        const {resolveCmdSnippet} = require('../lib');
        const resolvedSnippet = resolveCmdSnippet("?css style1.css style2.css", "")
        expect(resolvedSnippet).toBe("<style>body{background-color: red;}h2{color: blue;}</style>");
    });

    test('resolveCmdSnippet sass', () => {
        const {resolveCmdSnippet} = require('../lib');
        const resolvedSnippet = resolveCmdSnippet("?sass style1.css style2.css", "")
        expect(resolvedSnippet).toBe("<style>h1{color: aquablue;}h1{color: aquablue;}</style>");
    });

    test('resolveCmdSnippet js', () => {
        const {resolveCmdSnippet} = require('../lib');
        const resolvedSnippet = resolveCmdSnippet("?js script1.js script2.js", "")
        expect(resolvedSnippet).toBe("<script>alert('hello');document.getElementById('test').innerHTML = 'lol'</script>");
    });

    test('resolveCmdSnippet img', () => {
        const {resolveCmdSnippet} = require('../lib');
        const resolvedSnippet = resolveCmdSnippet("?img image.jpg", "")
        expect(resolvedSnippet).toBe('<picture class="undefined" id="undefined"><source srcset="image.webp" type="image/webp"><source srcset="image.jp2" type="image/jp2"><img srcset="image.jpg" alt="undefined"></picture>');
    });

    test('resolveCmdSnippet img', () => {
        const {resolveCmdSnippet} = require('../lib');
        const resolvedSnippet = resolveCmdSnippet("?img image.jpg alt id class", "")
        expect(resolvedSnippet).toBe('<picture class="class" id="id"><source srcset="image.webp" type="image/webp"><source srcset="image.jp2" type="image/jp2"><img srcset="image.jpg" alt="alt"></picture>');
    });

    test('resolveCmdSnippet wrong arg', () => {
        const {resolveCmdSnippet} = require('../lib');
        expect(()=>{resolveCmdSnippet("?lol image.jpg", "")}).toThrow("Could not resolve file-snippet! The given filetype is not supported!");
    });

    test('resolveSnippets', () => {
        const {resolveSnippets} = require('../lib');
        expect(resolveSnippets(["?css style1.css", "title"], {title: "test"}, "", "")).toEqual(["<style>body{background-color: red;}</style>", "test"]);
    });
});

describe('Helper Functions', () => {
    test('cleanComments', () => {
        const {cleanComments} = require('../lib');
        const cleanedString = cleanComments("Hello, World{# Test #}!")
        expect(cleanedString).toBe("Hello, World!");
    });
    test('occurrences', () => {
        const {occurrences} = require('../lib');
        const ocs = occurrences("Hello World! Hello Internet!", "Hello")
        expect(ocs).toBe(2);
    });
    test('cutString', () => {
        const {cutString} = require('../lib');
        const cleanedString = cutString("Hello World{{this is a test}}lol", "{{", "}}")
        expect(cleanedString).toEqual(["Hello World", "this is a test", "lol"]);
    });
    test('seperateSnippets', () => {
        const {seperateSnippets} = require('../lib');
        const [plainHTMLSnippets, codeSnippets] = seperateSnippets("{{lol}}test{{test}}", "{{", "}}")
        expect(plainHTMLSnippets).toEqual(["", "test", ""]);
        expect(codeSnippets).toEqual(["lol", "test"]);
    });
    test('noramlizeJsReturns null', () => {
        const {noramlizeJsReturns} = require('../lib');
        const result = noramlizeJsReturns(null)
        expect(result).toEqual("");
    });
    test('noramlizeJsReturns string', () => {
        const {noramlizeJsReturns} = require('../lib');
        const result = noramlizeJsReturns("test")
        expect(result).toEqual("test");
    });
    test('noramlizeJsReturns array', () => {
        const {noramlizeJsReturns} = require('../lib');
        const result = noramlizeJsReturns(["test1", "test2", "test3"])
        expect(result).toEqual("test1test2test3");
    });
    test('noramlizeJsReturns error', () => {
        const {noramlizeJsReturns} = require('../lib');
        expect(()=>{noramlizeJsReturns(true)}).toThrow("Prefab could not be resolved! Only strings or array of strings are allowed as return values!");
    });
    test('decodePrefabArgs', () => {
        const {decodePrefabArgs} = require('../lib');
        const result = decodePrefabArgs(['', '"test"', 'test'], {test: "lol"})
        expect(result).toEqual(["", 'test', 'lol']);
    });
    // test('getImportedFiles', () => {
    //     const {getImportedFiles} = require('../lib');
    //     const result = getImportedFiles()
    //     expect(result).toEqual(["image1.svg", "image2.svg", "style1.css", "style2.css", "style1.sass", "script1.js", "script2.js", "prefabs\\html\\prefab.html"]);
    // });
    // test('getImportedImages', () => {
    //     const {getImportedImages} = require('../lib');
    //     const result = getImportedImages()
    //     expect(result).toEqual(["image.jpg"]);
    // });
    // test('getCurrentSnippet', () => {
    //     const {getCurrentSnippet} = require('../lib');
    //     const result = getCurrentSnippet()
    //     expect(result).toEqual("title");
    // });

})

describe('Transpile Tests', () => {
    test('first', () => {
        const {transpile} = require('../lib');
        const transpiledString = transpile('<!DOCTYPE html><html><head><title>{{title}}</title></head><body><h1>{{title}}</h1>{{ # data.shop_items.map((item)=>{return "<h2>${item}</h2>";})}}{{!html}}{{!javascript}}</body></html>', {"title": "STATICC Webpage","shop_items": ["Item 1", "Item 2", "Item 3"]})
        expect(transpiledString).toBe("<!DOCTYPE html><html><head><title>STATICC Webpage</title></head><body><h1>STATICC Webpage</h1><h2>${item}</h2><h2>${item}</h2><h2>${item}</h2><h5>Hello, World!</h5>test</body></html>");
    });
})