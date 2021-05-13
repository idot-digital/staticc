import Transpiler from '../Transpiler';
declare class Snippet {
    input_string: string;
    result: string;
    lineNumber: Number;
    referencePath: string;
    transpiler: Transpiler;
    filepath: string;
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler);
    resolve(data: any): Promise<void>;
    toString(): string;
    cleanSnippetString(): void;
    postProcess(data: any, resolvedArgs?: any): Promise<void>;
}
export default Snippet;
