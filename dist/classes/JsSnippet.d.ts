import Snippet from './Snippet';
import Transpiler from '../Transpiler';
declare class JsSnippet extends Snippet {
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler);
    resolve(data: any): Promise<void>;
    interpret(data: any): Promise<string>;
}
export default JsSnippet;
