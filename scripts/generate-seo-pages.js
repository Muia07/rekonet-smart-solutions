const fs = require("fs");
const path = require("path");
const {
  CONTACT,
  LAST_UPDATED,
  PAGES,
  POSTS,
} = require("./content/site-content");

const OUT = path.join(__dirname, "..", "public");
const BASE_URL = CONTACT.baseUrl;

// Posts authored in the Supabase CMS (/admin/blog), cached by scripts/fetch-blog-posts.js.
function loadDbPosts() {
  try {
    const rows = require("./content/blog-posts.json");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function stripTags(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function displayDate(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function mapDbPost(row) {
  const published = (row.published_at || row.updated_at || new Date().toISOString()).slice(0, 10);
  const updated = (row.updated_at || row.published_at || published).slice(0, 10);
  const description = (row.seo_description || row.excerpt || stripTags(row.content)).slice(0, 300);
  return {
    kind: "article",
    fromCms: true,
    slug: `blog/${row.slug}`,
    title: row.seo_title || `${row.title} | Rekonet`,
    cardTitle: row.title,
    h1: row.title,
    description,
    eyebrow: row.category || "Rekonet guide",
    lede: row.excerpt || description,
    category: row.category || "Guides",
    readTime: String(row.read_time || Math.max(3, Math.round(stripTags(row.content).split(" ").length / 200))),
    keywords: row.seo_keywords || row.tags || [],
    image: row.featured_image || "",
    imageAlt: row.title,
    imageCaption: "",
    author: row.author_name || "Rekonet Team",
    published,
    updated,
    displayDate: displayDate(row.published_at || row.updated_at),
    crumbs:
      '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> ' +
      `<span>${escapeHtml(row.title)}</span>`,
    body: row.content || "",
  };
}

const CMS_POSTS = loadDbPosts().map(mapDbPost);
const STATIC_POSTS = POSTS.map((item) => ({ ...item, kind: "article" }));
const ALL_POSTS = [
  ...CMS_POSTS.filter((post) => !STATIC_POSTS.some((item) => item.slug === post.slug)),
  ...STATIC_POSTS,
];


const org = {
  "@type": "Organization",
  name: "Rekonet Inv Systems",
  url: BASE_URL,
  logo: `${BASE_URL}/favicon-512.png`,
  email: CONTACT.email,
  telephone: CONTACT.phoneMachine,
  areaServed: {
    "@type": "Country",
    name: "Kenya",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressRegion: "Nairobi County",
    addressCountry: "KE",
  },
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function absoluteUrl(url) {
  if (!url) return `${BASE_URL}/og-image.png`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function breadcrumbLd(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function serviceLd(pageData) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: pageData.h1,
        description: pageData.description,
        provider: org,
        areaServed: {
          "@type": "Country",
          name: "Kenya",
        },
        url: `${BASE_URL}/${pageData.slug}/`,
      },
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: pageData.crumbLabel || pageData.h1, path: `/${pageData.slug}/` },
      ]),
    ],
  };
}

function webPageLd(pageData) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: pageData.h1,
        description: pageData.description,
        url: `${BASE_URL}/${pageData.slug}/`,
      },
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: pageData.crumbLabel || pageData.h1, path: `/${pageData.slug}/` },
      ]),
    ],
  };
}

function articleLd(post) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.h1,
        description: post.description,
        image: [absoluteUrl(post.image)],
        datePublished: post.published,
        dateModified: post.updated || post.published,
        author: org,
        publisher: org,
        mainEntityOfPage: `${BASE_URL}/${post.slug}/`,
        articleSection: post.category,
        keywords: post.keywords,
      },
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog/" },
        { name: post.h1, path: `/${post.slug}/` },
      ]),
    ],
  };
}

function collectionLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Practical guides for Kenyan businesses",
        description:
          "Plain-language guides to POS, stock control, payment reconciliation and business technology in Kenya.",
        url: `${BASE_URL}/blog/`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: POSTS.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${BASE_URL}/${post.slug}/`,
            name: post.h1,
          })),
        },
      },
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog/" },
      ]),
    ],
  };
}

function relatedArticles(post) {
  const requested = post.related || [];
  const related = requested
    .map((slug) => POSTS.find((candidate) => candidate.slug === slug))
    .filter(Boolean)
    .slice(0, 3);

  if (related.length === 0) return "";

  return `<aside class="related" aria-labelledby="related-heading">
  <h2 id="related-heading">Continue reading</h2>
  <div class="cards article-links">
    ${related
      .map(
        (item) => `<a class="card article-link" href="/${item.slug}/">
      <span class="tag">${escapeHtml(item.category)}</span>
      <h3>${escapeHtml(item.cardTitle || item.h1)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </a>`,
      )
      .join("\n")}
  </div>
</aside>`;
}

function page(data) {
  const isArticle = data.kind === "article";
  const canonical = `${BASE_URL}/${data.slug ? `${data.slug}/` : ""}`;
  const image = absoluteUrl(data.image || "/og-image.png");
  const imageType = image.toLowerCase().endsWith(".jpg") ? "image/jpeg" : "image/png";
  const jsonld = data.jsonld ||
    (isArticle ? articleLd(data) : data.kind === "legal" ? webPageLd(data) : serviceLd(data));
  const articleMeta = isArticle
    ? `<meta property="article:published_time" content="${escapeHtml(data.published)}" />
    <meta property="article:modified_time" content="${escapeHtml(data.updated || data.published)}" />
    <meta property="article:section" content="${escapeHtml(data.category)}" />`
    : "";
  const heroImage = isArticle
    ? `<figure class="article-hero">
      <img src="${escapeHtml(data.image)}" alt="${escapeHtml(data.imageAlt)}" width="1672" height="941" fetchpriority="high" />
      <figcaption>${escapeHtml(data.imageCaption || "Illustrative editorial image; not a customer endorsement.")}</figcaption>
    </figure>`
    : "";
  const metaLine = isArticle
    ? `<p class="meta"><span>${escapeHtml(data.category)}</span><span>${escapeHtml(data.readTime)} min read</span><time datetime="${escapeHtml(data.updated || data.published)}">Updated ${escapeHtml(data.displayDate)}</time></p>`
    : data.updatedLabel
      ? `<p class="meta"><time datetime="${escapeHtml(data.updated || LAST_UPDATED)}">${escapeHtml(data.updatedLabel)}</time></p>`
      : "";
  const cta = data.hideCta
    ? ""
    : `<section class="cta-band" aria-labelledby="cta-heading">
    <div class="wrap">
      <h2 id="cta-heading">Start with your actual workflow</h2>
      <p>Tell us what you sell, how many tills or branches you run, and what you need to reconcile. We will confirm scope, exclusions, timeline and price in writing.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="/contact">Request a demo or quote</a>
        <a class="btn btn-ghost" href="https://wa.me/${CONTACT.whatsApp}?text=Hello%20Rekonet%2C%20I%20would%20like%20to%20discuss%20a%20business%20system." rel="noopener">WhatsApp ${CONTACT.phoneDisplay}</a>
      </div>
    </div>
  </section>`;

  return `<!DOCTYPE html>
<html lang="en-KE">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(data.title)}</title>
  <meta name="description" content="${escapeHtml(data.description)}" />
  <meta name="author" content="Rekonet Inv Systems" />
  <meta name="robots" content="${data.noIndex ? "noindex, follow" : "index, follow, max-image-preview:large"}" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="${isArticle ? "article" : "website"}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(data.title)}" />
  <meta property="og:description" content="${escapeHtml(data.description)}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:type" content="${imageType}" />
  <meta property="og:image:width" content="${isArticle ? "1672" : "1200"}" />
  <meta property="og:image:height" content="${isArticle ? "941" : "630"}" />
  <meta property="og:image:alt" content="${escapeHtml(data.imageAlt || "Rekonet POS, inventory and custom business software")}" />
  <meta property="og:site_name" content="Rekonet Inv Systems" />
  <meta property="og:locale" content="en_KE" />
  ${articleMeta}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(data.title)}" />
  <meta name="twitter:description" content="${escapeHtml(data.description)}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${escapeHtml(data.imageAlt || "Rekonet POS, inventory and custom business software")}" />

  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#002b5b" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/src/css/seo-pages.css" />
  <script type="application/ld+json">${JSON.stringify(jsonld).replaceAll("<", "\\u003c")}</script>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="/" aria-label="Rekonet home">Rekonet <span>Inv Systems</span></a>
      <nav class="site-nav" aria-label="Primary navigation">
        <a href="/pos-system-kenya/">POS</a>
        <a href="/inventory-management-software-kenya/">Inventory</a>
        <a href="/pricing">Pricing</a>
        <a href="/blog/">Guides</a>
        <a class="cta" href="/contact">Contact</a>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <section class="hero">
      <div class="wrap">
        <span class="eyebrow">${escapeHtml(data.eyebrow)}</span>
        <h1>${escapeHtml(data.h1)}</h1>
        <p class="lede">${escapeHtml(data.lede)}</p>
        ${
          data.hideHeroButtons
            ? ""
            : `<div class="btn-row">
          <a class="btn btn-primary" href="/contact">Request a scoped quote</a>
          <a class="btn btn-ghost" href="/pricing">See pricing and exclusions</a>
        </div>`
        }
      </div>
    </section>

    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb">${data.crumbs}</nav>
      <article class="content">
        ${heroImage}
        ${metaLine}
        ${data.body}
        ${isArticle ? relatedArticles(data) : ""}
      </article>
    </div>
  </main>

  ${cta}

  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <h2>Rekonet Inv Systems</h2>
          <p>Offline POS, stock control, reconciliation, websites and scoped business software for Kenyan businesses.</p>
        </div>
        <div>
          <h2>Contact</h2>
          <ul>
            <li><a href="tel:${CONTACT.phoneMachine}">${CONTACT.phoneDisplay}</a></li>
            <li><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li>
            <li>Nairobi, Kenya</li>
          </ul>
        </div>
        <div>
          <h2>Useful links</h2>
          <ul>
            <li><a href="/pricing">Pricing and cost notes</a></li>
            <li><a href="/use-cases">Practical use cases</a></li>
            <li><a href="/faq">Frequently asked questions</a></li>
            <li><a href="/downloads">Downloads</a></li>
            <li><a href="/blog/">Business guides</a></li>
            <li><a href="/privacy-policy/">Privacy policy</a></li>
            <li><a href="/terms-of-service/">Website terms</a></li>
          </ul>
        </div>
      </div>
      <p class="legal">© 2026 Rekonet Inv Systems. Pricing is indicative until confirmed in a written quotation.</p>
    </div>
  </footer>
</body>
</html>`.replace(/[ \t]+$/gm, "");
}

function blogIndexBody() {
  return `<div class="blog-intro callout">
  <h2>Useful answers, not sales slogans</h2>
  <p>These guides explain costs, trade-offs and day-to-day controls in plain language. Product-specific claims are identified, and compliance topics include questions to verify rather than unsupported certification promises.</p>
</div>
<div class="blog-grid">
${POSTS.map(
  (post) => `<article class="blog-card">
  <a class="blog-card-image" href="/${post.slug}/" aria-label="Read ${escapeHtml(post.h1)}">
    <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt)}" width="1672" height="941" loading="lazy" />
  </a>
  <div class="blog-card-body">
    <p class="meta"><span>${escapeHtml(post.category)}</span><span>${escapeHtml(post.readTime)} min read</span></p>
    <h2><a href="/${post.slug}/">${escapeHtml(post.cardTitle || post.h1)}</a></h2>
    <p>${escapeHtml(post.description)}</p>
    <a class="text-link" href="/${post.slug}/">Read guide <span aria-hidden="true">→</span></a>
  </div>
</article>`,
).join("\n")}
</div>`;
}

const blogIndex = {
  slug: "blog",
  title: "Practical POS, Stock and Business Technology Guides | Rekonet",
  description:
    "Practical guides for Kenyan businesses on POS costs, inventory control, M-Pesa reconciliation, hardware, eTIMS questions and business websites.",
  eyebrow: "Rekonet business guides",
  h1: "Practical guides for Kenyan businesses",
  lede:
    "Understand the cost, workflow and risk questions to ask before buying a POS system or other business technology.",
  crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>Guides</span>',
  body: blogIndexBody(),
  jsonld: collectionLd(),
  hideHeroButtons: true,
  hideCta: false,
};

const all = [
  ...PAGES,
  ...POSTS.map((item) => ({ ...item, kind: "article" })),
  blogIndex,
];

for (const item of all) {
  const dir = path.join(OUT, item.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), `${page(item)}\n`);
  console.log(`wrote public/${item.slug}/index.html`);
}

const staticRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/solutions", changefreq: "monthly", priority: "0.8" },
  { path: "/pricing", changefreq: "monthly", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/why-us", changefreq: "monthly", priority: "0.7" },
  { path: "/use-cases", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/downloads", changefreq: "monthly", priority: "0.7" },
  ...all
    .filter((item) => !item.noIndex)
    .map((item) => ({
      path: `/${item.slug}/`,
      changefreq: "monthly",
      priority: item.kind === "article" ? "0.7" : item.slug === "blog" ? "0.8" : "0.9",
    })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticRoutes.map((route) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${route.path}</loc>`,
      `    <lastmod>${LAST_UPDATED}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
].join("\n");

fs.writeFileSync(path.join(OUT, "sitemap.xml"), `${xml}\n`);
console.log(`sitemap.xml written (${staticRoutes.length} entries)`);
