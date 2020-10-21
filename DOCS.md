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
    # data.shop_items.map((item)=>{
        return `<h2>${item}</h2>` 
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

## Prefabs (JS)

If you need access to the data in you prefab, you can use a javascript-prefab. In order to prevent namespace polution, the data is packed into the data-object.

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
{{ !my_js_prefab }}
```

prefab.html

```html
    function render(){
        const year = new Date().getFullYear() 
        return `<h1>Copyright (c) ${year} ${data.company_name}</h1>` 
    }
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

## File inlining

In order to reduce the amount of network requests, it can be usefull to inline stylesheets or scripts. While this is nice for loadtimes, it is not very clean in the development process. Therefore staticc has the feature to import some of these files for you. So that you can write them like they were seperate files, but at the end they get injected in the HTML. Supported Filetypes are:

- svg
- css
- scss/sass
- js

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
{{ ?sass style.css }}
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

## Image conversion

In order to get the best results out of your images, it is recomendet use next-gen formats like webp and jp2. To help you with this, staticc can import images and convert them into webp and generate the needed picture tag. Due to licensing issues, we can only convert your images into webp and you have to create the jp2 images yourself.

Folder-Structure

```
    +-- data.json
    +-- src
    |   +-- index.html
    |   +-- image.png
```

Staticc (index.html)

```html
<p>Some text</p>
{{ ?img image.png }}
```

HTML

```html
<p>Some text</p>
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image.jp2" type="image/jp2" />
  <img srcset="image.png" alt="a picture" />
</picture>
```

If you only want to use webp images and use the original images instead, if the browser does not support webp, you can use the parameter `--webp-only` with the build.

HTML

```html
<p>Some text</p>
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img srcset="image.png" alt="a picture" />
</picture>
```
