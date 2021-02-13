import { glob } from 'glob'
import { InterpretingMode } from '../classes/JsInterpreter'
import { readFileFromDisk } from '../lib'
import Transpiler from '../Transpiler'
import { FileManager } from './FileManager'
import { changeFilenameFromSrcToDist, generateNewFile, minifyHTML } from './lib'
import { Timer } from './timer'

function getAllBuildableFiles() {
    return glob.sync('src/**/*.html')
}

export async function build(build_prod: boolean, data_json_path: string, interpretingMode: InterpretingMode, filesToBuild: string[] = []) {
    const data = JSON.parse(await readFileFromDisk(data_json_path))
    const buildableFiles = getAllBuildableFiles()
    const fileManager = new FileManager()
    console.log(filesToBuild)
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

export async function transpileFile(file: string, data: any, build_prod: boolean, interpretingMode: InterpretingMode, fileManager: FileManager) {
    console.log('Building: ' + file)
    const successful = await generateNewFile(
        file,
        changeFilenameFromSrcToDist(file),
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
