import Transpiler from '../Transpiler';
import { PrefabSnippet } from './PrefabSnippet';
declare class JsPrefabSnippet extends PrefabSnippet {
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler);
    resolve(data: any): Promise<void>;
    interpret(data: any): Promise<string>;
}
export default JsPrefabSnippet;
