import Snippet from './Snippet';
import Transpiler from '../Transpiler';
declare class FileInlineSnippet extends Snippet {
    fileContents: string;
    fileIdentifier: string;
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler);
    resolve(data: any): Promise<void>;
    readFile(): Promise<void>;
}
export default FileInlineSnippet;
