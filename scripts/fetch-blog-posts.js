// Pulls published posts from the Supabase `blog_posts` table into a local cache
// (scripts/content/blog-posts.json) so the static build can render them as SEO pages.
// Failures are non-fatal: the previous cache (if any) is kept so builds never break.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CACHE = path.join(__dirname, "content", "blog-posts.json");

function readEnv() {
  const env = { ...process.env };
  const file = path.join(ROOT, ".env");
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

async function main() {
  const env = readEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn("blog cache: Supabase env vars missing, keeping existing cache");
    return;
  }

  const endpoint =
    `${url}/rest/v1/blog_posts?select=slug,title,excerpt,content,featured_image,author_name,` +
    `category,tags,read_time,seo_title,seo_description,seo_keywords,published_at,updated_at` +
    `&status=eq.published&order=published_at.desc.nullslast`;

  const response = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });

  if (!response.ok) {
    throw new Error(`Supabase responded ${response.status}: ${await response.text()}`);
  }

  const rows = await response.json();
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`blog cache: ${rows.length} published post(s) written to scripts/content/blog-posts.json`);
}

main().catch((error) => {
  console.warn(`blog cache: skipped (${error.message})`);
  if (!fs.existsSync(CACHE)) fs.writeFileSync(CACHE, "[]\n");
});
