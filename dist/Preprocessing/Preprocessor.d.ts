import Transpiler from '../Transpiler';
import FileLinker from './FileLinker';
export default class Preprocessor {
    input_string: string;
    path: string;
    fileLinker: FileLinker | null;
    transpiler: Transpiler;
    constructor(input_string: string, transpiler: Transpiler);
    preprocess(path: string): string;
}
