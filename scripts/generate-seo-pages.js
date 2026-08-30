// Generates static SEO landing pages and blog articles into public/<slug>/index.html
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://rekonetsystems.netlify.app";
const PHONE = "+254745522104";
const EMAIL = "rekonetsystems@outlook.com";
const OUT = path.join(__dirname, "..", "public");

const header = `<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">Rekonet<span>.</span></a>
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/solutions">Solutions</a>
      <a href="/pricing">Pricing</a>
      <a href="/downloads">Downloads</a>
      <a href="/blog">Blog</a>
      <a class="cta" href="/contact">Book a Demo</a>
    </nav>
  </div>
</header>`;

const footer = `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <h2>Rekonet Inv Systems</h2>
        <p>POS, stock &amp; cash reconciliation and custom software for businesses in Kenya.</p>
      </div>
      <div>
        <h2>Solutions</h2>
        <ul>
          <li><a href="/pos-system-kenya/">POS System Kenya</a></li>
          <li><a href="/pos-system-nairobi/">POS System Nairobi</a></li>
          <li><a href="/inventory-management-software-kenya/">Inventory Software Kenya</a></li>
          <li><a href="/mpesa-pos-integration/">M-Pesa POS Integration</a></li>
        </ul>
      </div>
      <div>
        <h2>Guides</h2>
        <ul>
          <li><a href="/blog/what-is-a-pos-system/">What is a POS system?</a></li>
          <li><a href="/blog/benefits-of-pos-system-for-small-business-kenya/">POS benefits for small business</a></li>
          <li><a href="/blog/how-to-choose-pos-software-retail-kenya/">Choosing retail POS software</a></li>
        </ul>
      </div>
      <div>
        <h2>Contact</h2>
        <ul>
          <li><a href="tel:${PHONE}">${PHONE}</a></li>
          <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
          <li>Nairobi, Kenya</li>
        </ul>
      </div>
    </div>
    <p class="legal">&copy; ${new Date().getFullYear()} Rekonet Inv Systems. All rights reserved.</p>
  </div>
</footer>`;

const ctaBand = `<section class="cta-band">
  <div class="wrap">
    <h2>Ready to see it running in your shop?</h2>
    <p>Book a free demo and we will set up a trial POS on your own products and prices.</p>
    <div class="btn-row">
      <a class="btn btn-primary" href="/contact">Book a free demo</a>
      <a class="btn btn-ghost" href="tel:${PHONE}">Call ${PHONE}</a>
    </div>
  </div>
</section>`;

function page({ slug, title, description, h1, eyebrow, lede, crumbs, body, jsonld }) {
  const url = `${BASE_URL}/${slug}/`;
  return `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<link rel="icon" href="/favicon.ico" />
<link rel="stylesheet" href="/src/css/seo-pages.css" />
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
${header}
<main>
  <section class="hero">
    <div class="wrap">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${h1}</h1>
      <p class="lede">${lede}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="/contact">Book a free demo</a>
        <a class="btn btn-ghost" href="/pricing">See pricing in KSH</a>
      </div>
    </div>
  </section>
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">${crumbs}</nav>
    <article class="content">
${body}
    </article>
  </div>
${ctaBand}
</main>
${footer}
</body>
</html>
`;
}

function breadcrumbLd(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE_URL}${it.path}`,
    })),
  };
}

const org = {
  "@type": "Organization",
  name: "Rekonet Inv Systems",
  url: BASE_URL,
  telephone: PHONE,
  email: EMAIL,
  areaServed: "KE",
};

const pricingTable = `<div class="table-scroll">
<table>
  <caption class="meta">Rekonet POS packages (one-off setup, prices in Kenyan Shillings)</caption>
  <thead><tr><th>Package</th><th>Price</th><th>Best for</th></tr></thead>
  <tbody>
    <tr><td>Starter</td><td>KSH 15,000</td><td>Single shop, one till, basic stock</td></tr>
    <tr><td>Business</td><td>KSH 35,000</td><td>Multiple tills, reconciliation, reports</td></tr>
    <tr><td>Enterprise</td><td>From KSH 75,000</td><td>Multi-branch, custom integrations</td></tr>
  </tbody>
</table>
</div>`;

const pages = [
  {
    slug: "pos-system-kenya",
    title: "POS System in Kenya — Offline-First Point of Sale | Rekonet",
    description:
      "Affordable POS system for Kenyan shops, supermarkets and hardware stores. Works offline, tracks stock, reconciles cash and M-Pesa. From KSH 15,000.",
    eyebrow: "POS software for Kenya",
    h1: "POS System in Kenya Built for Shops That Cannot Afford Downtime",
    lede:
      "Rekonet POS runs offline on ordinary Windows machines, keeps your stock accurate, and reconciles till cash against M-Pesa at the end of every shift.",
    crumbs: `<a href="/">Home</a> › <span>POS System Kenya</span>`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          name: "POS System Kenya",
          serviceType: "Point of sale software",
          provider: org,
          areaServed: { "@type": "Country", name: "Kenya" },
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "POS System Kenya", path: "/pos-system-kenya/" },
        ]),
      ],
    },
    body: `<h2>Why Kenyan businesses need an offline-first POS</h2>
<p>Power cuts and patchy internet are normal operating conditions in most Kenyan trading centres. A cloud-only till stops selling the moment the line drops. Rekonet POS keeps every sale, price and stock movement on the local machine and syncs when a connection returns, so the shop keeps trading either way.</p>

<h2>What you get</h2>
<div class="cards">
  <div class="card"><h3>Fast till</h3><p>Barcode or keyboard entry, split payments, held receipts and shift close-out in a few keystrokes.</p></div>
  <div class="card"><h3>Stock control</h3><p>Live stock levels, reorder alerts, purchase entry, stock takes and variance reports per branch.</p></div>
  <div class="card"><h3>Cash &amp; M-Pesa reconciliation</h3><p>Compare declared cash and mobile money against recorded sales for each cashier and shift.</p></div>
  <div class="card"><h3>Reports that matter</h3><p>Daily sales, gross margin, slow movers, cashier performance — exportable to Excel.</p></div>
</div>

<h2>Who it suits</h2>
<ul>
  <li>Retail shops, mini-marts and supermarkets</li>
  <li>Hardware, agrovet and building supply stores</li>
  <li>Pharmacies and cosmetics shops</li>
  <li>Restaurants, bars and fast-food counters</li>
  <li>Wholesalers running several branches</li>
</ul>

<h2>Pricing</h2>
${pricingTable}
<div class="callout"><p>Prices cover installation, staff training and data setup. Talk to us on <a href="tel:${PHONE}">${PHONE}</a> for a quote based on your branches and tills.</p></div>

<h2>Getting started</h2>
<ol>
  <li>Book a demo — we run the system on your own product list.</li>
  <li>We install on your existing computer, or advise on hardware.</li>
  <li>Your team is trained on the till, stock and end-of-day close.</li>
  <li>Support continues by phone and WhatsApp after go-live.</li>
</ol>
<p>You can also <a href="/downloads">download OpenPOS</a> and try the software yourself before deciding.</p>`,
  },
  {
    slug: "pos-system-nairobi",
    title: "POS System in Nairobi — Installation & Support | Rekonet",
    description:
      "POS installation, training and same-city support for Nairobi businesses. Offline-capable tills, stock control and M-Pesa reconciliation from KSH 15,000.",
    eyebrow: "Nairobi installation & support",
    h1: "POS System in Nairobi With On-Site Setup and Local Support",
    lede:
      "We install, train and support point of sale systems across Nairobi — from the CBD and Eastleigh to Westlands, Karen, Ruaka and the industrial area.",
    crumbs: `<a href="/">Home</a> › <a href="/pos-system-kenya/">POS System Kenya</a> › <span>Nairobi</span>`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          name: "POS System Installation Nairobi",
          provider: org,
          areaServed: { "@type": "City", name: "Nairobi" },
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "POS System Kenya", path: "/pos-system-kenya/" },
          { name: "Nairobi", path: "/pos-system-nairobi/" },
        ]),
      ],
    },
    body: `<h2>Local setup, not a download-and-hope</h2>
<p>Buying software online is easy; getting it running correctly on a busy Nairobi shop floor is the hard part. We come to the premises, set up tills and printers, load your product list and prices, and stay until the first day of trading is closed off cleanly.</p>

<h2>Areas we cover</h2>
<p>Nairobi CBD, Westlands, Kilimani, Lavington, Karen, Langata, South B and C, Eastleigh, Kasarani, Roysambu, Ruaka, Rongai, Embakasi and the Industrial Area. Outside Nairobi we support remotely and travel for larger installations.</p>

<h2>What an installation includes</h2>
<ul>
  <li>Software installation and licensing on your machines</li>
  <li>Product, price and opening stock import</li>
  <li>Receipt printer, barcode scanner and cash drawer configuration</li>
  <li>Cashier accounts with permission levels</li>
  <li>Hands-on training for tills and supervisors</li>
</ul>

<h2>Pricing</h2>
${pricingTable}

<h2>Support after go-live</h2>
<p>Phone and WhatsApp support on <a href="tel:${PHONE}">${PHONE}</a>, remote assistance for configuration issues, and on-site visits within Nairobi when something needs hands on the machine.</p>`,
  },
  {
    slug: "inventory-management-software-kenya",
    title: "Inventory Management Software in Kenya | Rekonet Inv Systems",
    description:
      "Stock control software for Kenyan retailers and wholesalers: live stock levels, reorder alerts, stock takes, variance reports and multi-branch transfers.",
    eyebrow: "Stock control software",
    h1: "Inventory Management Software for Kenyan Retailers and Wholesalers",
    lede:
      "Know exactly what is on the shelf, what is moving, and what quietly disappeared — across one shop or several branches.",
    crumbs: `<a href="/">Home</a> › <span>Inventory Management Software Kenya</span>`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          name: "Rekonet Inventory Management",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Windows",
          publisher: org,
          offers: { "@type": "Offer", price: "15000", priceCurrency: "KES" },
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Inventory Management Software Kenya", path: "/inventory-management-software-kenya/" },
        ]),
      ],
    },
    body: `<h2>The problem with stock books</h2>
<p>Most losses in Kenyan retail are not dramatic theft — they are small, repeated gaps between what was bought, what was sold and what remains. Manual stock books only reveal that gap weeks later, when nobody can explain it. Software closes the loop daily.</p>

<h2>Core features</h2>
<div class="cards">
  <div class="card"><h3>Live stock levels</h3><p>Every sale, purchase and return adjusts stock immediately.</p></div>
  <div class="card"><h3>Reorder alerts</h3><p>Minimum levels per item so fast movers never run dry.</p></div>
  <div class="card"><h3>Stock takes</h3><p>Count sheets and variance reports showing expected versus counted.</p></div>
  <div class="card"><h3>Branch transfers</h3><p>Move stock between shops with a record on both sides.</p></div>
  <div class="card"><h3>Supplier records</h3><p>Purchase history, cost prices and outstanding balances.</p></div>
  <div class="card"><h3>Margin reporting</h3><p>Profit per item and per category, not just turnover.</p></div>
</div>

<h2>Works with your POS</h2>
<p>Inventory is part of the same system as the till, so there is no double entry. If you are still choosing a till, start with our <a href="/pos-system-kenya/">POS system for Kenya</a>.</p>

<h2>Pricing</h2>
${pricingTable}`,
  },
  {
    slug: "mpesa-pos-integration",
    title: "M-Pesa POS Integration for Kenyan Businesses | Rekonet",
    description:
      "Match M-Pesa till payments to POS sales automatically. Reduce fake-message fraud, speed up shift close-out and reconcile cash and mobile money daily.",
    eyebrow: "Mobile money reconciliation",
    h1: "M-Pesa POS Integration: Match Every Payment to Every Sale",
    lede:
      "Cash is countable; mobile money is not, unless your system records it. We connect your M-Pesa till or paybill records to your POS sales so shift close-out takes minutes.",
    crumbs: `<a href="/">Home</a> › <span>M-Pesa POS Integration</span>`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          name: "M-Pesa POS Integration",
          provider: org,
          areaServed: { "@type": "Country", name: "Kenya" },
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "M-Pesa POS Integration", path: "/mpesa-pos-integration/" },
        ]),
      ],
    },
    body: `<h2>Why manual M-Pesa handling costs money</h2>
<p>When a cashier reads a confirmation SMS off a phone, three things can go wrong: an edited or fake message is accepted, a genuine payment is never recorded against the sale, or the day's mobile money total simply never gets compared to the day's sales. Each one is invisible until the month-end shortfall appears.</p>

<h2>How Rekonet handles it</h2>
<ul>
  <li>Mobile money is captured as a payment type on the sale, not a side note.</li>
  <li>Split payments — part cash, part M-Pesa — are recorded on one receipt.</li>
  <li>Shift close-out compares declared cash and M-Pesa against recorded sales, per cashier.</li>
  <li>Variances are flagged the same day, with the transaction list to check against.</li>
  <li>Where a Daraja-based till or paybill feed is available, confirmations can be matched automatically.</li>
</ul>

<div class="callout"><p>Integration options depend on the M-Pesa product you hold (Buy Goods till, Paybill or Pochi). Tell us which you use on <a href="tel:${PHONE}">${PHONE}</a> and we will confirm what can be automated for your setup.</p></div>

<h2>Daily reconciliation in practice</h2>
<ol>
  <li>Cashier closes the shift and declares cash counted and M-Pesa received.</li>
  <li>The system prints expected totals from recorded sales.</li>
  <li>Any difference is shown per payment type, with the underlying transactions.</li>
  <li>The supervisor approves or investigates before the next shift starts.</li>
</ol>

<h2>Pricing</h2>
${pricingTable}`,
  },
];

const posts = [
  {
    slug: "blog/what-is-a-pos-system",
    title: "What Is a POS System? A Plain-English Guide | Rekonet",
    description:
      "A POS system records sales, updates stock and reconciles payments. Here is what it does, what hardware it needs, and when a business should get one.",
    eyebrow: "Guide",
    h1: "What Is a POS System?",
    lede:
      "A point of sale (POS) system is the software and hardware that records a sale at the moment it happens — and updates everything else in the business as a result.",
    crumbs: `<a href="/">Home</a> › <a href="/blog">Blog</a> › <span>What is a POS system?</span>`,
    body: `<p class="meta">Guide · Rekonet Inv Systems</p>
<h2>The short answer</h2>
<p>A POS system replaces the till, the receipt book and the stock book with one record. When a cashier rings up two loaves of bread, the system prints the receipt, takes the payment, reduces bread stock by two, and adds the margin to the day's profit — in a single action.</p>

<h2>The parts of a POS system</h2>
<div class="cards">
  <div class="card"><h3>Software</h3><p>The till screen, product catalogue, stock module and reports.</p></div>
  <div class="card"><h3>Computer or terminal</h3><p>An ordinary Windows PC or laptop is usually enough to start.</p></div>
  <div class="card"><h3>Receipt printer</h3><p>Thermal printer for customer receipts and shift reports.</p></div>
  <div class="card"><h3>Barcode scanner</h3><p>Optional, but it pays for itself in speed and accuracy.</p></div>
  <div class="card"><h3>Cash drawer</h3><p>Opens on sale completion and links cash to the shift.</p></div>
</div>

<h2>What it actually does day to day</h2>
<ul>
  <li>Records every sale with the item, price, cashier and time</li>
  <li>Accepts cash, mobile money and card, including split payments</li>
  <li>Keeps stock levels current and warns before items run out</li>
  <li>Closes each shift with expected versus declared takings</li>
  <li>Produces sales, margin and slow-mover reports</li>
</ul>

<h2>Cloud, offline, or both?</h2>
<p>Cloud POS stores data on a remote server and needs internet to sell. Offline-first POS keeps a local copy so trading continues during outages and syncs later. In markets where power and connectivity are unreliable, offline-first is the safer default — this is how <a href="/pos-system-kenya/">Rekonet POS</a> is built.</p>

<h2>When should a business get one?</h2>
<p>Usually at one of three moments: when stock losses stop being explainable, when more than one person handles money, or when a second branch opens. If any of those apply, a manual system is already costing more than the software would.</p>

<h2>Next steps</h2>
<p>Read the <a href="/blog/benefits-of-pos-system-for-small-business-kenya/">benefits for small businesses</a>, or <a href="/contact">book a demo</a> and see it running on your own product list.</p>`,
  },
  {
    slug: "blog/benefits-of-pos-system-for-small-business-kenya",
    title: "Benefits of a POS System for Small Businesses in Kenya | Rekonet",
    description:
      "How a POS system helps small Kenyan businesses cut stock losses, speed up service, reconcile M-Pesa and cash, and see real profit per product.",
    eyebrow: "Guide",
    h1: "Benefits of a POS System for a Small Business in Kenya",
    lede:
      "For a small shop, a POS system is less about technology and more about finally knowing where the money goes.",
    crumbs: `<a href="/">Home</a> › <a href="/blog">Blog</a> › <span>POS benefits for small business</span>`,
    body: `<p class="meta">Guide · Rekonet Inv Systems</p>
<h2>1. Stock losses become visible</h2>
<p>With every sale and delivery recorded, expected stock can be compared to counted stock at any time. Gaps show up in days rather than months, and against a specific item, shift and cashier.</p>

<h2>2. Cash and M-Pesa finally reconcile</h2>
<p>Mixed payments are the norm in Kenya. A POS records the payment type on each sale, so at close-out you compare declared cash and mobile money against what was actually sold. See <a href="/mpesa-pos-integration/">M-Pesa POS integration</a> for how this works in detail.</p>

<h2>3. Service is faster at peak hours</h2>
<p>Scanning beats searching a price list. Shorter queues at lunchtime and month-end directly protect sales you would otherwise lose to the shop next door.</p>

<h2>4. You learn what actually makes money</h2>
<p>Turnover flatters; margin tells the truth. Reports per item and category show which lines earn and which merely occupy shelf space and working capital.</p>

<h2>5. The business can run without you standing there</h2>
<p>Cashier accounts, permission levels and audit trails mean an owner can be away and still review the day's trading from the reports.</p>

<h2>6. Growing to a second branch stops being terrifying</h2>
<p>Once stock, prices and reporting are systemised, a second shop is a configuration change rather than a leap of faith. Stock transfers and consolidated reports come as standard.</p>

<h2>What it costs</h2>
${pricingTable}
<div class="callout"><p>One prevented month of unexplained stock loss usually covers the Starter package. Call <a href="tel:${PHONE}">${PHONE}</a> to talk through your shop.</p></div>

<h2>Not sure what a POS is yet?</h2>
<p>Start with <a href="/blog/what-is-a-pos-system/">What is a POS system?</a>, then read <a href="/blog/how-to-choose-pos-software-retail-kenya/">how to choose retail POS software</a>.</p>`,
  },
  {
    slug: "blog/how-to-choose-pos-software-retail-kenya",
    title: "How to Choose POS Software for Retail in Kenya | Rekonet",
    description:
      "A practical checklist for choosing retail POS software in Kenya: offline capability, M-Pesa handling, stock depth, support, total cost and data ownership.",
    eyebrow: "Guide",
    h1: "How to Choose POS Software for a Retail Shop in Kenya",
    lede:
      "Most POS demos look identical. These are the questions that separate software that survives a real trading week from software that does not.",
    crumbs: `<a href="/">Home</a> › <a href="/blog">Blog</a> › <span>Choosing retail POS software</span>`,
    body: `<p class="meta">Guide · Rekonet Inv Systems</p>
<h2>1. Does it sell when the internet is down?</h2>
<p>Ask the vendor to unplug the network during the demo. If the till stops, you have bought a liability. Offline-first systems keep trading and sync later.</p>

<h2>2. How does it handle M-Pesa?</h2>
<p>Recording "mobile money" as a payment type is the minimum. Better systems reconcile declared mobile money against recorded sales per shift and flag differences the same day.</p>

<h2>3. Is the stock module deep enough?</h2>
<p>Check for reorder levels, purchase entry with cost prices, stock takes with variance reports, and branch transfers. A till without real stock control only tells you half the story.</p>

<h2>4. Who supports you at 7pm on a Saturday?</h2>
<p>Retail problems happen during trading hours. Confirm the support channel, the response time, and whether anyone can physically reach your shop.</p>

<h2>5. What is the total cost over three years?</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Cost to check</th><th>Question to ask</th></tr></thead>
  <tbody>
    <tr><td>Licence</td><td>One-off, or per month per till?</td></tr>
    <tr><td>Installation</td><td>Included, or billed separately?</td></tr>
    <tr><td>Training</td><td>How many staff, and are refreshers free?</td></tr>
    <tr><td>Hardware</td><td>Does it work with printers you already own?</td></tr>
    <tr><td>Support</td><td>Annual fee, or pay per call-out?</td></tr>
  </tbody>
</table>
</div>

<h2>6. Can you get your own data out?</h2>
<p>Insist on exports to Excel or CSV for sales, stock and suppliers. If your data is locked inside the vendor's system, switching later becomes impossible.</p>

<h2>7. Will it grow with you?</h2>
<p>Multi-branch support, user permissions and customisation matter the day you open shop number two — long before that day arrives.</p>

<h2>Our answers</h2>
${pricingTable}
<p>Rekonet POS is offline-first, reconciles cash and M-Pesa per shift, includes full stock control, and is supported by phone and WhatsApp on <a href="tel:${PHONE}">${PHONE}</a>. You can <a href="/downloads">download OpenPOS</a> and test it before committing, or <a href="/contact">book a demo</a>.</p>`,
  },
];

function articleLd(p) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: p.h1,
        description: p.description,
        author: org,
        publisher: org,
        mainEntityOfPage: `${BASE_URL}/${p.slug}/`,
      },
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: p.h1, path: `/${p.slug}/` },
      ]),
    ],
  };
}

const all = [...pages, ...posts.map((p) => ({ ...p, jsonld: articleLd(p) }))];

for (const p of all) {
  const dir = path.join(OUT, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(p));
  console.log(`wrote public/${p.slug}/index.html`);
}

// Keep sitemap in sync
const staticRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/solutions", changefreq: "monthly", priority: "0.8" },
  { path: "/pricing", changefreq: "monthly", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/why-us", changefreq: "monthly", priority: "0.7" },
  { path: "/testimonials", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/downloads", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  ...all.map((p) => ({
    path: `/${p.slug}/`,
    changefreq: "monthly",
    priority: p.slug.startsWith("blog/") ? "0.7" : "0.9",
  })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticRoutes.map((r) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${r.path}</loc>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
].join("\n");

fs.writeFileSync(path.join(OUT, "sitemap.xml"), xml + "\n");
console.log(`sitemap.xml written (${staticRoutes.length} entries)`);
