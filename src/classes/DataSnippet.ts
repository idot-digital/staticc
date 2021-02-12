import Snippet from './Snippet'

class DataSnippet extends Snippet {
    constructor(input_string: string, lineNumber: Number, path: string, experimental: boolean) {
        super(input_string, lineNumber, path, experimental)
    }
    async resolve(data: any): Promise<void> {
        const value = dataLookup(data, this.input_string)
        if (value.constructor === Object) {
            throw Error('Could not resolve data-snippet. The requested value is an object!')
        } else if (value.constructor === Array) {
            throw Error('Could not resolve data-snippet. The requested value is an array!')
        }
        this.result = value
        await this.postProcess(data)
    }
}

const dataLookup = (data: any, selector: string) => {
    const snippetParts = selector.split('.')
    try {
        snippetParts.forEach((snippetPart) => {
            data = data[snippetPart]
            if (!data) throw new Error()
        })
    } catch (error) {
        throw Error('Could not resolve data-snippet. The requested value is undefined!')
    }
    return data
}

export { DataSnippet, dataLookup }
