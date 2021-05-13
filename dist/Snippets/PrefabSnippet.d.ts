import Snippet from './Snippet';
import Transpiler from '../Transpiler';
declare enum PrefabType {
    JsPrefabSnippet = 0,
    HtmlPrefabSnippet = 1
}
declare class PrefabSnippet extends Snippet {
    args: string[];
    fileContent: string;
    type: PrefabType;
    constructor(input_string: string, type: PrefabType, lineNumber: Number, path: string, transpiler: Transpiler);
    resolve(_: any): Promise<void>;
    readFile(): Promise<void>;
}
export { PrefabSnippet, PrefabType };
