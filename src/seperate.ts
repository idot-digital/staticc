export const seperate = (staticcString: string, start_seperator: string, end_seperator: string): string[][] => {
    const oc: number = _occurrences(staticcString, start_seperator)
    const plainHTMLSnippets: string[] = []
    const codeSnippets: string[] = []
    for (let i = 0; i < oc; i++) {
        const [firstPart, middlePart, lastPart] = _cutString(staticcString, start_seperator, end_seperator)
        plainHTMLSnippets.push(firstPart)
        codeSnippets.push(middlePart)
        staticcString = lastPart
    }
    plainHTMLSnippets.push(staticcString)
    return [plainHTMLSnippets, codeSnippets]
}

export const _occurrences = (string: string, subString: string): number => {
    return string.split(subString).length - 1
}

export const _cutString = (input_string: string, start_seperator: string, end_seperator: string): string[] => {
    const openingIndex: number = input_string.indexOf(start_seperator)
    const cloringIndex: number = input_string.indexOf(end_seperator)
    const firstPart: string = input_string.slice(0, openingIndex)
    const middlePart: string = input_string.slice(openingIndex + 2, cloringIndex)
    const lastPart: string = input_string.slice(cloringIndex + 2)
    return [firstPart, middlePart, lastPart]
}
