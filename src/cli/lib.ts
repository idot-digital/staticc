import { InterpretingMode } from '../classes/JsInterpreter'
import { minify } from 'html-minifier'
import sass from 'node-sass'
import fs from 'fs'
import pathLib from 'path'
import { glob } from 'glob'
import { readFileFromDisk, saveFileToDisk } from '../lib'

export function getDataJsonPath(args: string[]) {
    if (args.indexOf('-data') >= 0 || args.indexOf('-d') >= 0) {
        const index = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('-data')
        return args[index + 1]
    } else {
        return 'data.json'
    }
}

export function getInterpretingMode(args: string[]) {
    const insecure: boolean = args.indexOf('insec') >= 0 || args.indexOf('-insec') >= 0 || args.indexOf('insecure') >= 0 || args.indexOf('-insecure') >= 0
    const legacy: boolean = args.indexOf('--legacy') >= 0 || args.indexOf('-legacy') >= 0 || args.indexOf('legacy') >= 0 || args.indexOf('legacy') >= 0
    const externalDeno: boolean = args.indexOf('--externalDeno') >= 0 || args.indexOf('-extDeno') >= 0 || args.indexOf('externalDeno') >= 0 || args.indexOf('extDeno') >= 0
    const experimental: boolean = args.indexOf('exp') >= 0 || args.indexOf('-exp') >= 0 || args.indexOf('experimental') >= 0 || args.indexOf('-experimental') >= 0

    if (experimental && !externalDeno) {
        return InterpretingMode.experimental
    } else if (experimental && externalDeno) {
        return InterpretingMode.localDeno
    } else if (insecure) {
        return InterpretingMode.insecure
    } else if (legacy) {
        return InterpretingMode.legacy
    } else {
        return InterpretingMode.default
    }
}

export function minifyHTML(html_String: string) {
    return minify(html_String, {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
    })
}

export function changeFilenameFromSrcToDist(file: string) {
    return 'dist' + file.substring(3)
}

export function copyAllFiles(filter: string[]) {
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

export async function generateNewFile(readFileName: string, writeFileName: string, fn: Function, ...args: any[]) {
    const readFileContent = await readFileFromDisk(readFileName)
    let writeFileContent: string
    //file read correctly
    writeFileContent = await fn(readFileContent, ...args)
    await saveFileToDisk(writeFileName, writeFileContent)
    return true
}

export async function copyLinkedFiles(files: { from: string; to: string }[]) {
    await Promise.all(
        files.map(async (file) => {
            fs.mkdirSync(pathLib.dirname(file.to), { recursive: true })
            if (pathLib.extname(file.from) === '.sass' || pathLib.extname(file.from) === '.scss') {
                await copyAndResolveSass(file.from, file.to)
            } else {
                await fs.promises.copyFile(file.from, file.to)
            }
        })
    )
}

async function copyAndResolveSass(from: string, to: string) {
    const filecontent = await fs.promises.readFile(from, { encoding: 'utf-8' })
    try {
        const renderedSass = sass.renderSync({ data: filecontent }).css.toString()
        await fs.promises.writeFile(to.replace('.sass', '.css').replace('.scss', '.css'), renderedSass, { encoding: 'utf-8' })
    } catch (error) {
        console.error(`Rendering linked sass-file: ${from} exited with ${error.message}`)
    }
}
