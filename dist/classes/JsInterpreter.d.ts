export declare function decodePrefabArgs(args: string[], data: any, argParams?: any): string[];
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
    static createInterpreter(mode: InterpretingMode): DenoInterpreter | JsScriptInterpreter | InsecureInterpreter;
    interpret(string: string, data: any, args?: any[], argParams?: any): Promise<{
        resultString: string;
        returnArgs: any;
    }>;
}
export declare class InsecureInterpreter extends JsInterpreter {
    constructor();
    interpret(string: string, data: any, args?: any[], argParams?: any): Promise<{
        resultString: string;
        returnArgs: any;
    }>;
}
export declare class JsScriptInterpreter extends JsInterpreter {
    modulePath: any;
    constructor();
    interpret(codeString: string, data: any, args?: any[], argParams?: any): Promise<{
        resultString: string;
        returnArgs: any;
    }>;
}
export declare class DenoInterpreter extends JsInterpreter {
    url: string;
    constructor(remote: boolean);
    interpret(string: string, data: any, args?: any[], argParams?: any): Promise<{
        resultString: string;
        returnArgs: any;
    }>;
}
export declare function babelTranspile(code: string): string;
export declare function noramlizeJsReturns(interpreterResult: any): string;
