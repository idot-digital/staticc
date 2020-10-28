Object.defineProperty(exports, "__esModule", { value: true });
exports.recombine = void 0;
exports.recombine = (plainHTMLSnippets, resolvedSnippets) => {
    let result = resolvedSnippets.reduce((total, currentValue, currentIndex) => {
        return total + plainHTMLSnippets[currentIndex] + currentValue;
    }, '');
    result += plainHTMLSnippets[plainHTMLSnippets.length - 1];
    return result;
};
