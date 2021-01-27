# Staticc Basics

What is Staticc ?

## Variables

Variables are a simple way to inject a Information in the HTML code.

Staticc

```html
<p>You can get access to the whole Library for only {{ price }}</p>
```

HTML

```html
<p>You can get access to the whole Library for only 5$</p>
```

data.json

```json
{
    "price": "5$"
}
```

## Advanced Variables

If you have more complex variabes like an array of Objects, you can use javascript code to generate the HTML. Therefore you open a staticc block and use the "#" prefix.

Staticc

```html
<p>You can select from these Products</p>
{{ 
    # data.shop_items.map((item)=>{ return 
    `<h2>${item}</h2>` 
    }) 
}}
```

HTML

```html
<p>You can select from these Products</p>
<h2>Item 1</h2>
<h2>Item 2</h2>
<h2>Item 3</h2>
```

data.json

```json
{
    "shop_items": ["Item 1", "Item 2", "Item 3"]
}
```

## Prefabs (HTML)

If you have recurring elements, you can use them as prefab. Simply create a new folder in the prefabs folder with the name of your prefab and put the HTML code in the prefab.html. To import it, you can use "!" followed by the name of the folder.

Folder-Structure

```
    +-- data.json
    +-- src
    |   +-- index.html
    +-- prefabs
    |   +-- my_new_prefab
    |       +-- prefab.html
```

Staticc (index.html)

```html
<p>Welcome to my Testpage:</p>
{{ !my_new_prefab }}
```

prefab.html

```html
<h2>Hello, World!</h2>
<h5>This is my simple prefab.</h5>
```

HTML

```html
<p>Welcome to my Testpage:</p>
<h2>Hello, World!</h2>
<h5>This is my simple prefab.</h5>
```

If your prefab internally uses another snippet which accesses the data.json you can also limit its scope:

data.json

```json
{
    "headline": {
        "text": "limited"
    }
}
```

```html
<p>Welcome to my Testpage:</p>
{{ !my_new_prefab headline  }}
```

prefab.html

```html
<h2>Hello, World!</h2>
<h5>This snippet has {{ text }} access to the data.json</h5>
```

HTML

```html
<p>Welcome to my Testpage:</p>
<h2>Hello, World!</h2>
<h5>This snippet has {{ limited }} access to the data.json</h5>
```


## Prefabs (JS)

If you want to use javascript-magic in your prefab, you can use a javascript-prefab. In order to prevent namespace polution, the data is packed into the data-object.

Folder-Structure

```
    +-- data.json
    +-- src
    |   +-- index.html
    +-- prefabs
    |   +-- my_js_prefab
    |       +-- prefab.js
```

Staticc (index.html)

```html
<p>Welcome to my Testpage:</p>
{{ !!my_js_prefab }}
```

prefab.html

```html
const year = new Date().getFullYear() render(`
<h1>Copyright (c) ${year} ${data.company_name}</h1>
`)
```

HTML

```html
<p>Welcome to my Testpage:</p>
<h1>Copyright (c) 2020 iDot digital</h1>
```

data.json

```json
{
    "company_name": "iDot digital"
}
```

But be aware, this javascript is run by an interpreter when the page is transpiled, so you can't access typical browser features like window or document!

## File inlining

In order to reduce the amount of network requests, it can be usefull to inline stylesheets or scripts. While this is nice for loadtimes, it is not very clean in the development process. Therefore staticc has the feature to import some of these files for you. So that you can write them like they were seperate files, but at the end they get injected in the HTML. Supported Filetypes are:

-   svg
-   css
-   sass (also scss)
-   js

Folder-Structure

```
    +-- data.json
    +-- src
    |   +-- index.html
    |   +-- style.css
```

Staticc (index.html)

```html
<p>Some text</p>
{{ ?sass style.css }}
```

style.css

```css
body {
    background-color: blue;
}
```

HTML

```html
<p>Some text</p>
<style>
    body {
        background-color: blue;
    }
</style>
```

If you have multiple files of one type, you can simply list them to import all.

Folder-Structure

```
    +-- data.json
    +-- src
    |   +-- index.html
    |   +-- style.css
    |   +-- style2.css
```

Staticc (index.html)

```html
<p>Some text</p>
{{ ?sass style.css style2.css }}
```

style.css

```css
body {
    background-color: blue;
}
```

style2.css

```css
h1 {
    color: red;
}
```

HTML

```html
<p>Some text</p>
<style>
    body {
        background-color: blue;
    }
</style>
<style>
    h1 {
        color: red;
    }
</style>
```

## File Linking (only in prefabs)

If you want to write a stylesheet for a prefab, but you don't want to inline it, you can now link it with this type of snippet. Staticc then copies the file from the prefab folder to the dist folder, for you to use it.

Folder-Structure

```
    +-- data.json
    +-- src
    |   +-- index.html
    +-- prefabs
    |   +-- my_js_prefab
    |       +-- prefab.js
    |       +-- style.css
```

Staticc (prefab.js)

```html
<p>Some text</p>
{{* image.png *}}
```

Folder-Structure (after transpiling)

```
    +-- data.json
    +-- src
    |   +-- index.html
    +-- prefabs
    |   +-- my_js_prefab
    |       +-- prefab.js
    |       +-- style.css
    +-- dist
    |   +-- my_js_prefab
    |       +-- style.css
    |   +-- index.html
```
