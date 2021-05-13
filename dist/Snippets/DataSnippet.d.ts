import Transpiler from '../Transpiler';
import Snippet from './Snippet';
export declare class DataSnippet extends Snippet {
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler);
    resolve(data: any): Promise<void>;
}
export declare const dataLookup: (data: any, selector: string) => any;
