// Static site build: copy all public-facing files into dist/
const fs = require("fs");
const path = require("path");

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

// Clean dist
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const root = path.join(__dirname, "..");
const entries = [
  "index.html",
  "rekonet.html",
  "_redirects",
  "public",
  "src/js",
  "src/css",
];

for (const entry of entries) {
  const src = path.join(root, entry);
  if (!fs.existsSync(src)) {
    console.warn(`Skipping missing entry: ${entry}`);
    continue;
  }
  copyRecursive(src, path.join(dist, entry === "public" ? "" : entry));
}

console.log("Static site built into dist/");
