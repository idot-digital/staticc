export interface snippetType {
    type: snippet_type
    value?: string
    path?: string[]
    args?: string[]
}

export interface loadedSnippet extends snippetType {
    value: string
}

export interface fileSnippet extends snippetType {
    path: string[]
}

export interface jsPrefabSnippet extends snippetType {
    args: string[]
}

export interface dataSnippet extends snippetType {
    value: string
}

export enum snippet_type {
    js,
    prefab_js,
    prefab_html,
    file,
    data,
}

export interface transpileableSnippet extends snippetType {
    value: string
    type: snippet_type
}
