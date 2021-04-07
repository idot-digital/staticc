Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
class Timer {
    constructor(name) {
        this.name = name;
        this.startTime = Date.now();
        this.endTime = Date.now();
    }
    print() {
        this.endTime = Date.now();
        console.info(`${this.name} ${this.endTime - this.startTime} ms`);
    }
}
exports.Timer = Timer;
