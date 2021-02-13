#! /usr/bin/env node
Object.defineProperty(exports, "__esModule", { value: true });
exports.printHelpText = exports.printVersion = void 0;
const cross_spawn_1 = require("cross-spawn");
const build_1 = require("./cli/build");
const init_1 = require("./cli/init");
const devserver_1 = require("./cli/devserver");
const JsInterpreter_1 = require("./classes/JsInterpreter");
const args = process.argv.slice(2);
//check which args have been given
const help = args.indexOf('--help') >= 0 || args.indexOf('-h') >= 0 || args.indexOf('help') >= 0;
const version = args.indexOf('version') >= 0 || args.indexOf('v') >= 0 || args.indexOf('-v') >= 0;
const build_dev = args.indexOf('build-dev') >= 0;
const build_prod = args.indexOf('build') >= 0;
const serve = args.indexOf('serve') >= 0;
const init = args.indexOf('init') >= 0;
const startDeno = args.indexOf('--deno') >= 0 || args.indexOf('-deno') >= 0 || args.indexOf('runDeno') >= 0 || args.indexOf('runDeno') >= 0;
const data_json_path = getDataJsonPath(args);
const interpretingMode = getInterpretingMode(args);
if (version) {
    printVersion();
}
else if (help) {
    printHelpText();
}
else if (build_dev || build_prod) {
    build_1.build(build_prod, data_json_path, interpretingMode);
}
else if (serve) {
    devserver_1.startDevServer(data_json_path, interpretingMode);
}
else if (init) {
    init_1.initializeProject();
}
else if (startDeno) {
    cross_spawn_1.spawn('deno run --allow-net http://kugelx.de/deno.ts', { stdio: 'inherit' });
}
else {
    console.log('Use -h or --help for help!');
}
function getInterpretingMode(args) {
    const insecure = args.indexOf('insec') >= 0 || args.indexOf('-insec') >= 0 || args.indexOf('insecure') >= 0 || args.indexOf('-insecure') >= 0;
    const legacy = args.indexOf('--legacy') >= 0 || args.indexOf('-legacy') >= 0 || args.indexOf('legacy') >= 0 || args.indexOf('legacy') >= 0;
    const externalDeno = args.indexOf('--externalDeno') >= 0 || args.indexOf('-extDeno') >= 0 || args.indexOf('externalDeno') >= 0 || args.indexOf('extDeno') >= 0;
    const experimental = args.indexOf('exp') >= 0 || args.indexOf('-exp') >= 0 || args.indexOf('experimental') >= 0 || args.indexOf('-experimental') >= 0;
    if (experimental && !externalDeno) {
        return JsInterpreter_1.InterpretingMode.experimental;
    }
    else if (experimental && externalDeno) {
        return JsInterpreter_1.InterpretingMode.localDeno;
    }
    else if (insecure) {
        return JsInterpreter_1.InterpretingMode.insecure;
    }
    else if (legacy) {
        return JsInterpreter_1.InterpretingMode.legacy;
    }
    else {
        return JsInterpreter_1.InterpretingMode.default;
    }
}
function getDataJsonPath(args) {
    if (args.indexOf('-data') >= 0 || args.indexOf('-d') >= 0) {
        const index = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('-data');
        return args[index + 1];
    }
    else {
        return 'data.json';
    }
}
function printVersion() {
    const package_info = require('../../package.json');
    console.log(package_info.version);
}
exports.printVersion = printVersion;
function printHelpText() {
    console.log('\n');
    console.log('Usage: staticc <command>\n');
    console.log('where: <command> is one of:');
    console.log('v                alias for version');
    console.log('version          shows the version of the staticc-cli');
    console.log('build            creates a production build of all html files');
    console.log('build-dev        creates a development build of all html files');
    console.log('serve            starts a development webserver');
    console.log('init             initializes a new staticc project\n');
    console.log('Visit https://idot-digital.github.io/staticc/ to learn more about staticc.');
}
exports.printHelpText = printHelpText;
