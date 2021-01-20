import { _transpile } from '../transpile'
import pathLib from 'path'
import wait from '../wait'
class Snippet {
    input_string: string
    result: string
    filepaths: string[]
    constructor(input_string: string) {
        this.input_string = input_string
        this.result = ''
        this.filepaths = []
        this.cleanSnippetString()
    }
    async resolve(_: any): Promise<void> {
        await wait()
    }
    toString(): string {
        return this.result
    }
    getLoadedFiles(): string[] {
        return this.filepaths
    }
    cleanSnippetString(): void{
        this.input_string = replaceAll(this.input_string, "\n", "")
    }
    async postProcess(data: any): Promise<void>{
        const {htmlString, loadedFiles} = await _transpile(this.result, data, "", pathLib.dirname(this.filepaths[0] || "src"))
        this.filepaths = [...this.filepaths, ...loadedFiles]
        this.result = htmlString
        return
    }
}

const replaceAll = (string: string, searchValue : string, replaceValue: string) =>{
    while(string.indexOf(searchValue) !== -1){
        string = string.replace(searchValue, replaceValue)
    }
    return string
}


export default Snippet
