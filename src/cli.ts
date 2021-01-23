#! /usr/bin/env node

import { spawn } from 'cross-spawn'
import { execSync } from 'child_process'
import { readFileFromDisk, saveFileToDisk } from './lib'
import { glob } from 'glob'
import fs from 'fs'
import { minify } from 'html-minifier'
import lite_server from 'lite-server'
import chokidar from 'chokidar'
import sass from 'node-sass'

import pathLib from 'path'
import Transpiler from './Transpiler'

const args = process.argv.slice(2)

//check which args have been given
const help: boolean = args.indexOf('--help') >= 0 || args.indexOf('-h') >= 0 || args.indexOf('help') >= 0
const version: boolean = args.indexOf('version') >= 0 || args.indexOf('v') >= 0 || args.indexOf('-v') >= 0
const build_dev: boolean = args.indexOf('build-dev') >= 0
const build_prod: boolean = args.indexOf('build') >= 0
const serve: boolean = args.indexOf('serve') >= 0
const init: boolean = args.indexOf('init') >= 0
const data_json_override: boolean = args.indexOf('-data') >= 0 || args.indexOf('-d') >= 0

//set/ override the path of the data file
let data_json_path: string = 'data.json'
if (data_json_override) {
    const index = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('-data')
    data_json_path = args[index + 1]
}

let alreadyLoadedFiles: string[] = []
let filesToCopy: { from: string; to: string }[] = []

if (version) {
    const package_info = require('../package.json')
    console.log(package_info.version)
} else if (help) {
    const helpString =
        '\n\nUsage: staticc <command>\n\nwhere: <command> is one of:\nv                alias for version\nversion          shows the version of the staticc-cli\nbuild            creates a production build of all html files\nbuild-dev        creates a development build of all html files\nserve            starts a development webserver\ninit             initializes a new staticc project\n\nVisit https://github.com/idot-digital/staticc to learn more about staticc.'
    console.log(helpString)
} else if (build_dev || build_prod) {
    //build
    ;(async () => {
        await build(build_prod)
    })()
} else if (serve) {
    //start server
    startDevServer()
} else if (init) {
    //init
    ;(async () => {
        console.log('\n\nInitializing staticc project!\n\n')
        const example_project = require('./example_project')
        Object.keys(example_project.files).forEach(async (filepath) => {
            try {
                await saveFileToDisk(filepath, example_project.files[filepath])
            } catch (error) {
                console.log(error)
            }
        })
        let child
        try {
            execSync('yarn -v')
            child = spawn('yarn', ['install'])
        } catch (error) {
            //yarn not installed
            try {
                child = spawn('npm', ['install'])
            } catch (error) {
                if (error) console.error('Could not install babel and its packages.')
                return
            }
        }
        child.stdout.setEncoding('utf8')
        child.stdout.on('data', (chunk: any) => {
            console.log(chunk)
        })
        child.on('close', () => {
            console.log('Finished!')
        })
    })()
} else {
    console.log('Use -h or --help for help!')
}

async function build(build_prod: boolean) {
    const data = JSON.parse(await readFileFromDisk(data_json_path))
    console.log('\nstarting build!')
    const HTMLfiles = glob.sync('src/**/*.html')
    await Promise.all(
        HTMLfiles.map(async (file) => {
            await transpileFile(file, data, build_prod)
        })
    )
    //exclude already imported files
    const inlinedFiles: string[] = alreadyLoadedFiles
    copyAllFiles([...HTMLfiles, ...inlinedFiles])
    copyLinkedFiles(filesToCopy)
}

function startDevServer() {
    process.title = 'lite-server'
    //@ts-ignore
    process.argv = ['', '', '-c', pathLib.join(require.main.path.replace('dist', ''), 'bs-config.json')]
    lite_server.server()
    console.log('Staticc server listening on http://localhost:8888/')
    let timeoutHandler: NodeJS.Timeout
    chokidar.watch('./', { ignored: /dist/ }).on('all', (event, path) => {
        clearTimeout(timeoutHandler)
        timeoutHandler = setTimeout(async () => {
            //reload server
            await build(false)
        }, 100)
    })
}

async function transpileFile(file: string, data: any, build_prod: boolean) {
    console.log('Building: ' + file)
    const successful = await generateNewFile(
        file,
        changeFilenameFromSrcToDist(file),
        async (content: string, build_prod: boolean): Promise<string> => {
            const transpiler = new Transpiler(content, data, file)
            let transpiledCode = await transpiler.transpile()
            if(transpiler.errorMsg !== ""){
                console.log(transpiler.errorMsg)
                transpiledCode = transpiler.getErrorAsHtml()
            }
            filesToCopy = [...filesToCopy, ...transpiler.filesToCopy]
            alreadyLoadedFiles = [...alreadyLoadedFiles, ...transpiler.loadedFiles]
            if (build_prod) transpiledCode = minifyHTML(transpiledCode)
            return transpiledCode
        },
        build_prod
    )

    if (!successful) {
        console.log(file + ' could not be transpiled!')
    }
}

async function generateNewFile(readFileName: string, writeFileName: string, fn: Function, ...args: any[]) {
    const readFileContent = await readFileFromDisk(readFileName)
    let writeFileContent: string
    //file read correctly
    writeFileContent = await fn(readFileContent, ...args)
    await saveFileToDisk(writeFileName, writeFileContent)
    return true
}

function copyAllFiles(filter: string[]) {
    const allfiles = glob.sync('src/**/*.*')
    allfiles.forEach((file) => {
        if (filter.includes(file)) return
        const newFilepath = changeFilenameFromSrcToDist(file)
        const folderpath = newFilepath
            .split('/')
            .splice(0, newFilepath.split('/').length - 1)
            .join('/')
        if (folderpath) fs.mkdirSync(folderpath, { recursive: true })
        fs.copyFileSync(file, newFilepath)
    })
}

function changeFilenameFromSrcToDist(file: string) {
    return 'dist' + file.substring(3)
}

function minifyHTML(html_String: string) {
    return minify(html_String, {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
    })
}

async function copyLinkedFiles(files: { from: string; to: string }[]) {
    await Promise.all(
        files.map(async (file) => {
            fs.mkdirSync(pathLib.dirname(file.to), { recursive: true })
            if(pathLib.extname(file.from) === ".sass" || pathLib.extname(file.from) === ".scss"){
                await copyAndResolveSass(file.from, file.to)
            }else{
                await fs.promises.copyFile(file.from, file.to)
            }
        })
    )
}

async function copyAndResolveSass(from: string, to:string){
    const filecontent = await fs.promises.readFile(from, { encoding: "utf-8"})
    try {
        const renderedSass = sass.renderSync({ data: filecontent }).css.toString()
        await fs.promises.writeFile(to.replace(".sass", ".css").replace(".scss", ".css"), renderedSass, {encoding: "utf-8"})
    } catch (error) {
        console.error(`Rendering linked sass-file: ${from} exited with ${error.message}`)
    }
}
