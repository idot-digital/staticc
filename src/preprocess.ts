import { _cutString, _occurrences } from "./seperate"

export const preprocess = (input_string: string): string => {
    //cleanComments
    input_string = cleanComments(input_string)
    return input_string
}

const cleanComments = (inputString: string) =>{
    const oc = _occurrences(inputString, '{{$')
    let cleanedString = ""
    for (let i = 0; i < oc; i++) {
        const [firstPart, _, lastPart] = _cutString(inputString, "{{$", "$}}")
        cleanedString += firstPart
        inputString = lastPart
    }
    return cleanedString + inputString
}
