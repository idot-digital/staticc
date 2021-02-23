import { glob } from 'glob'
import { Timer } from './timer'
import { minify } from 'html-minifier'
import Transpiler from '../Transpiler'
import { readFileFromDisk, saveFileToDisk } from '../lib'
import { InterpretingMode } from '../classes/JsInterpreter'
import { FileManager, changeFilenameFromSrcToDist } from './FileManager'

export async function build(build_prod: boolean, data: object, interpretingMode: InterpretingMode, filesToBuild: string[] = []) {
    const buildableFiles = getAllBuildableFiles()
    const fileManager = new FileManager()
    fileManager.ignoreFiles(buildableFiles)
    if (filesToBuild.length === 0) filesToBuild = buildableFiles

    console.log('\nstarting build!')

    await Promise.all(
        filesToBuild.map(async (file) => {
            console.log(file)
            const timer = new Timer(`Finished ${file} after`)
            await transpileFile(file, data, build_prod, interpretingMode, fileManager)
            timer.print()
        })
    )

    fileManager.execute()
}

async function transpileFile(file: string, data: any, build_prod: boolean, interpretingMode: InterpretingMode, fileManager: FileManager) {
    console.log('Building: ' + file)
    const successful = await generateNewFile(
        file,
        await changeFilenameFromSrcToDist(file, async (name) => {
            const transpiler = new Transpiler(name, data, file, interpretingMode)
            let transpiledName = await transpiler.transpile()
            if (transpiler.errorMsg !== '') {
                console.log(transpiler.errorMsg)
                return name
            }
            return transpiledName
        }),
        async (content: string, build_prod: boolean): Promise<string> => {
            const transpiler = new Transpiler(content, data, file, interpretingMode)
            let transpiledCode = await transpiler.transpile()
            if (transpiler.errorMsg !== '') {
                console.log(transpiler.errorMsg)
                transpiledCode = transpiler.getErrorAsHtml()
            }
            fileManager.copyFiles(transpiler.filesToCopy)
            fileManager.ignoreFiles(transpiler.loadedFiles)
            if (build_prod) transpiledCode = minifyHTML(transpiledCode)
            return transpiledCode
        },
        build_prod
    )

    if (!successful) {
        console.log(file + ' could not be transpiled!')
    }
}

function minifyHTML(html_String: string) {
    return minify(html_String, {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
    })
}

async function generateNewFile(readFileName: string, writeFileName: string, fn: Function, ...args: any[]) {
    const readFileContent = await readFileFromDisk(readFileName)
    let writeFileContent: string
    //file read correctly
    writeFileContent = await fn(readFileContent, ...args)
    await saveFileToDisk(writeFileName, writeFileContent)
    return true
}

export function getAllBuildableFiles() {
    return glob.sync('src/**/*.html')
}

export async function readDataJson(data_json_path: string) {
    return JSON.parse(await readFileFromDisk(data_json_path))
}
