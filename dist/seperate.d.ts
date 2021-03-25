import Snippet from './classes/Snippet';
import Transpiler from './Transpiler';
export declare const seperate: (staticcString: string, start_seperator: string, end_seperator: string, path: string, transpiler: Transpiler) => {
    plainHTMLSnippets: string[];
    codeSnippets: Snippet[];
};
export declare const occurrences: (string: string, subString: string | RegExp) => number;
export declare const cutString: (input_string: string, start_seperator: string, end_seperator: string) => string[];
export declare const classifySnippet: (snippet_string: string, path: string, lineNumber: number, transpiler: Transpiler) => Snippet;
export declare const calculateLineNumber: (totalNumberOfLines: number, middlePart: string, lastPart: string) => number;
