#! /usr/bin/env node
Object.defineProperty(exports, "__esModule", { value: true });
const cross_spawn_1 = require("cross-spawn");
const init_1 = require("./cli/init");
const devserver_1 = require("./cli/devserver");
const help_1 = require("./cli/help");
const lib_1 = require("./cli/lib");
const build_1 = require("./cli/build");
const args = process.argv.slice(2);
//check which args have been given
const help = args.indexOf('--help') >= 0 || args.indexOf('-h') >= 0 || args.indexOf('help') >= 0;
const version = args.indexOf('version') >= 0 || args.indexOf('v') >= 0 || args.indexOf('-v') >= 0;
const build_dev = args.indexOf('build-dev') >= 0;
const build_prod = args.indexOf('build') >= 0;
const serve = args.indexOf('serve') >= 0;
const init = args.indexOf('init') >= 0;
const startDeno = args.indexOf('--deno') >= 0 || args.indexOf('-deno') >= 0 || args.indexOf('runDeno') >= 0 || args.indexOf('runDeno') >= 0;
const data_json_path = lib_1.getDataJsonPath(args);
const interpretingMode = lib_1.getInterpretingMode(args);
let alreadyLoadedFiles = [];
let filesToCopy = [];
if (version) {
    help_1.printVersion();
}
else if (help) {
    help_1.printHelpText();
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
