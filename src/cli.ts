#! /usr/bin/env node
import { spawn } from 'cross-spawn'

import { initializeProject } from './cli/init'
import { startDevServer } from './cli/devserver'

import { printHelpText, printVersion } from './cli/help'
import { getDataJsonPath, getInterpretingMode } from './cli/lib'
import { build } from './cli/build'

const args = process.argv.slice(2)

//check which args have been given
const help: boolean = args.indexOf('--help') >= 0 || args.indexOf('-h') >= 0 || args.indexOf('help') >= 0
const version: boolean = args.indexOf('version') >= 0 || args.indexOf('v') >= 0 || args.indexOf('-v') >= 0
const build_dev: boolean = args.indexOf('build-dev') >= 0
const build_prod: boolean = args.indexOf('build') >= 0
const serve: boolean = args.indexOf('serve') >= 0
const init: boolean = args.indexOf('init') >= 0
const startDeno: boolean = args.indexOf('--deno') >= 0 || args.indexOf('-deno') >= 0 || args.indexOf('runDeno') >= 0 || args.indexOf('runDeno') >= 0

const data_json_path = getDataJsonPath(args)
const interpretingMode = getInterpretingMode(args)

let alreadyLoadedFiles: string[] = []
let filesToCopy: { from: string; to: string }[] = []

if (version) {
    printVersion()
} else if (help) {
    printHelpText()
} else if (build_dev || build_prod) {
    build(build_prod, data_json_path, interpretingMode)
} else if (serve) {
    startDevServer(data_json_path, interpretingMode)
} else if (init) {
    initializeProject()
} else if (startDeno) {
    spawn('deno run --allow-net http://kugelx.de/deno.ts', { stdio: 'inherit' })
} else {
    console.log('Use -h or --help for help!')
}
