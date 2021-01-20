Object.defineProperty(exports, "__esModule", { value: true });
async function wait() {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve();
        }, 0);
    });
}
exports.default = wait;
