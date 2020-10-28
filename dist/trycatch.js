Object.defineProperty(exports, "__esModule", { value: true });
exports.trycatchasync = exports.trycatch = void 0;
function trycatch(fn, ...args) {
    try {
        return [null, fn(...args)];
    }
    catch (error) {
        return [error, null];
    }
}
exports.trycatch = trycatch;
async function trycatchasync(fn, ...args) {
    try {
        const result = await fn(...args);
        return [null, result];
    }
    catch (error) {
        return [error, null];
    }
}
exports.trycatchasync = trycatchasync;
