import Transpiler from './Transpiler';
import { FileManager } from './FileManager';
import { InterpretingMode } from './classes/JsInterpreter';
declare function minifyHTML(html_String: string): string;
declare function getAllBuildableFiles(globPath: string): string[];
declare function build(data: object, options?: BuildOptions): Promise<void>;
interface BuildOptions {
    productive?: boolean;
    interpretingMode?: InterpretingMode;
    filesToBuild?: string[];
    sourceFolder?: string;
    buildFolder?: string;
}
export { Transpiler, minifyHTML, build, InterpretingMode, FileManager, getAllBuildableFiles };
