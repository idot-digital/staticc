import chokidar from 'chokidar'
import connect from 'connect'
import serveStatic from 'serve-static'
import tinylr from 'tiny-lr'
import http from 'http'
import open from 'open'
import morgan from 'morgan'
import pathLib from 'path'
import { build } from './build'
import { InterpretingMode } from '../classes/JsInterpreter'

export async function startDevServer(data_json_path: string, interpretingMode: InterpretingMode) {
    const TinyLr = tinylr()
    const usedFiles: string[] = []

    await build(false, data_json_path, interpretingMode)

    let blockBuild = true
    setTimeout(async () => {
        blockBuild = false
    }, 1000)

    const tinylrPort = 7777
    const httpPort = 8888

    const webserver = connect()
    webserver.use(morgan('dev'))
    webserver.use((req, res, next) => {
        if (!req.originalUrl) next()
        let url: string = req.originalUrl as string
        if (url.indexOf('/') == 0) url = url.replace('/', '')
        usedFiles.push(pathLib.join(__dirname, 'dist', url))
        next()
    })
    webserver.use(
        require('connect-livereload')({
            port: tinylrPort,
            serverPort: httpPort,
        })
    )
    webserver.use(serveStatic('./dist'))
    TinyLr.listen(tinylrPort)
    http.createServer(webserver).listen(httpPort)

    chokidar.watch('./src/').on('all', async (_, filepath) => {
        console.log(filepath)
        if (!blockBuild) await await build(false, data_json_path, interpretingMode, [filepath])
        TinyLr.changed({
            body: {
                files: [pathLib.resolve(__dirname + '/' + filepath)],
            },
        })
    })
    chokidar.watch('./prefabs/').on('all', async () => {
        if (!blockBuild) await await build(false, data_json_path, interpretingMode)
        TinyLr.changed({
            body: {
                files: usedFiles,
            },
        })
    })
    chokidar.watch('./data.json').on('all', async () => {
        if (!blockBuild) await await build(false, data_json_path, interpretingMode)
        TinyLr.changed({
            body: {
                files: usedFiles,
            },
        })
    })
    console.log('Development Server started!')
    open('http://127.0.0.1:8888')
}
