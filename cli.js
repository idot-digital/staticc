#! /usr/bin/env node
const {
  readFileFromDisk,
  saveFileToDisk,
  transpile,
  getImportedFiles,
  getImportedImages,
  getCurrentSnippet
} = require("./lib");
const express = require("express");
const morgan = require("morgan");
const minify = require("html-minifier").minify;
const glob = require("glob");
const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");
const args = process.argv.slice(2);
const fs = require("fs");

const help =
  args.indexOf("--help") >= 0 ||
  args.indexOf("-h") >= 0 ||
  args.indexOf("help") >= 0;
const version =
  args.indexOf("version") >= 0 ||
  args.indexOf("v") >= 0 ||
  args.indexOf("-v") >= 0;
const build_dev = args.indexOf("build-dev") >= 0;
const build_prod = args.indexOf("build") >= 0;
const serve = args.indexOf("serve") >= 0;
const init = args.indexOf("init") >= 0;

let error;
let data;
try {
  data = JSON.parse(readFileFromDisk("data.json"));
} catch (e) {
  error = "Could not open data.json!";
}

if (version) {
  const package_info = require("./package.json");
  console.log(package_info.version);
} else if (help) {
  console.log("");
  console.log("Usage: staticc <command>");
  console.log("");
  console.log("where: <command> is one of:");
  console.log("v\t\t alias for version");
  console.log("version\t\t shows the version of the staticc-cli");
  console.log("build\t\t creates a production build of all html files");
  console.log("build-dev\t creates a development build of all html files");
  console.log("serve\t\t starts a development webserver");
  console.log("init\t\t initializes a new staticc project");
  console.log("");
  console.log(
    "Visit https://github.com/luiskugel/staticc to learn more about staticc."
  );
} else if (build_dev || build_prod) {
  if (error) {
    console.log(error);
    return;
  }
  console.log("");
  console.log("starting build!");
  const HTMLfiles = glob.sync("src/**/*.html");
  HTMLfiles.forEach((file) => {
    console.log("Building: " + file);
    const inputFile = readFileFromDisk(file);
    let transpiledCode;
    try {
      transpiledCode = transpile(inputFile, data);
    } catch (error) {
      console.log("")
      console.log("Error compiling Code snippet: " + getCurrentSnippet())
    }
    if (build_prod) transpiledCode = minifyHTML(transpiledCode);
    saveFileToDisk(changeFilenameFromSrcToDist(file), transpiledCode);
  });

  copyAllFiles([...getImportedFiles(), ...HTMLfiles]);
  convertAllImages(getImportedImages())
    .then(() => {
      console.log("finished build!");
    })
    .catch((err) => console.log(err));
} else if (serve) {
  if (error) {
    console.log(error);
    return;
  }
  startServer();
} else if (init) {
  console.log("");
  console.log("Initializing staticc project!");
  console.log("");
  const example_project = require("./example_project.json");
  Object.keys(example_project).forEach((filepath) => {
    saveFileToDisk(filepath, example_project[filepath]);
  });
  console.log("Finished!");
} else {
  console.log("Use -h or --help for help!");
}

function startServer() {
  const app = express();
  app.use(morgan("dev"));

  app.use((req, res, next) => {
    if (req.url == "/") {
      req.url += "index.html";
    }
    const urlParts = req.url.split(".");
    if (urlParts[urlParts.length - 1] == "html" || req.url == "/") {
      const inputFile = readFileFromDisk("src/" + req.url);
      res.write(transpile(inputFile, data));
      res.end();
    } else {
      next();
    }
  });
  app.use(express.static("src"));
  app.listen(8888, () => {
    console.log("Staticc server listening on http://localhost:8888/");
  });
}

function minifyHTML(html_String) {
  return minify(html_String, {
    removeComments: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
  });
}

function copyAllFiles(filter) {
  const allfiles = glob.sync("src/**/*.*");
  allfiles.forEach((file) => {
    if (filter.includes(file)) return;
    const newFilepath = changeFilenameFromSrcToDist(file);
    const folderpath = newFilepath
      .split("/")
      .splice(0, newFilepath.split("/").length - 1)
      .join("/");
    if (folderpath) fs.mkdirSync(folderpath, { recursive: true });
    fs.copyFileSync(file, newFilepath);
  });
}

function changeFilenameFromSrcToDist(file) {
  return "dist" + file.substring(3);
}

async function convertAllImages(filepaths) {
  await imagemin(filepaths, {
    destination: "dist/",
    plugins: [imageminWebp({ quality: 50 })],
  });
  console.log("Images optimized");
}
