export class Timer {
    name: string
    startTime: number
    endTime: number
    constructor(name: string) {
        this.name = name
        this.startTime = Date.now()
        this.endTime = Date.now()
    }
    print() {
        this.endTime = Date.now()
        console.log(`${this.name} ${this.endTime - this.startTime} ms`)
    }
}
