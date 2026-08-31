// Static site build: copy all public-facing files into dist/
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dist = path.join(__dirname, "..", "dist");

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function fileHash(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 10);
}

function bustHtmlAssets(htmlPath, cssHash, jsHash) {
  if (!fs.existsSync(htmlPath)) return;
  let html = fs.readFileSync(htmlPath, "utf8");
  html = html.replace(/\/src\/css\/rekonet\.css(?:\?v=[^"']+)?/g, `/src/css/rekonet.css?v=${cssHash}`);
  html = html.replace(/\/src\/js\/rekonet\.js(?:\?v=[^"']+)?/g, `/src/js/rekonet.js?v=${jsHash}`);
  html = html.replace(/\/src\/css\/seo-pages\.css(?:\?v=[^"']+)?/g, `/src/css/seo-pages.css?v=${cssHash}`);
  fs.writeFileSync(htmlPath, html);
}

function walkHtml(dir, visitor) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, visitor);
    else if (entry.name.endsWith(".html")) visitor(full);
  }
}

// Clean dist
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const root = path.join(__dirname, "..");
const entries = ["index.html", "_redirects", "public", "src/js", "src/css"];

for (const entry of entries) {
  const src = path.join(root, entry);
  if (!fs.existsSync(src)) {
    console.warn(`Skipping missing entry: ${entry}`);
    continue;
  }
  copyRecursive(src, path.join(dist, entry === "public" ? "" : entry));
}

const cssHash = fileHash(path.join(root, "src/css/rekonet.css"));
const jsHash = fileHash(path.join(root, "src/js/rekonet.js"));
const seoHash = fileHash(path.join(root, "src/css/seo-pages.css"));

bustHtmlAssets(path.join(dist, "index.html"), cssHash, jsHash);
walkHtml(dist, (htmlPath) => {
  bustHtmlAssets(htmlPath, seoHash, jsHash);
});

console.log(`Static site built into dist/ (css=${cssHash} js=${jsHash} seo=${seoHash})`);
