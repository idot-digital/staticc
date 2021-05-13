import Transpiler from '../Transpiler';
import { PrefabSnippet } from './PrefabSnippet';
declare class HtmlPrefabSnippet extends PrefabSnippet {
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler);
    resolve(data: any): Promise<void>;
}
export default HtmlPrefabSnippet;
