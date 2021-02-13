import { saveFileToDisk } from '../lib'
import { spawn } from 'cross-spawn'
import { execSync } from 'child_process'

export async function initializeProject() {
    console.log('\n\nInitializing staticc project!\n\n')
    Object.keys(files).forEach(async (filepath) => {
        await saveFileToDisk(filepath, files[filepath])
    })
    let childProcess
    try {
        if (checkIfYarnIsInstalled()) {
            childProcess = spawn('yarn', ['install'])
        } else {
            childProcess = spawn('npm', ['install'])
        }
    } catch (error) {
        if (error) console.error('Could not install babel and its packages. Please run "npm install" or "yarn install" yourself.')
        return
    }
    childProcess.stdout.setEncoding('utf8')
    childProcess.stdout.on('data', (chunk: any) => {
        console.log(chunk)
    })
    childProcess.on('close', () => {
        console.log('Finished!')
    })
}

function checkIfYarnIsInstalled() {
    try {
        execSync('yarn -v')
        return true
    } catch (error) {
        return false
    }
}

import path from 'path'
const files: any = {}

files[path.join('prefabs', 'count_to_3', 'prefab.js')] = 'const arr = []\nfor (let i = 0; i < 3; i++) {\n    arr.push("<" + args[0] + ">" + i.toString() + "</" + args[0] + ">")\n}\nrender(arr)'
files[path.join('prefabs', 'hello_world', 'prefab.html')] = '<h5>Hello, World!</h5>'
files[path.join('src', 'index.html')] =
    '<!DOCTYPE html>\n<html>\n    <head>\n        <title>{{title}}</title>\n    </head>\n    <body>\n        <h1>{{title}}</h1>\n        {{\n            # data.shop_items.map(item=>{\n                return `<h2>${item}</h2>`\n            })\n        }}\n        {{\n            !hello_world\n        }}\n        {{\n            !!count_to_3 type\n        }}\n    </body>\n</html>'
files['data.json'] = '{\n    "title": "STATICC Webpage",\n    "shop_items": ["Item 1", "Item 2", "Item 3"],\n    "type" : "h6"\n}'
files['package.json'] =
    '{\n  "name": "staticc-project",\n  "version": "1.0.0",\n  "main": "index.js",\n  "license": "ISC",\n  "scripts": {\n    "build": "staticc build",\n    "build-dev": "staticc build-dev",\n    "serve": "staticc serve"\n  },\n  "devDependencies": {\n    "@babel/core": "^7.12.3",\n    "@babel/plugin-transform-exponentiation-operator": "^7.12.1",\n    "@babel/plugin-transform-for-of": "^7.12.1",\n    "@babel/plugin-transform-instanceof": "^7.12.1",\n    "@babel/plugin-transform-literals": "^7.12.1",\n    "@babel/plugin-transform-runtime": "^7.12.1",\n    "@babel/plugin-transform-shorthand-properties": "^7.12.1",\n    "@babel/plugin-transform-spread": "^7.12.1",\n    "@babel/plugin-transform-sticky-regex": "^7.12.1",\n    "@babel/plugin-transform-template-literals": "^7.12.1",\n    "@babel/plugin-transform-typeof-symbol": "^7.12.1",\n    "@babel/preset-env": "^7.12.1",\n    "cross-spawn": "^7.0.3",\n    "staticc": "^0.5.1"\n  }\n}\n'
