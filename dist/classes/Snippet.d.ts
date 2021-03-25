import Transpiler from '../Transpiler';
declare class Snippet {
    input_string: string;
    result: string;
    filepaths: string[];
    lineNumber: Number;
    referencePath: string;
    filesToCopy: {
        from: string;
        to: string;
    }[];
    transpiler: Transpiler;
    constructor(input_string: string, lineNumber: Number, path: string, transpiler: Transpiler);
    resolve(data: any): Promise<void>;
    toString(): string;
    getLoadedFiles(): string[];
    cleanSnippetString(): void;
    postProcess(data: any): Promise<void>;
}
export default Snippet;
