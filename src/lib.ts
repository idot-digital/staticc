import pathLib from 'path'
import { glob } from 'glob'
import Transpiler from './Transpiler'
import { minify } from 'html-minifier'
import { FileManager } from './FileManager'
import { InterpretingMode } from './legacy/JsInterpreter'
import { Timer } from './Timer'
import { readFileFromDisk, saveFileToDisk } from './internal_lib'

function minifyHTML(html_String: string) {
    return minify(html_String, {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
    })
}

function getAllBuildableFiles(globPath: string) {
    return glob.sync(`${globPath}/**/*.html`)
}

async function build(data: object, options: BuildOptions = defaultBuildOptions) {
    const buildOptions: BuildOptionsStrict = { ...defaultBuildOptions, ...options }
    const buildableFiles = getAllBuildableFiles(buildOptions.sourceFolder)
    const fileManager = new FileManager()
    fileManager.ignoreFiles(buildableFiles)
    if (buildOptions.filesToBuild.length === 0) buildOptions.filesToBuild = buildableFiles

    console.info('\nstarting build!')

    await Promise.all(
        buildOptions.filesToBuild.map(async (file) => {
            console.info(file)
            const timer = new Timer(`Finished ${file} after`)
            await transpileFile(file, data, fileManager, buildOptions)
            timer.print()
        })
    )
    fileManager.execute()
}

async function transpileFile(file: string, data: any, fileManager: FileManager, buildOptions: BuildOptionsStrict) {
    console.info('Building: ' + file)
    const successful = await generateNewFile(
        file,
        await changeFilenameFromSrcToDist(file, buildOptions.sourceFolder, buildOptions.buildFolder, async (name) => {
            const transpiler = new Transpiler(name, data, file, buildOptions.interpretingMode, buildOptions.baseFolder)
            let transpiledName = await transpiler.transpile()
            if (transpiler.errorMsg !== '') {
                console.error(transpiler.errorMsg)
                return name
            }
            return transpiledName
        }),
        async (content: string, build_prod: boolean): Promise<string> => {
            const transpiler = new Transpiler(content, data, file, buildOptions.interpretingMode, buildOptions.baseFolder)
            let transpiledCode = await transpiler.transpile()
            if (transpiler.errorMsg !== '') {
                console.error(transpiler.errorMsg)
                transpiledCode = transpiler.getErrorAsHtml()
            }
            fileManager.copyFiles(transpiler.filesToCopy)
            fileManager.ignoreFiles(transpiler.loadedFiles)
            if (build_prod) transpiledCode = minifyHTML(transpiledCode)
            return transpiledCode
        },
        buildOptions.productive
    )

    if (!successful) {
        console.error(file + ' could not be transpiled!')
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

type globPath = string

interface BuildOptions {
    productive?: boolean
    interpretingMode?: InterpretingMode
    filesToBuild?: string[]
    sourceFolder?: string
    buildFolder?: string
    baseFolder?: string
}

interface BuildOptionsStrict {
    productive: boolean
    interpretingMode: InterpretingMode
    filesToBuild: string[]
    sourceFolder: string
    buildFolder: string
    baseFolder: string
}

const defaultBuildOptions: BuildOptionsStrict = {
    productive: true,
    interpretingMode: InterpretingMode.experimental,
    filesToBuild: [],
    sourceFolder: 'src',
    buildFolder: 'dist',
    baseFolder: '',
}

async function changeFilenameFromSrcToDist(file: string, sourceFolder: string, buildFolder: string, nameResolverFn = async (basename: string): Promise<string> => basename) {
    const fileEnding = pathLib.extname(file)
    const basename = pathLib.basename(file, fileEnding)
    const dirname = pathLib.dirname(file)

    const newDirname = dirname.replace(sourceFolder, buildFolder)
    const newBasename = await nameResolverFn(basename)

    return pathLib.join(newDirname, newBasename + fileEnding)
}

export { Transpiler, minifyHTML, build, InterpretingMode, FileManager, getAllBuildableFiles }
