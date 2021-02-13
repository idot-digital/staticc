var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDevServer = void 0;
const open_1 = __importDefault(require("open"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const tiny_lr_1 = __importDefault(require("tiny-lr"));
const connect_1 = __importDefault(require("connect"));
const chokidar_1 = __importDefault(require("chokidar"));
const build_1 = require("./build");
const serve_static_1 = __importDefault(require("serve-static"));
async function startDevServer(data_json_path, interpretingMode) {
    const TinyLr = tiny_lr_1.default();
    const usedFiles = [];
    await build_1.build(false, data_json_path, interpretingMode);
    let blockBuild = true;
    setTimeout(async () => {
        blockBuild = false;
    }, 1000);
    const tinylrPort = 7777;
    const httpPort = 8888;
    const webserver = connect_1.default();
    webserver.use(morgan_1.default('dev'));
    webserver.use((req, res, next) => {
        if (!req.originalUrl)
            next();
        let url = req.originalUrl;
        if (url.indexOf('/') == 0)
            url = url.replace('/', '');
        usedFiles.push(path_1.default.join(__dirname, 'dist', url));
        next();
    });
    webserver.use(require('connect-livereload')({
        port: tinylrPort,
        serverPort: httpPort,
    }));
    webserver.use(serve_static_1.default('./dist'));
    TinyLr.listen(tinylrPort);
    http_1.default.createServer(webserver).listen(httpPort);
    chokidar_1.default.watch('./src/').on('all', async (_, filepath) => {
        console.log(filepath);
        if (!blockBuild)
            await await build_1.build(false, data_json_path, interpretingMode, [filepath]);
        TinyLr.changed({
            body: {
                files: [path_1.default.resolve(__dirname + '/' + filepath)],
            },
        });
    });
    chokidar_1.default.watch('./prefabs/').on('all', async () => {
        if (!blockBuild)
            await await build_1.build(false, data_json_path, interpretingMode);
        TinyLr.changed({
            body: {
                files: usedFiles,
            },
        });
    });
    chokidar_1.default.watch('./data.json').on('all', async () => {
        if (!blockBuild)
            await await build_1.build(false, data_json_path, interpretingMode);
        TinyLr.changed({
            body: {
                files: usedFiles,
            },
        });
    });
    console.log('Development Server started!');
    open_1.default('http://127.0.0.1:8888');
}
exports.startDevServer = startDevServer;
