// https://markdown-it.github.io/markdown-it/ markdown-it 정보
const path = require("path");
const fs = require("fs");
const hljs = require("highlight.js");
const md = require("markdown-it")({
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: "language-",
    linkify: true,
    typographer: true,
    quotes: "“”‘’",
    highlight: function(str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return (
            '<pre class="hljs"><code>' +
            hljs.highlight(lang, str, true).value +
            "</code></pre>"
          );
        } catch (__) {}
      }
  
      return (
        '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
      );
    }
});
const ejs = require("ejs");

const dir = "./deploy";
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const layoutHtmlFormat = fs.readFileSync(
    "./templates/layout_format.html",
    "utf8"
);
const articleHtmlFormat = fs.readFileSync(
    "./templates/article_format.html",
    "utf8"
);


const dir_path = path.join(__dirname, "contents");

const contentFiles = fs.readdirSync(dir_path);

// console.log(contentFiles);

const deployFiles = [];

contentFiles.map(file => {
    const body = fs.readFileSync(`./contents/${file}`, "utf8");
    const convertedBody = md.render(body);
    // console.log(typeof convertedBody);
    const articleContent = ejs.render(articleHtmlFormat, {
        body: convertedBody
    });
    const articleHtml = ejs.render(layoutHtmlFormat, {
        content: articleContent
    });

    const getHtmlFileName = (file) => {
        return file.slice(0, file.indexOf(".")).toLowerCase();
    }

    const fileName = getHtmlFileName(file);
    fs.writeFileSync(`./deploy/${fileName}.html`, articleHtml);
    deployFiles.push(fileName);

});

const listHtmlFormat = fs.readFileSync("./templates/list_format.html", "utf-8");

const listContent = ejs.render(listHtmlFormat, {
    lists: deployFiles
});

const listHtml = ejs.render(layoutHtmlFormat, {
    content: listContent
});

fs.writeFileSync("./index.html", listHtml);