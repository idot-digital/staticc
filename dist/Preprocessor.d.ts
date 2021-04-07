export default class Preprocessor {
    input_string: string;
    loadedFiles: string[];
    linkedFiles: {
        from: string;
        to: string;
    }[];
    path: string;
    constructor(input_string: string);
    preprocess(path: string): string;
    cleanComments(): void;
    extractLinkedFiles(): Error | undefined;
}
