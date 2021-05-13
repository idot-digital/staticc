export default class FileLinker {
    string: string;
    path: string;
    loadedFiles: string[];
    linkedFiles: {
        from: string;
        to: string;
    }[];
    constructor(string: string, path: string);
    link(): Error | undefined;
}
