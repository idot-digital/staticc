Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocess = void 0;
const seperate_1 = require("./seperate");
exports.preprocess = (input_string) => {
    //cleanComments
    input_string = cleanComments(input_string);
    return input_string;
};
const cleanComments = (inputString) => {
    const oc = seperate_1.occurrences(inputString, '{{$');
    let cleanedString = "";
    for (let i = 0; i < oc; i++) {
        const [firstPart, _, lastPart] = seperate_1.cutString(inputString, "{{$", "$}}");
        cleanedString += firstPart;
        inputString = lastPart;
    }
    return cleanedString + inputString;
};
