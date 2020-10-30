export const recombine = (plainHTMLSnippets: string[], resolvedSnippets: string[]): string => {
    let result = resolvedSnippets.reduce((total: string, currentValue: string, currentIndex: number) => {
        return total + plainHTMLSnippets[currentIndex] + currentValue
    }, '')
    result += plainHTMLSnippets[plainHTMLSnippets.length - 1]
    return result
}
