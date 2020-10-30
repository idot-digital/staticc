export function trycatch(fn: Function, ...args: any): [null | Error, any] {
    try {
        return [null, fn(...args)]
    } catch (error) {
        return [error, null]
    }
}

export async function trycatchasync(fn: Function, ...args: any): Promise<[null | Error, any]> {
    try {
        const result = await fn(...args)
        return [null, result]
    } catch (error) {
        return [error, null]
    }
}
