import Transpiler from './Transpiler';
import { FileManager } from './FileManager';
import { InterpretingMode } from './classes/JsInterpreter';
declare function minifyHTML(html_String: string): string;
declare function getAllBuildableFiles(globPath: string): string[];
declare function build(data: object, options?: BuildOptions): Promise<void>;
declare function transpileFile(file: string, data: any, fileManager: FileManager, buildOptions: BuildOptionsStrict): Promise<void>;
interface BuildOptions {
    productive?: boolean;
    interpretingMode?: InterpretingMode;
    filesToBuild?: string[];
    sourceFolder?: string;
    buildFolder?: string;
}
interface BuildOptionsStrict {
    productive: boolean;
    interpretingMode: InterpretingMode;
    filesToBuild: string[];
    sourceFolder: string;
    buildFolder: string;
}
declare const helper: {
    getAllBuildableFiles: typeof getAllBuildableFiles;
    transpileFile: typeof transpileFile;
};
export { Transpiler, minifyHTML, build, InterpretingMode, FileManager, helper };
