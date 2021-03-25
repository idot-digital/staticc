export declare function decodePrefabArgs(args: string[], data: any): string[];
export declare enum InterpretingMode {
    default = 0,
    experimental = 1,
    legacy = 2,
    remoteDeno = 3,
    localDeno = 4,
    jsScript = 5,
    insecure = 6
}
export declare class JsInterpreter {
    interpretingMode: InterpretingMode;
    constructor();
    static createInterpreter(mode: InterpretingMode): JsScriptInterpreter | DenoInterpreter | InsecureInterpreter;
    interpret(string: string, data: any, args?: any[]): Promise<string>;
}
export declare class InsecureInterpreter extends JsInterpreter {
    constructor();
    interpret(string: string, data: any, args?: any[]): Promise<string>;
}
export declare class JsScriptInterpreter extends JsInterpreter {
    modulePath: any;
    constructor();
    interpret(codeString: string, data: any, args?: any[]): Promise<string>;
}
export declare class DenoInterpreter extends JsInterpreter {
    url: string;
    constructor(remote: boolean);
    interpret(string: string, data: any, args?: any[]): Promise<string>;
}
export declare function babelTranspile(code: string): string;
export declare function noramlizeJsReturns(interpreterResult: any): string;
