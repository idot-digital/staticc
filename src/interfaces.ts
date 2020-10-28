export interface snippet {
    id: string
    type: snippet_type
    value?: string
    resolvedValue?: string
    path?: string[]
    args?: string[]
}

import { v4 as uuid } from 'uuid'

export interface fileSnippet extends snippet {
    path: string[]
}

export interface jsPrefabSnippet extends snippet {
    args: string[]
}

export interface dataSnippet extends snippet {
    value: string
}

export enum snippet_type {
    js,
    prefab_js,
    prefab_html,
    file,
    data,
}

// export class snippet {
//     id: string
//     constructor() {
//         this.id = uuid()
//     }
// }
