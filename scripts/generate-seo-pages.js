// Generates static SEO landing pages and blog articles into public/<slug>/index.html
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://rekonetsystems.netlify.app";
const PHONE = "+254745522104";
const EMAIL = "rekonetsystems@outlook.com";
const OUT = path.join(__dirname, "..", "public");
const LASTMOD = new Date().toISOString().slice(0, 10);

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
          <li><a href="/stock-and-cash-reconciliation-software-kenya/">Stock &amp; Cash Reconciliation</a></li>
          <li><a href="/pos-system-mombasa/">POS System Mombasa</a></li>
          <li><a href="/openpos-download-kenya/">Download OpenPOS</a></li>
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function page({ slug, title, description, h1, eyebrow, lede, crumbs, body, jsonld }) {
  const url = `${BASE_URL}/${slug}/`;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeH1 = escapeHtml(h1);
  const safeEyebrow = escapeHtml(eyebrow);
  const safeLede = escapeHtml(lede);
  return `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${safeTitle}</title>
<meta name="description" content="${safeDescription}" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${BASE_URL}/og-image.png" />
<meta property="og:image:secure_url" content="${BASE_URL}/og-image.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Rekonet Systems — POS, inventory and custom business software" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDescription}" />
<meta name="twitter:image" content="${BASE_URL}/og-image.png" />
<meta name="twitter:image:alt" content="Rekonet Systems — POS, inventory and custom business software" />
<link rel="icon" href="/favicon.ico" />
<meta name="theme-color" content="#0a2540" />
<link rel="stylesheet" href="/src/css/seo-pages.css" />
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
${header}
<main>
  <section class="hero">
    <div class="wrap">
      <p class="eyebrow">${safeEyebrow}</p>
      <h1>${safeH1}</h1>
      <p class="lede">${safeLede}</p>
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
  {
    slug: "stock-and-cash-reconciliation-software-kenya",
    title: "Stock & Cash Reconciliation Software in Kenya | Rekonet",
    description:
      "Stop shrinkage and till shortages. Reconcile stock counts, cash and M-Pesa per shift and per branch with Rekonet reconciliation software. From KSH 35,000.",
    eyebrow: "Reconciliation software",
    h1: "Stock and Cash Reconciliation Software for Kenyan Businesses",
    lede:
      "Know exactly what was sold, what is on the shelf and what should be in the drawer — for every cashier, every shift and every branch.",
    crumbs: `<a href="/">Home</a> › <a href="/pos-system-kenya/">POS System Kenya</a> › <span>Reconciliation</span>`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          name: "Stock and Cash Reconciliation Software",
          serviceType: "Inventory and cash reconciliation",
          provider: org,
          areaServed: { "@type": "Country", name: "Kenya" },
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "POS System Kenya", path: "/pos-system-kenya/" },
          {
            name: "Stock & Cash Reconciliation",
            path: "/stock-and-cash-reconciliation-software-kenya/",
          },
        ]),
      ],
    },
    body: `<h2>Where the money quietly disappears</h2>
<p>Most Kenyan retailers lose margin in three places: stock that leaves without a sale, cash declared short at close, and M-Pesa payments that never make it to the recorded till. Manual books hide all three until the monthly stock take, by which time nobody remembers the shift in question.</p>

<h2>What the system reconciles</h2>
<div class="cards">
  <div class="card"><h3>Cash per shift</h3><p>Opening float, recorded sales, payouts and declared cash compared automatically at close-out.</p></div>
  <div class="card"><h3>M-Pesa &amp; card</h3><p>Mobile money and card totals matched against the sales recorded under each payment type.</p></div>
  <div class="card"><h3>Stock counts</h3><p>Physical counts against system stock, with variance by item, value and person who counted.</p></div>
  <div class="card"><h3>Purchases &amp; returns</h3><p>Goods received notes, supplier returns and damages tracked so stock never drifts silently.</p></div>
</div>

<h2>How a shift close-out works</h2>
<ol>
  <li>The cashier ends the shift and declares cash and mobile money on screen.</li>
  <li>The system compares declarations against recorded sales, payouts and refunds.</li>
  <li>Any variance is listed per payment type with the underlying transactions.</li>
  <li>A supervisor approves, or investigates, before the next shift begins.</li>
  <li>All variances are stored, so patterns per cashier become visible over weeks.</li>
</ol>

<h2>Reports owners actually use</h2>
<ul>
  <li>Daily variance summary by branch and cashier</li>
  <li>Stock take variance by value, so you chase the expensive items first</li>
  <li>Slow and dead stock, to free cash tied up on shelves</li>
  <li>Gross margin per product category</li>
  <li>Excel and CSV exports for your accountant</li>
</ul>

<h2>Pricing</h2>
${pricingTable}
<div class="callout"><p>Reconciliation is included from the Business package upwards. Call <a href="tel:${PHONE}">${PHONE}</a> for a quote covering your branches and tills.</p></div>
<p>Reconciliation runs on the same platform as our till software — see the <a href="/pos-system-kenya/">POS system for Kenya</a> or <a href="/contact">book a free demo</a>.</p>`,
  },
  {
    slug: "openpos-download-kenya",
    title: "Download OpenPOS — Free Offline POS Software for Windows | Rekonet",
    description:
      "Download OpenPOS, an offline-first Windows point of sale for Kenyan retail and hospitality. Sales, stock, reconciliation, reports and thermal receipt printing.",
    eyebrow: "OpenPOS for Windows",
    h1: "Download OpenPOS — Offline Point of Sale Software for Windows",
    lede:
      "OpenPOS is our Windows POS application for shops, bars and restaurants: it sells, tracks stock, reconciles the till and prints thermal receipts without needing internet.",
    crumbs: `<a href="/">Home</a> › <a href="/downloads">Downloads</a> › <span>OpenPOS</span>`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          name: "OpenPOS",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Windows 10, Windows 11",
          softwareVersion: "1.0.0",
          downloadUrl: `${BASE_URL}/downloads`,
          publisher: org,
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Downloads", path: "/downloads" },
          { name: "OpenPOS", path: "/openpos-download-kenya/" },
        ]),
      ],
    },
    body: `<h2>What OpenPOS does</h2>
<p>OpenPOS is a complete offline-first point of sale system for retail and hospitality. Everything runs on the local Windows machine, so trading continues through power flickers and internet outages.</p>
<div class="cards">
  <div class="card"><h3>Sales</h3><p>Barcode scanning, quick keys, split and part payments, held bills and refunds.</p></div>
  <div class="card"><h3>Inventory</h3><p>Live stock levels, purchases, stock takes, reorder alerts and variance tracking.</p></div>
  <div class="card"><h3>Reconciliation</h3><p>Shift close-out comparing declared cash and mobile money against recorded sales.</p></div>
  <div class="card"><h3>Printing &amp; reports</h3><p>Thermal receipt printing plus daily sales, margin and cashier reports.</p></div>
</div>

<h2>System requirements</h2>
<ul>
  <li>Windows 10 or higher</li>
  <li>500 MB free storage (installer is about 26 MB)</li>
  <li>No internet connection required for core POS operation</li>
  <li>Optional: 58 mm or 80 mm thermal receipt printer and barcode scanner</li>
</ul>

<h2>How to install</h2>
<ol>
  <li>Open the <a href="/downloads">downloads page</a> and click Download on OpenPOS.</li>
  <li>Run the downloaded setup executable.</li>
  <li>If Windows SmartScreen appears, choose <em>More info</em> then <em>Run anyway</em>.</li>
  <li>Follow the prompts, then launch OpenPOS and complete the initial shop setup.</li>
</ol>
<div class="callout"><p>Need help installing, loading your products or connecting a receipt printer? Call <a href="tel:${PHONE}">${PHONE}</a> or email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p></div>

<h2>Setup, training and support</h2>
<p>We install OpenPOS on site around Nairobi, import your product list and prices, train your cashiers and stay reachable by phone and WhatsApp afterwards. See <a href="/pricing">pricing in KSH</a> or <a href="/contact">book a free demo</a> first.</p>
<p><a class="btn btn-primary" href="/downloads">Go to the downloads page</a></p>`,
  },
  {
    slug: "pos-system-mombasa",
    title: "POS System in Mombasa — Setup, Training & Support | Rekonet",
    description:
      "POS installation and support for Mombasa shops, restaurants and wholesalers. Offline tills, stock control and M-Pesa reconciliation from KSH 15,000.",
    eyebrow: "Coast region support",
    h1: "POS System in Mombasa for Retail, Hospitality and Wholesale",
    lede:
      "From Nyali and Bamburi to Likoni, Changamwe and the Old Town, we set up point of sale systems that keep selling when the power and the line go down.",
    crumbs: `<a href="/">Home</a> › <a href="/pos-system-kenya/">POS System Kenya</a> › <span>Mombasa</span>`,
    jsonld: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          name: "POS System Installation Mombasa",
          provider: org,
          areaServed: { "@type": "City", name: "Mombasa" },
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "POS System Kenya", path: "/pos-system-kenya/" },
          { name: "Mombasa", path: "/pos-system-mombasa/" },
        ]),
      ],
    },
    body: `<h2>Built for coast trading conditions</h2>
<p>Humidity, long tourist-season hours and frequent power interruptions are hard on a till. Rekonet POS stores every sale locally, resumes exactly where it stopped after a shutdown, and runs on modest hardware you may already own.</p>

<h2>Businesses we set up in Mombasa</h2>
<ul>
  <li>Supermarkets, mini-marts and general shops</li>
  <li>Restaurants, cafés, bars and beach hotels</li>
  <li>Hardware, agrovet and building supply yards</li>
  <li>Pharmacies and cosmetics retailers</li>
  <li>Wholesalers and distributors with several branches</li>
</ul>

<h2>What the setup includes</h2>
<div class="cards">
  <div class="card"><h3>Product loading</h3><p>We import your items, prices and suppliers so the system is usable on day one.</p></div>
  <div class="card"><h3>Hardware check</h3><p>We test your printers, scanners and drawers, and advise only where something must be bought.</p></div>
  <div class="card"><h3>Staff training</h3><p>Cashiers learn selling and close-out; supervisors learn stock, pricing and reports.</p></div>
  <div class="card"><h3>Ongoing support</h3><p>Phone and WhatsApp support, remote sessions, and site visits when they are needed.</p></div>
</div>

<h2>Pricing</h2>
${pricingTable}
<div class="callout"><p>Serving Mombasa County and the wider coast — Kilifi, Diani and Malindi included. Call <a href="tel:${PHONE}">${PHONE}</a> to arrange a visit.</p></div>
<p>Read more about our <a href="/pos-system-kenya/">POS system for Kenya</a>, our <a href="/stock-and-cash-reconciliation-software-kenya/">reconciliation software</a>, or <a href="/contact">book a free demo</a>.</p>`,
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
      `    <lastmod>${LASTMOD}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
].join("\n");

fs.writeFileSync(path.join(OUT, "sitemap.xml"), xml + "\n");
console.log(`sitemap.xml written (${staticRoutes.length} entries)`);
