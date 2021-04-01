import { InterpretingMode, JsInterpreter } from './classes/JsInterpreter';
declare class Transpiler {
    input_string: string;
    data: any;
    path: string;
    start_seperator: string;
    end_seperator: string;
    loadedFiles: string[];
    filesToCopy: {
        from: string;
        to: string;
    }[];
    errorMsg: string;
    plainHTMLSnippets: string[];
    resolvedSnippets: string[];
    interpreter: JsInterpreter;
    argParams: any;
    constructor(input_string: string, data: any, path: string, interpretingMode: InterpretingMode, start_seperator?: string, end_seperator?: string, argParams?: any);
    transpile(): Promise<string>;
    getErrorAsHtml(): string;
    recombine(): void;
}
export default Transpiler;
