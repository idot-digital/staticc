import { occurrences } from '../seperate'

export default function cleanComments(input_string: string) {
    const oc = occurrences(input_string, '/~')
    let cleanedString = ''
    for (let i = 0; i < oc; i++) {
        const [firstPart, _, lastPart] = oldCutString(input_string, '/~', '~/')
        cleanedString += firstPart
        input_string = lastPart
    }
    return cleanedString + input_string
}

const oldCutString = (input_string: string, start_seperator: string, end_seperator: string): string[] => {
    const openingIndex: number = input_string.indexOf(start_seperator)
    const closingIndex: number = input_string.indexOf(end_seperator)
    const firstPart: string = input_string.slice(0, openingIndex)
    const middlePart: string = input_string.slice(openingIndex + start_seperator.length, closingIndex)
    const lastPart: string = input_string.slice(closingIndex + end_seperator.length)
    return [firstPart, middlePart, lastPart]
}
