Object.defineProperty(exports, "__esModule", { value: true });
exports.printHelpText = exports.printVersion = void 0;
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
    console.log('Visit https://github.com/idot-digital/staticc to learn more about staticc.');
}
exports.printHelpText = printHelpText;
