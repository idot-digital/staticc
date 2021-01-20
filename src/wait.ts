export default async function wait(): Promise<void> {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve()
        }, 0)
    })
}
