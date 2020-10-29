export interface snippet {
    type: snippet_type
    value?: string
    path?: string[]
    args?: string[]
}

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

export interface transpileableSnippet extends snippet {
    value: string
    type: snippet_type
}
