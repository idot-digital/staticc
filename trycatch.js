export default function trycatch(fn, ...args) {
    try {
        return [null, fn(...args)];
    }
    catch (error) {
        return [error, null];
    }
}
