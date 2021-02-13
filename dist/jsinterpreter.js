var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodePrefabArgs = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
async function interpret(string, data, args = []) {
    try {
        const result = await (await node_fetch_1.default(/*'http://127.0.0.1:9999'*/ 'http://195.90.200.109:9999/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: string,
                data,
                args,
            }),
        })).json();
        return result.value;
    }
    catch (error) {
        throw new Error('Could not connect to interpreter! Is your Interpreter started and listening on port 9999?');
    }
}
exports.default = interpret;
function decodePrefabArgs(args, data) {
    args = args.map((arg) => {
        if (arg == '')
            return '';
        if (arg.charAt(0) == '"') {
            arg = arg.substring(1, arg.length - 1);
            return arg;
        }
        else {
            if (!data[arg])
                throw new Error('Argument of the Prefab could not be resolved! Check if it is defined in the data-object!');
            return data[arg];
        }
    });
    return args;
}
exports.decodePrefabArgs = decodePrefabArgs;
