interface FileCopyObject {
    from: string;
    to: string;
}
export declare class FileManager {
    filesToIgnore: string[];
    filesToCopy: FileCopyObject[];
    constructor();
    copyFiles(files: FileCopyObject[]): void;
    ignoreFiles(files: string[]): void;
    execute(): void;
}
export declare function changeFilenameFromSrcToDist(file: string, nameResolverFn?: (basename: string) => Promise<string>): Promise<string>;
export {};
