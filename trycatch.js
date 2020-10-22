Object.defineProperty(exports, "__esModule", { value: true });
function trycatch(fn, ...args) {
    try {
        return [null, fn(...args)];
    }
    catch (error) {
        return [error, null];
    }
}
exports.default = trycatch;
