import fetch from 'node-fetch'
export default async function interpret(string: string, data: any, args: any = []): Promise<string> {
    const result = await (
        await fetch('http://127.0.0.1:9999', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: string,
                data,
                args,
            }),
        })
    ).json()
    return result.value
}

export function decodePrefabArgs(args: string[], data: any): string[] {
    args = args.map((arg: string) => {
        if (arg == '') return ''
        if (arg.charAt(0) == '"') {
            arg = arg.substring(1, arg.length - 1)
            return arg
        } else {
            if (!data[arg]) throw new Error('Argument of the Prefab could not be resolved! Check if it is defined in the data-object!')
            return data[arg] as string
        }
    })
    return args
}