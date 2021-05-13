Object.defineProperty(exports, "__esModule", { value: true });
const seperate_1 = require("../seperate");
function cleanComments(input_string) {
    const oc = seperate_1.occurrences(input_string, '/~');
    let cleanedString = '';
    for (let i = 0; i < oc; i++) {
        const [firstPart, _, lastPart] = oldCutString(input_string, '/~', '~/');
        cleanedString += firstPart;
        input_string = lastPart;
    }
    return cleanedString + input_string;
}
exports.default = cleanComments;
const oldCutString = (input_string, start_seperator, end_seperator) => {
    const openingIndex = input_string.indexOf(start_seperator);
    const closingIndex = input_string.indexOf(end_seperator);
    const firstPart = input_string.slice(0, openingIndex);
    const middlePart = input_string.slice(openingIndex + start_seperator.length, closingIndex);
    const lastPart = input_string.slice(closingIndex + end_seperator.length);
    return [firstPart, middlePart, lastPart];
};
