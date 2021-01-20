import Snippet from './Snippet'

class DataSnippet extends Snippet {
    constructor(input_string: string, lineNumber: Number, path: string) {
        super(input_string, lineNumber, path)
    }
    async resolve(data: any): Promise<void> {
        let value = data
        const snippetParts = this.input_string.split('.')
        try {
            snippetParts.forEach((snippetPart) => {
                value = value[snippetPart]
                if (!value) throw new Error()
            })
        } catch (error) {
            throw Error('Could not resolve data-snippet. The requested value is undefined!')
        }
        if(value.constructor === Object){
            throw Error('Could not resolve data-snippet. The requested value is an object!')
        }else if(value.constructor === Array){
            throw Error('Could not resolve data-snippet. The requested value is an array!')
        }
        this.result = value
        await this.postProcess(data)
    }
}

export default DataSnippet
