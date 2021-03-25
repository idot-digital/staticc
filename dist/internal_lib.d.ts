export declare const readFileFromDisk: (filepath: string) => Promise<string>;
export declare function trycatchasync(fn: Function, ...args: any): Promise<[null | Error, any]>;
export declare const replaceAll: (string: string, searchValue: string, replaceValue: string) => string;
