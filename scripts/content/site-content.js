const CONTACT = {
  baseUrl: "https://rekonetsystems.netlify.app",
  email: "rekonetsystems@outlook.com",
  phoneDisplay: "+254 745 522 104",
  phoneMachine: "+254745522104",
  whatsApp: "254745522104",
};

const LAST_UPDATED = "2026-08-31";

const PRICING_TABLE = `<div class="table-scroll">
<table aria-describedby="pos-price-note">
  <thead>
    <tr><th>Implementation</th><th>Indicative software price</th><th>What the starting scope covers</th></tr>
  </thead>
  <tbody>
    <tr><td>Starter POS</td><td><strong>From KES 25,000 one-time</strong></td><td>One Windows till, core sales and stock setup, receipt configuration, import template and one remote onboarding session.</td></tr>
    <tr><td>POS + inventory operations</td><td><strong>From KES 45,000 one-time</strong></td><td>Single-branch workflow with purchasing, stock controls, staff setup, shift reconciliation and operational reports.</td></tr>
    <tr><td>Multi-till, multi-site or custom</td><td><strong>From KES 85,000</strong></td><td>Quoted after confirming device count, branch workflow, data migration, reporting and integration requirements.</td></tr>
  </tbody>
</table>
</div>
<p class="price-note" id="pos-price-note"><strong>Pricing basis:</strong> indicative Rekonet software and implementation pricing, updated 31 August 2026. Hardware is not included. Optional integrations, travel outside Nairobi, major data cleaning, ongoing support and any hosted services are itemised separately. Any applicable tax is identified in the quotation rather than assumed in these planning figures. The written quotation is the final scope and price.</p>`;

const HARDWARE_TABLE = `<div class="table-scroll">
<table aria-describedby="hardware-price-note">
  <thead><tr><th>Hardware</th><th>Typical Kenyan retail range</th><th>Buying note</th></tr></thead>
  <tbody>
    <tr><td>Windows computer or terminal</td><td>KES 25,000–60,000+</td><td>An existing compatible PC may be reused after a requirements check.</td></tr>
    <tr><td>80 mm thermal printer</td><td>KES 8,000–18,000</td><td>Confirm Windows drivers, USB or network connection, and paper size.</td></tr>
    <tr><td>Barcode scanner</td><td>KES 3,500–12,000</td><td>Most shops can start with a wired USB scanner.</td></tr>
    <tr><td>Cash drawer</td><td>KES 5,000–12,000</td><td>Check that the drawer connects through the chosen receipt printer.</td></tr>
    <tr><td>UPS or backup power</td><td>KES 5,000–15,000+</td><td>Size it for the computer, screen, printer and local power conditions.</td></tr>
  </tbody>
</table>
</div>
<p class="price-note" id="hardware-price-note">These are planning ranges, not Rekonet hardware quotations. Brand, warranty, supplier, condition and exchange-rate changes affect the final amount. A small complete setup commonly lands around KES 45,000–100,000+, separate from software.</p>`;

const WEB_PRICING_TABLE = `<div class="table-scroll">
<table aria-describedby="web-price-note">
  <thead><tr><th>Project type</th><th>Indicative one-time build price</th><th>Typical scope</th></tr></thead>
  <tbody>
    <tr><td>Business website</td><td><strong>From KES 35,000</strong></td><td>Up to five core pages, responsive build, contact form, basic on-page SEO and launch support.</td></tr>
    <tr><td>Content-led or advanced company site</td><td><strong>From KES 65,000</strong></td><td>More templates, blog or catalogue structure, content migration and deeper integrations.</td></tr>
    <tr><td>E-commerce store</td><td><strong>From KES 85,000</strong></td><td>Product catalogue, cart, checkout setup, order emails, payment-provider connection and administrator handover.</td></tr>
    <tr><td>Custom portal or web application</td><td><strong>From KES 150,000</strong></td><td>Scoped roles, workflows, dashboards, databases and third-party integrations.</td></tr>
  </tbody>
</table>
</div>
<p class="price-note" id="web-price-note">Build fees are one-time unless the quotation states otherwise. Domain renewal, hosting, paid extensions, transaction charges, copywriting, photography, maintenance and major post-launch changes are recurring or optional costs shown separately. For initial planning, a domain commonly adds about KES 1,500–6,000 per year and basic business hosting about KES 6,000–30,000 per year; e-commerce or custom hosting can cost more. The selected provider's current invoice is the final recurring amount, and any applicable tax is identified in the quotation.</p>`;

const WEB_MARKET_NOTE = `<p class="source-note"><strong>Market basis:</strong> planning ranges were cross-checked on 31 August 2026 against advertised Kenyan packages and guides from <a href="https://novahost.co.ke/blog/website-design-cost-kenya/" rel="external">NovaHost</a>, <a href="https://modernagesolutions.co.ke/professional-website-design-packages-in-kenya/" rel="external">Modern Age Solutions</a> and <a href="https://kenyawebsite.com/service-category/website-design/" rel="external">Kenya Website</a>. Providers include different pages, content and running costs, so final comparisons must use a written scope.</p>`;

const CUSTOM_SOFTWARE_MARKET_NOTE = `<p class="source-note"><strong>Market basis:</strong> the custom-software starting point was checked against 2026 Kenyan app and ERP cost guides from <a href="https://nids.co.ke/how-much-does-it-cost-to-build-an-app-in-kenya/" rel="external">NIDS</a> and <a href="https://itkenya.com/erp-software-pricing-in-kenya/" rel="external">IT Kenya</a>. Those project types vary widely; Rekonet prices a specific first release only after discovery.</p>`;

const PAGES = [
  {
    slug: "pos-system-kenya",
    title: "POS System Kenya — Offline Sales, Stock & Reconciliation | Rekonet",
    description:
      "Rekonet POS records sales, stock movement and shift payments on Windows. See the workflow, pricing, hardware costs, exclusions and implementation steps.",
    eyebrow: "Windows POS for Kenyan businesses",
    h1: "A POS system that keeps the till and stock record together",
    lede:
      "Rekonet is an offline-first Windows point-of-sale setup for shops and counter-service businesses that need a clear record of sales, stock and shift takings.",
    crumbLabel: "POS system Kenya",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>POS system Kenya</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Scope and indicative pricing updated 31 August 2026",
    body: `<h2>What the system does</h2>
<p>At the till, the cashier selects or scans an item, confirms quantity and price, records the payment method and completes the sale. That transaction becomes part of the sales record and reduces the recorded stock quantity. A receipt can be printed where a compatible thermal printer is configured.</p>
<div class="cards">
  <div class="card"><h3>Sell</h3><p>Record item, quantity, cashier, time, price, discount and payment type in one transaction.</p></div>
  <div class="card"><h3>Control stock</h3><p>Maintain products, opening quantities, purchases, adjustments and sale-driven stock movement.</p></div>
  <div class="card"><h3>Close a shift</h3><p>Compare recorded cash and mobile-money sales with what the cashier declares at handover.</p></div>
  <div class="card"><h3>Review</h3><p>Use sales and stock reports to investigate slow items, differences and purchasing needs.</p></div>
</div>

<h2>Offline-first means the core till does not depend on internet</h2>
<p>The core desktop installation runs locally on a compatible Windows computer. A temporary internet outage should not stop a normal local sale. Any remote access, cross-branch synchronisation, cloud backup or live payment integration is a separate technical requirement and must be confirmed in the quotation; it should not be assumed from the word “offline”.</p>

<h2>What Rekonet does not bundle into the headline software price</h2>
<ul>
  <li>Computers, receipt printers, scanners, cash drawers, UPS units and networking equipment</li>
  <li>Direct M-Pesa API, eTIMS or accounting-platform integrations unless explicitly scoped</li>
  <li>Travel and accommodation for work outside the agreed service area</li>
  <li>Cleaning large or inconsistent product spreadsheets before import</li>
  <li>Hosted dashboards, domain names, cloud storage or ongoing maintenance plans</li>
</ul>
<p>This separation matters. A low software price can become misleading when hardware and implementation are hidden until later. Rekonet provides a written scope showing included work, assumptions and optional items before a paid rollout.</p>

<h2>Indicative Rekonet POS pricing</h2>
${PRICING_TABLE}

<h2>Hardware budget</h2>
${HARDWARE_TABLE}

<h2>How implementation works</h2>
<ol class="steps">
  <li><strong>Workflow review:</strong> we confirm what you sell, payment methods, users, shifts, reports, branches and current records.</li>
  <li><strong>Written scope:</strong> the quote separates the one-time software and setup fee from hardware, travel, integrations and optional support.</li>
  <li><strong>Configuration:</strong> products, staff permissions, receipt details and opening stock are prepared from an agreed template.</li>
  <li><strong>Training and test:</strong> staff run sample sales, returns, shift close and basic reports before live trading.</li>
  <li><strong>Go-live and handover:</strong> the business receives the agreed installation, backup guidance and support contact.</li>
</ol>

<h2>Who it is for</h2>
<p>The standard setup is intended for retail, wholesale, pharmacy, hardware, beauty, electronics and similar counter-sale environments. Restaurants with table service, kitchen routing, recipes or delivery aggregation need a workflow review because those requirements are not the same as a normal retail till.</p>
<div class="callout"><h3>See it with your own examples</h3><p>A useful demo should use a few of your real products and walk through a sale, mobile-money payment, stock receipt and end-of-shift difference. <a href="/contact">Request that workflow demo</a> rather than relying on a feature list.</p></div>`,
  },
  {
    slug: "inventory-management-software-kenya",
    title: "Inventory Management Software Kenya — Stock Control | Rekonet",
    description:
      "Track products, purchases, sales, adjustments and stock counts in one Windows system. Understand Rekonet inventory scope, setup and current pricing.",
    eyebrow: "Stock control for shops and stockrooms",
    h1: "Inventory records that explain how stock moved",
    lede:
      "Rekonet links each recorded sale, purchase and adjustment to the quantity on hand, so a stock difference can be investigated instead of guessed.",
    crumbLabel: "Inventory management",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>Inventory management software</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Scope and indicative pricing updated 31 August 2026",
    body: `<h2>The record starts with clean product data</h2>
<p>Inventory software cannot correct an unclear catalogue by itself. Each item needs a consistent name or code, selling unit, opening quantity and—where margin reporting is required—a cost price. Variants, packs, loose units and expiry dates need to be discussed before import because they change how stock is counted.</p>

<h2>Movements the system can record</h2>
<div class="cards">
  <div class="card"><h3>Opening stock</h3><p>The agreed starting quantity when the business begins using the system.</p></div>
  <div class="card"><h3>Purchases</h3><p>Goods received from suppliers, with quantity and cost information entered by an authorised user.</p></div>
  <div class="card"><h3>Sales and returns</h3><p>Completed POS transactions reduce stock; approved returns can put it back with an audit record.</p></div>
  <div class="card"><h3>Adjustments</h3><p>Damage, expiry, internal use or corrections are recorded with a reason instead of silently changing a figure.</p></div>
  <div class="card"><h3>Stock count</h3><p>A physical count is compared with expected quantity to produce a variance for review.</p></div>
</div>

<h2>What good stock control looks like in practice</h2>
<ul>
  <li>Receiving is entered before goods move to the selling area.</li>
  <li>Every sale is completed through the till rather than written down for later.</li>
  <li>Adjustment rights are limited and reasons are reviewed.</li>
  <li>Fast-moving or high-value categories are counted more often than the whole shop.</li>
  <li>Backups are tested, not merely assumed to exist.</li>
</ul>
<p>The software supplies the record; management discipline makes that record reliable. Rekonet onboarding therefore covers both configuration and the daily steps staff are expected to follow.</p>

<h2>Reports to confirm during a demo</h2>
<p>Ask to see current stock, low-stock or reorder information, purchases, sales by item, adjustments and a stock-count variance. If your business needs batch, serial-number, expiry, manufacturing or branch-transfer controls, put them in the written requirement list. They should not be inferred from a generic “inventory management” label.</p>

<h2>Indicative pricing</h2>
${PRICING_TABLE}
<p>Inventory can be part of a POS rollout or scoped as a deeper operational project. The amount depends mainly on catalogue condition, number of locations, user permissions, reporting and integration requirements.</p>

<h2>Prepare for an accurate quote</h2>
<p>Bring a sample product spreadsheet, one supplier invoice, a recent stock-count sheet and the reports you currently use. Rekonet can then identify what imports cleanly, what needs manual preparation and what is outside the standard setup.</p>
<p>For a practical counting method, read <a href="/blog/stock-take-and-stock-variance-kenya/">the stock-take and variance guide</a>.</p>`,
  },
  {
    slug: "stock-and-cash-reconciliation-software-kenya",
    title: "Stock & Cash Reconciliation Software Kenya | Rekonet",
    description:
      "Compare expected sales, cash, mobile-money takings and stock with what staff declare. See the end-of-shift workflow and what requires integration.",
    eyebrow: "End-of-shift control",
    h1: "Reconcile what the system expected with what the shift produced",
    lede:
      "A useful close-out does not merely total sales. It separates payment methods, records declared amounts and leaves a visible difference for review.",
    crumbLabel: "Stock and cash reconciliation",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>Stock and cash reconciliation</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Workflow and pricing updated 31 August 2026",
    body: `<h2>Four figures answer four different questions</h2>
<div class="cards">
  <div class="card"><h3>Recorded sales</h3><p>What the POS says was sold during the shift, including payment type.</p></div>
  <div class="card"><h3>Expected cash</h3><p>Opening float plus cash sales, less approved payouts or refunds recorded in the process.</p></div>
  <div class="card"><h3>Declared takings</h3><p>What the cashier actually counts or confirms at handover.</p></div>
  <div class="card"><h3>Difference</h3><p>The amount requiring an explanation, correction or management review.</p></div>
</div>

<h2>Cash, M-Pesa and card should not be mixed</h2>
<p>A sale marked cash should contribute to expected physical cash. A sale marked mobile money should be compared with the relevant phone, till or statement total. Card or bank receipts form another bucket. Recording every non-cash payment as cash hides the exact problem reconciliation is meant to reveal.</p>

<h2>Recording M-Pesa is not the same as integrating M-Pesa</h2>
<p>The standard workflow can record M-Pesa as the chosen payment method and reconcile the operator's declared total against POS sales. Automatic confirmation of individual transactions requires a supported API, credentials, connectivity, security review and testing. That direct integration is optional custom scope, not included by implication.</p>

<h2>A repeatable close-out</h2>
<ol class="steps">
  <li>Stop new transactions on the shift being closed.</li>
  <li>Print or view the sales summary by payment method.</li>
  <li>Count cash away from the cashier's expected figure where possible.</li>
  <li>Confirm mobile-money and card totals from the authoritative record.</li>
  <li>Enter the declared amounts and review each difference.</li>
  <li>Record an explanation and manager action rather than deleting the evidence.</li>
</ol>

<h2>Stock completes the picture</h2>
<p>A cash difference and a stock difference may have the same cause, but not always. A missed sale can create both. A wrong payment type changes payment reconciliation without changing stock. Damage or receiving mistakes affect stock without necessarily affecting cash. Reviewing the records together narrows the investigation.</p>

<h2>Pricing and scope</h2>
${PRICING_TABLE}
<p>Confirm user permissions, shift structure, payout handling, refunds, payment types and required reports during the demo. Direct payment feeds, accounting exports and multi-site consolidation are separately scoped.</p>
<p>Use the <a href="/blog/how-to-reconcile-mpesa-and-cash-pos/">step-by-step cash and M-Pesa guide</a> to prepare your own closing checklist.</p>`,
  },
  {
    slug: "mpesa-pos-integration",
    title: "M-Pesa & POS in Kenya — Recording vs Direct Integration | Rekonet",
    description:
      "Understand the difference between recording M-Pesa payments in a POS and building direct transaction confirmation, plus costs and questions to scope.",
    eyebrow: "Mobile-money workflow",
    h1: "M-Pesa recording and M-Pesa integration are not the same thing",
    lede:
      "Both can improve reconciliation, but they have different technical requirements, costs and failure modes. Rekonet confirms the level in writing before implementation.",
    crumbLabel: "M-Pesa and POS",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>M-Pesa and POS</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Integration scope guidance updated 31 August 2026",
    body: `<h2>Level 1: record M-Pesa as a payment method</h2>
<p>The cashier completes a sale and chooses M-Pesa instead of cash. The POS then reports expected mobile-money takings for that shift. At close, staff compare that expected total with the official till or statement record. This approach is simple, works with the offline-first till and does not claim that a transaction was automatically verified.</p>

<h2>Level 2: direct transaction confirmation</h2>
<p>A direct integration can send a payment request or query and associate a confirmed transaction with a sale. It normally needs an approved payment-provider setup, API credentials, internet connectivity, callback handling, access controls, logs and a tested fallback for downtime or delayed messages.</p>
<div class="callout"><h3>Important scope boundary</h3><p>A Rekonet POS quote includes direct M-Pesa connectivity only when the quotation names the integration, merchant account assumptions, test process and support responsibility. A payment-method button alone is not an API integration.</p></div>

<h2>Questions to answer before building</h2>
<ul>
  <li>Is the business using a till number, paybill or another collection arrangement?</li>
  <li>Should the customer enter a phone number, or will staff match a received transaction?</li>
  <li>Can a sale proceed if the provider is slow or offline?</li>
  <li>Who is allowed to override, reverse or mark a payment for later review?</li>
  <li>How will refunds and partial or split payments be handled?</li>
  <li>Which transaction reference must appear in exports or reports?</li>
</ul>

<h2>What it costs</h2>
<p>Recording M-Pesa as a payment type is part of the configured POS workflow. Direct API work is quoted separately because the amount depends on provider readiness, merchant credentials, checkout flow, testing and ongoing hosting. Provider transaction charges, shortcode fees or account fees are paid to the relevant provider and are not part of Rekonet's software fee.</p>
${PRICING_TABLE}

<h2>Reconciliation still matters after integration</h2>
<p>An integration reduces manual matching but does not remove operational checks. Duplicate callbacks, timeouts, reversals and transactions sent to the wrong account still need an exception process. The close-out should compare the POS, provider record and declared shift amount.</p>
<p>Read <a href="/blog/how-to-reconcile-mpesa-and-cash-pos/">how to reconcile cash and M-Pesa at shift end</a>, or <a href="/contact">send Rekonet your current payment flow</a> for a scoped response.</p>`,
  },
  {
    slug: "openpos-download-kenya",
    title: "OpenPOS for Windows — Download & Setup Information | Rekonet",
    description:
      "OpenPOS is Rekonet's Windows point-of-sale application. Check requirements, download-source guidance, offline scope and setup options before installing.",
    eyebrow: "Windows desktop application",
    h1: "OpenPOS download and setup information",
    lede:
      "Use Rekonet's Downloads page as the current source for available installers and release details; do not rely on copied files or old links.",
    crumbLabel: "OpenPOS download",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/downloads">Downloads</a> <span aria-hidden="true">›</span> <span>OpenPOS</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Download guidance updated 31 August 2026",
    body: `<h2>Supported platform</h2>
<p>OpenPOS is presented as a Windows desktop application for Windows 10 or Windows 11. It is not an Android APK. The core point-of-sale workflow is designed to run locally, so a routine sale does not depend on a continuous internet connection.</p>

<h2>Before downloading</h2>
<ul>
  <li>Confirm that the computer runs a supported Windows version and has a current system backup.</li>
  <li>Check that receipt printers and other peripherals have compatible Windows drivers.</li>
  <li>Download only from the <a href="/downloads">Rekonet Downloads page</a> or a link Rekonet confirms directly.</li>
  <li>Do not bypass an unexpected browser, antivirus or Windows warning without checking the file source with Rekonet.</li>
  <li>Plan where application and business-data backups will be stored before live use.</li>
</ul>

<h2>What the local application is for</h2>
<div class="cards">
  <div class="card"><h3>Point of sale</h3><p>Product selection, payment-method recording and thermal receipt output where configured.</p></div>
  <div class="card"><h3>Stock</h3><p>Products, recorded purchases, sale-driven movement, adjustments and counts.</p></div>
  <div class="card"><h3>Close-out</h3><p>Sales summaries and declared payment amounts for shift review.</p></div>
  <div class="card"><h3>Reports</h3><p>Operational sales and inventory information available in the installed version.</p></div>
</div>

<h2>Installation is not the whole rollout</h2>
<p>A blank application still needs products, users, receipt details, opening stock, payment methods and a backup routine. Rekonet can quote a configured rollout, import assistance, training and hardware checks separately from access to an installer.</p>

<h2>Pricing</h2>
${PRICING_TABLE}
<p>If the Downloads page shows no current file, contact Rekonet rather than using a third-party copy. Availability, version and licence terms shown on the download record take precedence over older articles or screenshots.</p>
<p><a class="btn btn-solid" href="/downloads">Open the Rekonet Downloads page</a></p>`,
  },
  {
    slug: "pos-system-nairobi",
    title: "POS System Nairobi — Setup, Training & Clear Costs | Rekonet",
    description:
      "Nairobi POS setup for retail and counter-service businesses, with software, hardware, data preparation, training and optional support priced separately.",
    eyebrow: "Nairobi implementation",
    h1: "POS setup for Nairobi businesses",
    lede:
      "Rekonet is based in Nairobi and offers remote onboarding plus on-site work by appointment where the written quotation includes it.",
    crumbLabel: "POS system Nairobi",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>POS system Nairobi</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Service-area and pricing details updated 31 August 2026",
    body: `<h2>What a Nairobi rollout can include</h2>
<ul>
  <li>Workflow review and hardware compatibility check</li>
  <li>Installation on the agreed Windows computer or till</li>
  <li>Product import from a clean template, with data-cleaning limits stated in advance</li>
  <li>Receipt, payment-method, user and opening-stock configuration</li>
  <li>Staff walkthrough using sample sales, returns and shift close</li>
  <li>On-site attendance where specifically scheduled and included</li>
</ul>
<p>“Nairobi setup” does not mean unlimited site visits. The quotation states the site, visit count, working hours and any transport or parking cost that applies.</p>

<h2>Indicative software pricing</h2>
${PRICING_TABLE}

<h2>Plan hardware separately</h2>
${HARDWARE_TABLE}

<h2>What to send before the visit</h2>
<p>A short video or photographs of the till area, computer specifications, printer model, sample product file, payment methods and staff count help resolve problems before anyone travels. If the business is trading already, agree whether setup happens after hours and who will approve the opening figures.</p>

<h2>Remote support and site work</h2>
<p>Many configuration and troubleshooting tasks can be handled remotely. Physical attendance depends on location, schedule and the support arrangement in the quotation. Rekonet does not advertise an unsupported 24/7 or guaranteed response time; urgent-cover requirements need their own written service agreement.</p>
<div class="callout"><h3>Prepare a useful demo</h3><p>Bring five real products, one receipt layout, your main payment types and a recent end-of-day problem. <a href="/contact">Request a Nairobi demo</a> and include your area and preferred date.</p></div>`,
  },
  {
    slug: "pos-system-mombasa",
    title: "POS System Mombasa — Remote Setup & Travel by Quote | Rekonet",
    description:
      "Rekonet supports Mombasa businesses remotely and can scope on-site travel separately. See POS software, hardware and implementation costs clearly.",
    eyebrow: "Coast and Mombasa enquiries",
    h1: "POS implementation for a Mombasa business",
    lede:
      "Remote discovery, configuration and training are available across Kenya. Any Mombasa site visit, transport or accommodation is agreed and priced before travel.",
    crumbLabel: "POS system Mombasa",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>POS system Mombasa</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Coverage and pricing details updated 31 August 2026",
    body: `<h2>Transparent service coverage</h2>
<p>Rekonet is based in Nairobi. For a Mombasa, Diani, Kilifi or other coast project, the normal first steps can happen by phone, video call and remote computer session. On-site work is available only when confirmed in the quotation. Rekonet does not claim a permanent coast office or an on-site team where none has been verified.</p>

<h2>What can be done remotely</h2>
<ul>
  <li>Workflow and requirements review</li>
  <li>Product-template preparation and import guidance</li>
  <li>Windows application setup where secure remote access is available</li>
  <li>User, receipt and payment-method configuration</li>
  <li>Screen-share training and test transactions</li>
  <li>Follow-up troubleshooting under the agreed support arrangement</li>
</ul>

<h2>When an on-site visit may be useful</h2>
<p>Complex peripheral setup, unreliable local networking, several tills, large data preparation or a staff group that needs in-person training can justify travel. The quote should separate professional work from transport, accommodation and any extra day required by distance.</p>

<h2>Indicative software and hardware costs</h2>
${PRICING_TABLE}
${HARDWARE_TABLE}

<h2>Connectivity and power planning</h2>
<p>The offline-first till reduces dependence on continuous internet for core sales, but the computer and printer still need stable power. A UPS, tested backups and clear responsibility for router or local-network faults are practical parts of the rollout. Hosted features or remote support naturally require connectivity.</p>
<div class="callout"><h3>Ask for a written remote-versus-site plan</h3><p>When contacting Rekonet, include the town, till count, current computer and printer models, and whether staff can join a video session. The response can then identify what is remote, what requires travel and what it will cost.</p></div>`,
  },
  {
    slug: "website-design-kenya",
    title: "Business Website Design Kenya — Scope, Price & Recurring Costs | Rekonet",
    description:
      "Rekonet builds responsive business websites from KES 35,000. See what is included and how hosting, domains, content and maintenance are priced.",
    eyebrow: "Websites with a defined scope",
    h1: "Business website design with build and running costs separated",
    lede:
      "A useful website quote states the pages, content responsibilities, forms, integrations, hosting and post-launch support instead of hiding them behind one vague package price.",
    crumbLabel: "Website design Kenya",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>Website design Kenya</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Indicative pricing updated 31 August 2026",
    body: `<h2>What Rekonet can build</h2>
<div class="cards">
  <div class="card"><h3>Company website</h3><p>Home, about, services, contact and other agreed information pages.</p></div>
  <div class="card"><h3>Catalogue site</h3><p>Structured product or service listings without an online checkout.</p></div>
  <div class="card"><h3>Content site</h3><p>Blog or guide structure for businesses that need ongoing publishing.</p></div>
  <div class="card"><h3>Custom web workflow</h3><p>Forms, portals or dashboards that need separate discovery and engineering.</p></div>
</div>

<h2>Indicative build pricing</h2>
${WEB_PRICING_TABLE}
${WEB_MARKET_NOTE}

<h2>What the entry business-site scope assumes</h2>
<ul>
  <li>The client supplies approved logo, business details and page content on time.</li>
  <li>One visual direction and a stated number of revision rounds are agreed.</li>
  <li>The contact form has a defined destination and is tested before launch.</li>
  <li>Basic titles, descriptions, headings, accessibility checks and responsive layouts are included.</li>
  <li>Advanced booking, membership, multilingual, payment or database functions are not assumed.</li>
</ul>

<h2>Recurring costs to budget for</h2>
<p>A domain is normally renewed annually. Hosting may be monthly or annual. Business email, premium plugins, content updates, security maintenance and backups may also carry recurring fees. Rekonet's quote identifies which supplier bills each item and what happens if a subscription is not renewed.</p>

<h2>Content and ownership</h2>
<p>The proposal should state who writes copy, supplies images and confirms legal claims. It should also identify the account owner for the domain, hosting and website platform, plus how the client can receive an export or handover. Rekonet does not add fabricated customer numbers, testimonials, rankings or staff profiles as filler.</p>

<h2>Before requesting a quote</h2>
<p>List the desired pages, two sites whose structure you like, the action a visitor should take, any forms or integrations, and who will maintain content after launch. That information produces a far more accurate estimate than asking for “a modern website”.</p>`,
  },
  {
    slug: "ecommerce-website-development-kenya",
    title: "E-commerce Website Development Kenya — Costs & Scope | Rekonet",
    description:
      "E-commerce builds from KES 85,000, with catalogue, checkout, payment connection, hosting, transaction fees and support clearly separated.",
    eyebrow: "Online stores for Kenyan businesses",
    h1: "An e-commerce store is a sales operation, not only a website",
    lede:
      "The build must connect products, stock responsibility, checkout, payment, delivery, customer communication and order handling into one workable process.",
    crumbLabel: "E-commerce development",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>E-commerce development Kenya</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Indicative pricing updated 31 August 2026",
    body: `<h2>Starting scope</h2>
<p>A standard Rekonet e-commerce quotation can include a responsive storefront, category and product templates, cart, checkout, order notifications, an agreed payment-provider connection, basic delivery rules and administrator handover. Product photography, copy, bulk catalogue cleaning and complex integrations are separate unless named.</p>

<h2>Indicative project pricing</h2>
${WEB_PRICING_TABLE}
${WEB_MARKET_NOTE}

<h2>Costs beyond the build</h2>
<ul>
  <li>Domain and hosting renewals</li>
  <li>Payment-provider transaction, account or settlement charges</li>
  <li>Premium platform extensions or third-party services</li>
  <li>Product entry, photography, copywriting and catalogue maintenance</li>
  <li>Security updates, backups and support after the agreed launch period</li>
  <li>Courier or delivery-platform integration and related fees</li>
</ul>

<h2>M-Pesa connection needs provider readiness</h2>
<p>Adding an M-Pesa logo is not payment integration. The merchant account, provider method, credentials, test environment, callbacks, failed-payment flow and settlement responsibility must be known. Rekonet lists the chosen provider and assumptions in the scope.</p>

<h2>Stock needs one source of truth</h2>
<p>If the same goods sell in a physical shop and online, decide where available quantity comes from and how quickly each channel updates. A custom link to a POS or inventory system is not automatically included in a normal store build. Overselling risk, cancellations and manual fallback should be discussed before launch.</p>

<h2>Launch checklist</h2>
<ul>
  <li>Place successful, failed and abandoned test orders.</li>
  <li>Check email or messaging notifications and the administrator order view.</li>
  <li>Test delivery fees for every intended area.</li>
  <li>Confirm refund, returns, privacy and terms pages.</li>
  <li>Verify analytics or marketing tools only if the business has consented to use them.</li>
  <li>Document who responds to an order and within what business process.</li>
</ul>
<p><a href="/contact">Request an e-commerce scope</a> with approximate product count, payment method, delivery areas and any current stock system.</p>`,
  },
  {
    slug: "custom-software-development-kenya",
    title: "Custom Software Development Kenya — Discovery & Pricing | Rekonet",
    description:
      "Custom business software starts from KES 150,000 after discovery. Rekonet defines roles, workflows, integrations, hosting and support before development.",
    eyebrow: "Scoped business applications",
    h1: "Custom software begins with a process, not a feature wish list",
    lede:
      "Rekonet maps the users, decisions, data and exceptions in a business workflow before estimating a portal, dashboard, integration or internal system.",
    crumbLabel: "Custom software development",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>Custom software development Kenya</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Discovery and pricing guidance updated 31 August 2026",
    body: `<h2>What can be custom scope</h2>
<p>Examples include internal approval workflows, customer or supplier portals, field-data tools, reporting dashboards, booking systems, integrations and extensions to an existing POS or inventory process. “Custom” does not mean every feature is built at once; the first release should solve a defined operational problem.</p>

<h2>Indicative starting prices</h2>
${WEB_PRICING_TABLE}
${CUSTOM_SOFTWARE_MARKET_NOTE}
<p>A focused internal tool may start around KES 150,000. Mobile applications, complex permissions, offline synchronisation, financial workflows, multiple external systems or high availability can move substantially above that starting point. A price without discovery would be unreliable.</p>

<h2>Discovery output</h2>
<ul>
  <li>Problem statement and success measure</li>
  <li>User roles and permission boundaries</li>
  <li>Core workflow plus exceptions and approvals</li>
  <li>Data to import, store, export and delete</li>
  <li>External services and who owns their accounts</li>
  <li>Security, backup, hosting and support assumptions</li>
  <li>Prioritised first release, exclusions and acceptance checks</li>
</ul>

<h2>Costs that may recur</h2>
<p>Hosting, databases, email or SMS, maps, payment providers, app-store accounts, monitoring and maintenance can all be recurring. Rekonet identifies third-party fees separately from development and states who pays the supplier.</p>

<h2>Change control protects both sides</h2>
<p>The approved scope defines the price. A new role, report, integration or workflow may be a change rather than a “small adjustment”. Rekonet should describe the effect on cost and timeline before implementing it. This is more credible than an unlimited-feature promise.</p>

<h2>Ownership and handover</h2>
<p>The proposal or contract should identify licence terms, source-code handover if applicable, client data ownership, administrator access, documentation and what support exists after acceptance. These terms vary by project and are not inferred from the website.</p>
<div class="callout"><h3>Bring one real process</h3><p>Send a sample form, spreadsheet or report and describe who creates it, who approves it and what commonly goes wrong. That is enough to begin a useful discovery conversation.</p></div>`,
  },
  {
    kind: "legal",
    slug: "privacy-policy",
    title: "Privacy Policy | Rekonet Inv Systems",
    description:
      "How Rekonet Inv Systems handles contact enquiries, website technical data and business information submitted through this site.",
    eyebrow: "Website information",
    h1: "Privacy policy",
    lede:
      "This policy explains the information this website may receive, why it is used and how to contact Rekonet about it.",
    crumbLabel: "Privacy policy",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>Privacy policy</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Effective 31 August 2026",
    hideHeroButtons: true,
    hideCta: true,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Rekonet Inv Systems privacy policy",
      url: `${CONTACT.baseUrl}/privacy-policy/`,
      dateModified: LAST_UPDATED,
    },
    body: `<h2>Information you choose to provide</h2>
<p>When you use a contact form, newsletter form, email, phone call or WhatsApp link, Rekonet may receive your name, business name, contact details, message and any files or operational information you decide to share. A newsletter signup stores the submitted email address so Rekonet can send occasional product notes and practical guides. Do not send passwords, payment credentials, customer identity documents or full production databases through the public contact form.</p>

<h2>Why the information is used</h2>
<ul>
  <li>To respond to an enquiry and arrange a demo, quote or support conversation</li>
  <li>To send requested newsletter updates until the subscriber asks to stop</li>
  <li>To understand requested services and prepare an appropriate scope</li>
  <li>To protect the site, diagnose technical problems and prevent abuse</li>
  <li>To keep records required for an agreed business relationship or legal obligation</li>
</ul>

<h2>Website providers and logs</h2>
<p>The site is hosted by Netlify and uses Supabase for some application data and form-related functions. Those providers may process technical information such as IP address, browser details, request time and service logs under their own terms. This site does not intentionally load Google Analytics or advertise behavioural tracking as of the effective date above.</p>

<h2>Sharing and retention</h2>
<p>Rekonet does not state that it sells personal information. Information may be handled by service providers needed to host or operate the site, or disclosed where legally required. Enquiry and project records should be kept only as long as reasonably needed for the purpose, support history, accounting, dispute handling or a legal requirement.</p>

<h2>Your choices</h2>
<p>You may ask what personal information Rekonet holds about your enquiry, request a correction or deletion where applicable, or object to an unnecessary use. Some records may need to be retained where a contract or law requires it.</p>

<h2>Contact</h2>
<p>Email <a href="mailto:${CONTACT.email}">${CONTACT.email}</a> or call <a href="tel:${CONTACT.phoneMachine}">${CONTACT.phoneDisplay}</a> with a privacy question. Include enough information to identify the relevant enquiry, but do not send sensitive credentials.</p>`,
  },
  {
    kind: "legal",
    slug: "terms-of-service",
    title: "Website Terms | Rekonet Inv Systems",
    description:
      "Terms for using the Rekonet website, including indicative pricing, downloads, third-party links and the role of written project quotations.",
    eyebrow: "Website information",
    h1: "Website terms",
    lede:
      "These terms apply to public website use. A signed proposal, quotation or contract governs any paid software or service engagement.",
    crumbLabel: "Website terms",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <span>Website terms</span>',
    updated: LAST_UPDATED,
    updatedLabel: "Effective 31 August 2026",
    hideHeroButtons: true,
    hideCta: true,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Rekonet Inv Systems website terms",
      url: `${CONTACT.baseUrl}/terms-of-service/`,
      dateModified: LAST_UPDATED,
    },
    body: `<h2>General information, not a final offer</h2>
<p>Service descriptions, planning ranges and articles on this website are general information. A project starts only when the parties approve the applicable written quotation, proposal or agreement. That document defines deliverables, dates, payment terms, licence, support and exclusions.</p>

<h2>Prices</h2>
<p>Prices marked “from”, “indicative”, “typical” or “market range” are not fixed offers. Hardware, third-party services, taxes where applicable, travel, integrations, data preparation and changed requirements may alter the total. The current written quotation takes precedence over website copy.</p>

<h2>Downloads</h2>
<p>Use only download links shown on Rekonet's current Downloads page or confirmed directly by Rekonet. Check requirements and keep backups before installing software. Licence and support terms shown with the download or in a separate agreement apply. Do not bypass an unexpected security warning without verifying the source.</p>

<h2>Acceptable website use</h2>
<p>Do not attempt to disrupt the site, gain unauthorised access, upload malicious content, misuse contact forms or copy protected material in a way that violates applicable law. Links to third-party sites are provided for convenience; those services control their own availability and terms.</p>

<h2>Accuracy and availability</h2>
<p>Rekonet aims to keep public information useful but does not publish an unsupported uptime, response-time, savings or results guarantee. Features can differ by version and project scope. Contact Rekonet to verify an important requirement before relying on it.</p>

<h2>Intellectual property and client data</h2>
<p>Website content and Rekonet materials remain subject to their applicable ownership and licence terms. A custom project's contract should separately identify source-code rights, software licence, client data, third-party components and handover.</p>

<h2>Contact</h2>
<p>Questions about these website terms can be sent to <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>.</p>`,
  },
];

const articleDefaults = {
  published: "2026-08-31",
  updated: "2026-08-31",
  displayDate: "31 August 2026",
};

const POSTS = [
  {
    ...articleDefaults,
    slug: "blog/what-is-a-pos-system",
    title: "What Is a POS System? A Plain-English Guide | Rekonet",
    cardTitle: "What is a POS system?",
    description:
      "A practical explanation of POS software, hardware, stock movement, payments, reports, offline operation and what a system does not automate by itself.",
    eyebrow: "POS basics",
    h1: "What is a POS system?",
    lede:
      "A point-of-sale system records a sale when it happens and connects that transaction to payment, stock and reporting records.",
    category: "POS basics",
    readTime: "4",
    keywords: ["POS system", "point of sale Kenya", "POS hardware", "inventory"],
    image: "/images/blog/what-is-a-pos-system.jpg",
    imageAlt:
      "Shop attendant using a point-of-sale computer with a receipt printer and scanner at a Kenyan retail counter",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>What is a POS system?</span>',
    related: [
      "blog/how-to-choose-pos-software-retail-kenya",
      "blog/pos-system-cost-kenya-2026",
      "blog/pos-hardware-checklist-kenya",
    ],
    body: `<h2>The shortest useful answer</h2>
<p>A POS system is the combination of software and equipment used to complete a sale. Instead of writing a receipt and updating a stock book later, the cashier records the item, quantity, price and payment method in one transaction. The system keeps that sale for later reports and, when inventory is configured, reduces the recorded quantity.</p>

<h2>The software and hardware are different costs</h2>
<p>The software is the till screen, product catalogue, user access, stock record and reports. Hardware can include a Windows computer or specialised terminal, receipt printer, barcode scanner, cash drawer, customer display and backup power. A business may reuse compatible equipment, so a credible quote shows the two budgets separately.</p>
<div class="cards">
  <div class="card"><h3>Computer</h3><p>Runs the application. Confirm operating system, memory, storage and ports.</p></div>
  <div class="card"><h3>Receipt printer</h3><p>Usually an 80 mm thermal printer with a compatible Windows driver.</p></div>
  <div class="card"><h3>Barcode scanner</h3><p>Speeds up item entry but does not fix missing or duplicated product codes.</p></div>
  <div class="card"><h3>Cash drawer</h3><p>Stores cash and may connect through the printer; it does not count cash automatically.</p></div>
</div>

<h2>What happens during a normal sale</h2>
<ol class="steps">
  <li>The cashier signs in and begins an authorised shift.</li>
  <li>An item is scanned or selected from the catalogue.</li>
  <li>The cashier confirms quantity, price and any permitted discount.</li>
  <li>The payment type—cash, mobile money, card or another configured method—is recorded.</li>
  <li>The transaction is completed, the stock record changes and a receipt can print.</li>
  <li>At shift end, expected payments are compared with declared amounts.</li>
</ol>

<h2>What “M-Pesa support” can mean</h2>
<p>At minimum, a POS can record that a customer paid by M-Pesa and total those sales for reconciliation. Direct confirmation of a specific M-Pesa transaction is a separate API integration. Ask the vendor which level is included. A mobile-money button on screen is not proof of a direct connection.</p>

<h2>Offline, cloud and hybrid</h2>
<p>An offline-first POS stores the working data needed for core selling on the local machine. A hosted or cloud system primarily uses remote infrastructure, although some cloud products also provide an offline mode. A hybrid combines local operation with selected remote services. The practical questions are: can staff sell during an outage, what data is unavailable, how does recovery work and who owns the backup?</p>

<h2>What a POS does not solve by itself</h2>
<ul>
  <li>Unclean product names, units and opening quantities</li>
  <li>Staff sharing passwords or bypassing the till</li>
  <li>Goods received without being entered</li>
  <li>Cash payouts or refunds made outside the agreed process</li>
  <li>Backups that are never tested</li>
</ul>
<p>The system makes activity visible; management still needs a routine for receiving, selling, counting, closing and reviewing differences.</p>

<h2>When a business is ready</h2>
<p>A POS becomes useful when more than one person handles money, stock differences are hard to explain, price lookup slows service, or management needs item-level reports. Before buying, list payment types, product count, staff, branches, required reports and current equipment. That list is more valuable than a generic feature checklist.</p>
<div class="callout"><h3>Rekonet's current starting point</h3><p>Rekonet's offline-first Windows POS implementation starts from KES 25,000 for the defined software and setup scope. Hardware and optional integrations are separate. See <a href="/pos-system-kenya/">the detailed pricing and exclusions</a>.</p></div>`,
  },
  {
    ...articleDefaults,
    slug: "blog/benefits-of-pos-system-for-small-business-kenya",
    title: "POS Benefits for a Small Business in Kenya | Rekonet",
    cardTitle: "POS benefits for a small Kenyan business",
    description:
      "How a well-run POS helps a small shop with pricing, stock, cash and M-Pesa reconciliation, staff accountability and purchasing decisions.",
    eyebrow: "Small-business operations",
    h1: "Benefits of a POS system for a small business in Kenya",
    lede:
      "The main benefit is not a smarter-looking till. It is a consistent record that lets the owner ask better questions about money and stock.",
    category: "Operations",
    readTime: "4",
    keywords: ["small business POS Kenya", "POS benefits", "stock control", "M-Pesa reconciliation"],
    image: "/images/blog/pos-benefits-small-business-kenya.jpg",
    imageAlt:
      "Kenyan shop owner reviewing sales and stock information on a laptop inside a neighbourhood retail store",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>POS benefits</span>',
    related: [
      "blog/what-is-a-pos-system",
      "blog/how-to-reconcile-mpesa-and-cash-pos",
      "blog/stock-take-and-stock-variance-kenya",
    ],
    body: `<h2>1. Prices become consistent</h2>
<p>A product catalogue gives authorised staff one current selling price instead of relying on memory, stickers or messages. If prices can be changed at the till, the system should limit who can do it and preserve the adjustment in a report.</p>

<h2>2. Stock movement has a transaction behind it</h2>
<p>Each completed sale reduces recorded quantity. Purchases add quantity, and damage or corrections use an adjustment with a reason. This does not make the stock automatically correct—receiving and counts still matter—but it creates a trail for investigating differences.</p>

<h2>3. Cash and M-Pesa can be reviewed separately</h2>
<p>Kenyan businesses often receive several payment types in one shift. If cash, M-Pesa and card are marked correctly on each sale, the close-out can compare expected cash with physical cash and expected mobile money with the provider's record. A wrong payment type then appears as a classification issue instead of an unexplained overall shortage.</p>

<h2>4. The owner can review the day by item and user</h2>
<p>A total turnover figure does not show who processed a transaction, which products moved, whether discounts were used or which category generated sales. User accounts and item-level reports provide context. Permissions matter: each person should use an individual account rather than a shared administrator login.</p>

<h2>5. Reordering becomes evidence-based</h2>
<p>Current quantity, recent movement and reorder levels can guide purchases. This helps prevent cash being tied up in slow stock while fast sellers run out. The owner still needs to consider supplier lead time, seasonality and minimum order quantities; the report is an input, not an automatic buying decision.</p>

<h2>6. Peak-hour service can be faster</h2>
<p>Barcode scanning and a clean catalogue reduce price search and arithmetic. Speed depends on preparation: duplicate items, missing barcodes, slow hardware and staff who have not practised can remove the benefit. Test the busiest realistic basket during a demo.</p>

<h2>7. A second location becomes easier to plan</h2>
<p>A documented product, receiving, shift and stock-count process gives a second branch a repeatable starting point. Do not assume every POS shares data across branches. Ask whether sites are independent, manually consolidated or connected through a hosted service, and put the answer in the scope.</p>

<h2>What the benefit depends on</h2>
<ul>
  <li>Accurate opening stock and product units</li>
  <li>Every sale going through the till</li>
  <li>Purchases being entered when goods arrive</li>
  <li>Individual staff accounts and controlled permissions</li>
  <li>Regular close-outs, counts and tested backups</li>
</ul>

<h2>Does the benefit justify the cost?</h2>
<p>Compare the complete three-year cost: software, hardware, setup, training, support, hosting and integrations. Then identify the current cost of repeated stock differences, manual report preparation, pricing errors and delayed purchasing decisions. Avoid a vendor who promises a percentage increase in sales without evidence from your business.</p>
<div class="callout"><h3>Start with one measurable problem</h3><p>Examples are unexplained shift differences, no item-level sales record or a stock count that takes several days. Demonstrate that workflow before expanding the project.</p></div>`,
  },
  {
    ...articleDefaults,
    slug: "blog/how-to-choose-pos-software-retail-kenya",
    title: "How to Choose Retail POS Software in Kenya | Rekonet",
    cardTitle: "How to choose retail POS software",
    description:
      "A vendor-neutral checklist for offline selling, stock depth, M-Pesa handling, hardware, data export, support, security and full three-year cost.",
    eyebrow: "Buying checklist",
    h1: "How to choose POS software for a retail shop in Kenya",
    lede:
      "Most demonstrations make a sale look easy. The better test is how the system handles an outage, a stock difference, a return and a difficult shift close.",
    category: "Buying guides",
    readTime: "4",
    keywords: ["choose POS Kenya", "retail POS checklist", "offline POS", "POS cost"],
    image: "/images/blog/choose-retail-pos-kenya.jpg",
    imageAlt:
      "Kenyan retail manager assessing a point-of-sale screen with scanner and receipt printer at a shop counter",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>Choose retail POS</span>',
    related: [
      "blog/pos-system-cost-kenya-2026",
      "blog/offline-vs-cloud-pos-kenya",
      "blog/pos-hardware-checklist-kenya",
    ],
    body: `<h2>1. Demonstrate the internet-down workflow</h2>
<p>Ask what happens when connectivity disappears before, during and after a sale. Can staff continue? Which functions stop? How are queued activities recovered? “Cloud” and “offline” are architecture labels, not complete answers, so test the actual version being offered.</p>

<h2>2. Use your own product complications</h2>
<p>Bring examples sold by piece, pack, weight or variant. Include a product with changing cost, a return and a damaged item. A basic till may handle sales well but lack the inventory detail your shop needs.</p>

<h2>3. Separate M-Pesa recording from integration</h2>
<p>Confirm whether the cashier simply marks M-Pesa, enters a reference, or receives automatic transaction confirmation. If an API is involved, ask who owns credentials, what happens during provider downtime and which recurring hosting or transaction fees apply.</p>

<h2>4. Close a sample shift</h2>
<p>Run cash and mobile-money sales, a discount, a return and an approved payout. Then close the shift with one intentional difference. The demonstration should show expected amounts, declared amounts, the variance and who can change or approve it.</p>

<h2>5. Check permissions and audit records</h2>
<ul>
  <li>Can a cashier edit price, cost or historical transactions?</li>
  <li>Who can process returns and stock adjustments?</li>
  <li>Are users individual, or does everyone share one password?</li>
  <li>Can management see the user and time behind important changes?</li>
</ul>

<h2>6. Price the hardware that will actually work</h2>
<p>Get model-level compatibility for the computer, printer, scanner, drawer and UPS. “Works with any printer” is not a useful warranty. If reusing equipment, test drivers and connection types before committing.</p>

<h2>7. Ask for an export and a backup restore</h2>
<p>Find out which records export to CSV, spreadsheet or another usable format. Ask where backups live, who creates them and how a restore is tested. A backup icon is not the same as a recoverable copy.</p>

<h2>8. Define support instead of accepting “24/7”</h2>
<p>Write down channels, normal hours, expected response target, remote-access method, on-site availability and chargeable incidents. If after-hours cover is important, request a support agreement that actually states it.</p>

<h2>9. Calculate three-year cost</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Cost</th><th>Question</th></tr></thead>
  <tbody>
    <tr><td>Software</td><td>One-time, monthly, annual, per till, per user or per branch?</td></tr>
    <tr><td>Implementation</td><td>What configuration, import and training are included?</td></tr>
    <tr><td>Hardware</td><td>What must be bought now, and what warranty applies?</td></tr>
    <tr><td>Integration</td><td>Which setup, provider and hosting fees recur?</td></tr>
    <tr><td>Support</td><td>Included period, annual plan or pay per incident?</td></tr>
    <tr><td>Exit</td><td>Can data be exported, and is migration assistance chargeable?</td></tr>
  </tbody>
</table>
</div>

<h2>10. Put promises in the quotation</h2>
<p>The selected version, devices, sites, features, exclusions, dates, payment terms and acceptance checks belong in writing. Website claims and demo conversation should not replace scope.</p>
<div class="callout"><h3>Rekonet comparison point</h3><p>Rekonet's standard model starts from KES 25,000 one-time for one Windows till and defined onboarding. Hardware, travel, hosted functions, major data work and direct integrations are separate. <a href="/pos-system-kenya/">Review the full scope notes</a>.</p></div>`,
  },
  {
    ...articleDefaults,
    slug: "blog/pos-system-cost-kenya-2026",
    title: "POS System Cost in Kenya (2026): Software, Hardware & Setup | Rekonet",
    cardTitle: "POS system cost in Kenya: 2026 guide",
    description:
      "Current planning ranges for POS software, computers, printers, scanners, drawers, UPS, setup, support and integrations in Kenya.",
    eyebrow: "2026 cost guide",
    h1: "How much does a POS system cost in Kenya in 2026?",
    lede:
      "A realistic budget has at least three lines: software, implementation and hardware. Support, hosted services and integrations may add recurring costs.",
    category: "Pricing",
    readTime: "5",
    keywords: ["POS system price Kenya 2026", "POS hardware cost", "POS software Kenya", "POS setup cost"],
    image: "/images/blog/pos-system-cost-kenya.jpg",
    imageAlt:
      "Complete point-of-sale hardware setup with Windows monitor, printer, scanner, cash drawer and UPS in a Kenyan shop",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>POS cost Kenya</span>',
    related: [
      "blog/pos-hardware-checklist-kenya",
      "blog/how-to-choose-pos-software-retail-kenya",
      "blog/offline-vs-cloud-pos-kenya",
    ],
    body: `<h2>Fast planning answer</h2>
<p>Advertised Kenyan POS software ranges in 2026 commonly begin around KES 20,000–30,000 for a basic one-time setup, while more capable single-branch packages often sit around KES 30,000–60,000. Multi-till, restaurant, multi-branch and custom work can reach KES 60,000–120,000 or more. Subscription products commonly advertise roughly KES 1,500–10,000 per month at the smaller-business end, with higher prices for more users, branches or modules.</p>
<p>A usable small-business hardware set commonly adds around KES 45,000–100,000+, depending on whether a computer is reused and which peripherals are required. These are planning ranges, not a quotation or a complete survey of every Kenyan vendor.</p>

<h2>Software payment models</h2>
<div class="cards">
  <div class="card"><h3>One-time licence and setup</h3><p>Higher initial amount. Confirm what updates, support and future device changes cost.</p></div>
  <div class="card"><h3>Monthly subscription</h3><p>Lower entry cost. Confirm price per till, user or branch and what happens when payment stops.</p></div>
  <div class="card"><h3>Custom project</h3><p>Priced around requirements, delivery stages and acceptance. Hosting and maintenance are usually separate.</p></div>
</div>

<h2>Hardware planning ranges</h2>
${HARDWARE_TABLE}

<h2>Implementation charges people overlook</h2>
<ul>
  <li>Cleaning product names, duplicate codes and inconsistent units</li>
  <li>Entering opening stock or importing a large catalogue</li>
  <li>Configuring users, receipt details, payment methods and permissions</li>
  <li>Staff training, refresher sessions and after-hours rollout</li>
  <li>Travel, accommodation or extra site days</li>
  <li>Networking several devices or connecting existing peripherals</li>
</ul>

<h2>Recurring and optional costs</h2>
<p>Ask about annual support, hosted dashboards, cloud backup, remote access, SMS or email services, domain and server charges, payment-provider fees and integration maintenance. A one-time desktop licence does not mean every future service is free. A subscription does not necessarily include hardware or on-site support.</p>

<h2>Rekonet's indicative prices</h2>
${PRICING_TABLE}

<h2>Example small-shop budget</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Item</th><th>Illustrative amount</th></tr></thead>
  <tbody>
    <tr><td>Starter Rekonet software and defined onboarding</td><td>From KES 25,000 one-time</td></tr>
    <tr><td>New Windows computer</td><td>KES 25,000–60,000+</td></tr>
    <tr><td>Printer, scanner, drawer and UPS</td><td>About KES 21,500–57,000+</td></tr>
    <tr><td>Direct integrations or travel</td><td>Quoted only if required</td></tr>
  </tbody>
</table>
</div>
<p>If the business already has a compatible computer and does not need every peripheral, the starting total can be lower. If it needs multiple tills, cleaned legacy data, hosted branch reporting or restaurant workflows, it will be higher.</p>

<h2>How to compare quotations fairly</h2>
<p>Put each vendor into the same sheet: three-year software cost, hardware, setup, data work, training, support, integration, hosting, travel and exit or export. Also compare the exact operational test each vendor will demonstrate.</p>

<h2>Market references reviewed</h2>
<p class="source-note">Ranges above were cross-checked on 31 August 2026 against publicly advertised Kenyan pricing and guides from <a href="https://nexauitech.com/pos/price-kenya" rel="external">Nexaui Tech</a>, <a href="https://modernagepos.com/how-much-does-a-pos-system-cost-in-kenya/" rel="external">Modern Age POS</a>, <a href="https://eliteteqpos.com/ke/blog/pos-system-cost-kenya-2026/" rel="external">EliteTeq POS</a> and <a href="https://websiteskenya.co.ke/blog/pos-system-price-in-kenya" rel="external">Websites Kenya</a>. Their inclusions differ, so the figures are planning guidance rather than endorsements or a price index.</p>`,
  },
  {
    ...articleDefaults,
    slug: "blog/how-to-reconcile-mpesa-and-cash-pos",
    title: "How to Reconcile M-Pesa & Cash at Shift End | Rekonet",
    cardTitle: "How to reconcile M-Pesa and cash",
    description:
      "A practical end-of-shift checklist for expected cash, mobile-money totals, card receipts, declared amounts, variances and manager review.",
    eyebrow: "Shift close checklist",
    h1: "How to reconcile M-Pesa and cash at the end of a POS shift",
    lede:
      "Reconciliation works when the POS total, the physical or provider record and the cashier's declaration are compared as separate figures.",
    category: "Reconciliation",
    readTime: "4",
    keywords: ["M-Pesa reconciliation", "cash reconciliation", "POS shift close", "Kenya retail controls"],
    image: "/images/blog/reconcile-mpesa-cash-pos.jpg",
    imageAlt:
      "Kenyan shop supervisor counting cash beside a phone, calculator and point-of-sale computer at shift close",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>Reconcile M-Pesa and cash</span>',
    related: [
      "blog/benefits-of-pos-system-for-small-business-kenya",
      "blog/stock-take-and-stock-variance-kenya",
      "blog/etims-and-pos-kenya-questions",
    ],
    body: `<h2>Before the shift starts</h2>
<p>Assign an individual cashier account, count and record the opening cash float, confirm the correct M-Pesa till or paybill, and check that every intended payment type exists in the POS. Shared users and an unknown opening float make a clean close almost impossible.</p>

<h2>During the shift</h2>
<ul>
  <li>Complete every sale through the POS at the time it happens.</li>
  <li>Select the actual payment type rather than defaulting everything to cash.</li>
  <li>Record split payments according to the system's supported process.</li>
  <li>Keep approved cash payouts, refunds and voids visible with a reason.</li>
  <li>Do not reuse an M-Pesa message as evidence for another sale.</li>
</ul>

<h2>Step 1: lock or stop the shift</h2>
<p>Choose a clear cut-off time so new sales cannot enter the period while it is being counted. If trading must continue, open the next shift or till under the agreed process.</p>

<h2>Step 2: obtain expected totals</h2>
<p>Run the POS sales summary by payment method. The report should show expected cash, M-Pesa, card and any other configured type. Keep gross sales, refunds and approved payouts visible so the expected figure can be explained.</p>

<h2>Step 3: count actual cash</h2>
<p>Count physical notes and coins, preferably without showing the cashier the expected figure first. Separate the next shift's float if one is being carried forward. Record the declared amount exactly rather than changing a sale to force the difference to zero.</p>

<h2>Step 4: confirm M-Pesa from the authoritative record</h2>
<p>Use the official till, paybill, statement or provider portal for the same cut-off period. Avoid relying solely on screenshots or customer messages. Check reversals, transaction time and whether payments went to another business account.</p>

<h2>Step 5: compare each bucket</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Payment</th><th>Expected source</th><th>Actual source</th><th>Common difference</th></tr></thead>
  <tbody>
    <tr><td>Cash</td><td>POS cash sales + float − recorded payouts</td><td>Physical count</td><td>Change error, unrecorded payout or missed sale</td></tr>
    <tr><td>M-Pesa</td><td>POS mobile-money sales</td><td>Official provider total</td><td>Wrong payment type, reversal, delayed or wrong till</td></tr>
    <tr><td>Card</td><td>POS card sales</td><td>Terminal batch or acquirer record</td><td>Decline, duplicate, timing or wrong classification</td></tr>
  </tbody>
</table>
</div>

<h2>Step 6: investigate, do not erase</h2>
<p>A shortage and an overage both need a reason. Check payment type first: a cash sale wrongly marked M-Pesa can produce equal and opposite differences. Then inspect refunds, voids, payouts, duplicate entries and transaction references. Corrections should use an authorised, visible process.</p>

<h2>Step 7: approve and preserve</h2>
<p>The cashier declares, a manager reviews, and both the difference and action remain part of the record. Repeated small differences by product, time or user are often more informative than a single large month-end total.</p>
<div class="callout"><h3>Direct integration does not remove close-out</h3><p>Automatic transaction confirmation can reduce manual matching, but timeouts, reversals and exceptions still occur. Retain a documented fallback and compare system and provider totals.</p></div>`,
  },
  {
    ...articleDefaults,
    slug: "blog/stock-take-and-stock-variance-kenya",
    title: "Stock Take & Stock Variance Guide for Kenyan Shops | Rekonet",
    cardTitle: "Stock take and variance: a practical guide",
    description:
      "Prepare, count and investigate stock differences without changing figures to fit. Includes cycle counts, cut-off, recount and variance causes.",
    eyebrow: "Inventory control",
    h1: "How to run a stock take and investigate stock variance",
    lede:
      "A stock take compares physical quantity with the system's expected quantity at one defined cut-off. The useful output is an explained difference, not a forced zero.",
    category: "Inventory",
    readTime: "4",
    keywords: ["stock take Kenya", "stock variance", "inventory count", "shop stock control"],
    image: "/images/blog/stock-take-variance-kenya.jpg",
    imageAlt:
      "Two Kenyan retail staff scanning and checking products during a physical stock count in a hardware shop",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>Stock take and variance</span>',
    related: [
      "blog/how-to-reconcile-mpesa-and-cash-pos",
      "blog/benefits-of-pos-system-for-small-business-kenya",
      "blog/pos-hardware-checklist-kenya",
    ],
    body: `<h2>Choose full count or cycle count</h2>
<p>A full count covers the whole location and may require closing or freezing movement. A cycle count checks selected categories on a schedule while the business continues. High-value, fast-moving and high-variance items deserve more frequent cycle counts than low-risk stock.</p>

<h2>Prepare before touching a shelf</h2>
<ul>
  <li>Set the count date, location, cut-off time and person responsible.</li>
  <li>Complete or quarantine outstanding receiving, transfers and returns.</li>
  <li>Separate damaged, expired, customer-held and supplier-return stock.</li>
  <li>Organise shelves so the same item is not counted twice in different places.</li>
  <li>Confirm units: piece, pack, carton, kilogram or another measure.</li>
  <li>Print or prepare count sheets without expected quantity where practical.</li>
</ul>

<h2>Freeze or control movement</h2>
<p>The system quantity and physical quantity must refer to the same moment. If sales continue during counting, document which items were counted before or after each movement. For a smaller shop, counting after close and before the next opening is usually clearer.</p>

<h2>Count in pairs where risk is high</h2>
<p>One person can identify and count while another records. Avoid letting the person responsible for a sensitive category be the only person who counts and approves it. Mark completed shelves and capture notes for mixed packs, open cartons and unclear items.</p>

<h2>Recount exceptions before adjusting</h2>
<p>Start with large value differences, unusual negative stock and items with a history of variance. Check another shelf, back room, returns area and receiving zone. Confirm the unit and product code; many “losses” are actually a carton entered as one piece or two duplicate product records.</p>

<h2>Common variance causes</h2>
<div class="cards">
  <div class="card"><h3>Timing</h3><p>A purchase, sale or transfer happened on the other side of the cut-off.</p></div>
  <div class="card"><h3>Unit error</h3><p>Pack and piece quantities were mixed or converted incorrectly.</p></div>
  <div class="card"><h3>Wrong item</h3><p>A similar product or duplicate code received the transaction.</p></div>
  <div class="card"><h3>Unrecorded event</h3><p>Damage, internal use, return or receiving was not entered.</p></div>
  <div class="card"><h3>Process abuse</h3><p>A sale or stock movement was intentionally bypassed and requires management action.</p></div>
</div>

<h2>Measure quantity and value</h2>
<p>A difference of ten low-value units and one high-value unit should not receive the same priority. Review quantity variance, cost value and selling value separately. Be cautious with stale or missing cost prices because they can distort a value report.</p>

<h2>Post adjustments with reasons</h2>
<p>After recount and approval, use a dated stock adjustment rather than editing opening stock or deleting transactions. Keep the count sheet, reviewer, reason and action. An adjustment aligns the record; it does not explain the cause.</p>

<h2>Turn the result into a control</h2>
<p>Group causes and choose one process change: receiving sign-off, clearer unit labels, limited adjustment rights, daily count of a sensitive category or better shelf organisation. Recount that area soon to see whether the control worked.</p>
<div class="callout"><h3>Useful system demonstration</h3><p>Ask a POS vendor to create an intentional difference, record a recount and post an authorised adjustment. The audit trail is as important as the final quantity.</p></div>`,
  },
  {
    ...articleDefaults,
    slug: "blog/offline-vs-cloud-pos-kenya",
    title: "Offline vs Cloud POS in Kenya: Trade-offs & Questions | Rekonet",
    cardTitle: "Offline vs cloud POS in Kenya",
    description:
      "Compare outage behaviour, remote access, backup, multi-branch use, cost and maintenance before choosing offline, cloud or hybrid POS.",
    eyebrow: "Architecture guide",
    h1: "Offline versus cloud POS in Kenya: what actually changes?",
    lede:
      "The right choice depends less on the label and more on what staff can do during an outage, where the data lives and who is responsible for recovery.",
    category: "Buying guides",
    readTime: "4",
    keywords: ["offline POS Kenya", "cloud POS Kenya", "hybrid POS", "internet outage POS"],
    image: "/images/blog/offline-vs-cloud-pos-kenya.jpg",
    imageAlt:
      "Kenyan retail checkout continuing to use a local point-of-sale computer with shop equipment nearby",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>Offline vs cloud POS</span>',
    related: [
      "blog/how-to-choose-pos-software-retail-kenya",
      "blog/pos-system-cost-kenya-2026",
      "blog/what-is-a-pos-system",
    ],
    body: `<h2>Three common models</h2>
<div class="cards">
  <div class="card"><h3>Local or offline-first</h3><p>The working application and data needed for core selling are on the local computer.</p></div>
  <div class="card"><h3>Cloud-first</h3><p>The primary application and data are hosted remotely and accessed through internet-connected software or a browser.</p></div>
  <div class="card"><h3>Hybrid</h3><p>Local selling continues while selected data or management functions use hosted services.</p></div>
</div>
<p>Products use these words differently. A cloud product may cache offline sales, and an offline product may offer cloud backup. Ask for demonstrated behaviour rather than relying on the category.</p>

<h2>Outage test</h2>
<p>Disconnect the internet during a trial. Complete a sale, print a receipt, look up a product, close a shift and create a backup. Reconnect and watch what happens. Ask how duplicate or conflicting records are handled. Also test a power interruption because offline software still needs power.</p>

<h2>Remote access and multi-branch reporting</h2>
<p>Cloud-first systems usually make remote access easier, provided connectivity and permissions are working. A local system may require exports, remote desktop, a VPN or a separately hosted dashboard. For several branches, confirm how soon data appears centrally and what each branch can do if the central service is unavailable.</p>

<h2>Backup and recovery</h2>
<p>Local does not automatically mean safe, and cloud does not eliminate backup risk. For local data, identify the backup device, location, schedule and restore test. For hosted data, ask about export, retention, account recovery and what happens if the vendor relationship ends.</p>

<h2>Security responsibilities</h2>
<p>A local system needs protected Windows accounts, device security, physical controls and backups. A hosted system adds account security, internet exposure and vendor infrastructure. In both models, individual users, least privilege and prompt removal of former staff matter.</p>

<h2>Cost comparison</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Cost area</th><th>Local/offline-first</th><th>Cloud-first</th></tr></thead>
  <tbody>
    <tr><td>Software</td><td>Often one-time plus optional support</td><td>Often monthly or annual per device, user or branch</td></tr>
    <tr><td>Infrastructure</td><td>Local computer, backup and possibly networking</td><td>Reliable internet plus local devices; hosting is reflected in fees</td></tr>
    <tr><td>Maintenance</td><td>Local updates and device care</td><td>Vendor-hosted updates plus account and connectivity management</td></tr>
    <tr><td>Exit</td><td>Confirm usable data export and licence conditions</td><td>Confirm export before subscription ends</td></tr>
  </tbody>
</table>
</div>

<h2>Practical decision rule</h2>
<p>If uninterrupted local selling is the first priority and internet is inconsistent, offline-first or a proven hybrid mode deserves attention. If live remote access and several locations are the first priority, a hosted model may justify its connectivity and recurring cost. Many businesses need both, but “hybrid” should still have a written failure and recovery plan.</p>
<div class="callout"><h3>Rekonet position</h3><p>Rekonet's standard Windows POS is offline-first for core local operation. Hosted dashboards, cloud backup, direct payment feeds and cross-branch data are not assumed; they are confirmed as separate scope where required.</p></div>`,
  },
  {
    ...articleDefaults,
    slug: "blog/pos-hardware-checklist-kenya",
    title: "POS Hardware Checklist & Prices in Kenya (2026) | Rekonet",
    cardTitle: "POS hardware checklist and 2026 prices",
    description:
      "Plan a Windows POS computer, receipt printer, scanner, drawer, UPS and network with realistic Kenyan price ranges and compatibility checks.",
    eyebrow: "Hardware buying guide",
    h1: "POS hardware checklist for a Kenyan business",
    lede:
      "Buy the hardware around the actual till workflow and supported connections, not around a bundle photograph.",
    category: "Hardware",
    readTime: "4",
    keywords: ["POS hardware Kenya", "thermal printer Kenya", "barcode scanner price", "POS computer"],
    image: "/images/blog/pos-hardware-checklist-kenya.jpg",
    imageAlt:
      "Windows POS computer, receipt printer, scanner, cash drawer, UPS, router and receipt rolls arranged on a counter",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>POS hardware checklist</span>',
    related: [
      "blog/pos-system-cost-kenya-2026",
      "blog/how-to-choose-pos-software-retail-kenya",
      "blog/offline-vs-cloud-pos-kenya",
    ],
    body: `<h2>Core equipment</h2>
${HARDWARE_TABLE}

<h2>1. Windows computer or POS terminal</h2>
<p>Confirm the operating system, memory, free storage, USB ports, display connection and network options required by the software. A business laptop can work, but a fixed counter setup may benefit from a durable desktop, touch terminal or mini PC. Used hardware can lower cost but needs a health and warranty check.</p>

<h2>2. Thermal receipt printer</h2>
<p>Check paper width, Windows driver, USB or Ethernet connection, cutter and cash-drawer port. Network printers can serve flexible layouts but add setup complexity. Keep the exact model in the quotation rather than accepting “compatible printer”.</p>

<h2>3. Barcode scanner</h2>
<p>A basic wired USB scanner is often enough for ordinary retail barcodes. Test the codes actually found on your products, including small, damaged or locally printed labels. Businesses creating their own labels may also need a label printer and a clear barcode-assignment process.</p>

<h2>4. Cash drawer</h2>
<p>Many drawers use a cable from the receipt printer rather than connecting directly to the computer. Confirm voltage and connector compatibility. The drawer opening on sale does not provide cash counting or reconciliation; those remain process and POS functions.</p>

<h2>5. UPS and power protection</h2>
<p>A UPS should provide enough time to complete or safely stop work. Size it for the computer, monitor, printer and any local network equipment that must remain available. A surge protector alone is not backup power. Replace worn batteries and test the shutdown routine.</p>

<h2>6. Router and local network</h2>
<p>A single local till may not need complex networking. Multiple tills, network printers, remote support or hosted functions do. Decide who supplies the router, cabling, addresses and internet account, and who handles faults after installation.</p>

<h2>Optional equipment</h2>
<ul>
  <li>Customer display</li>
  <li>Label printer and labels</li>
  <li>Weighing scale with a supported workflow</li>
  <li>Card terminal supplied by the payment provider</li>
  <li>Kitchen printer or display for a specifically scoped restaurant workflow</li>
  <li>External backup drive stored securely and rotated</li>
</ul>

<h2>Compatibility checklist before payment</h2>
<ul class="checklist">
  <li>Exact model numbers appear on the supplier quote.</li>
  <li>The POS vendor confirms operating system and driver support.</li>
  <li>Connection type and cable length fit the counter.</li>
  <li>Warranty provider and return process are known.</li>
  <li>Receipt paper and consumables are locally available.</li>
  <li>Every device is tested together before go-live.</li>
</ul>

<h2>Avoid the cheapest complete bundle without details</h2>
<p>A bundle may use an unsupported Windows version, low-resolution scanner, printer with unavailable drivers or an undersized UPS. Compare specification, warranty and replacement availability—not only the total price.</p>
<div class="callout"><h3>Rekonet hardware policy</h3><p>Hardware is quoted separately from Rekonet software. The business can propose existing equipment for compatibility testing or request a model-specific supply quote.</p></div>`,
  },
  {
    ...articleDefaults,
    slug: "blog/restaurant-pos-system-kenya",
    title: "Restaurant POS in Kenya: Workflow & Buying Checklist | Rekonet",
    cardTitle: "Restaurant POS: workflow and buying checklist",
    description:
      "Map counter service, tables, kitchen routing, recipes, shifts, M-Pesa and delivery orders before choosing a restaurant POS in Kenya.",
    eyebrow: "Hospitality workflow",
    h1: "What to confirm before buying a restaurant POS in Kenya",
    lede:
      "A restaurant needs more than a retail till when orders move through tables, kitchen stations, modifiers, recipes, delivery and split bills.",
    category: "Hospitality",
    readTime: "4",
    keywords: ["restaurant POS Kenya", "cafe POS", "kitchen order", "hospitality POS"],
    image: "/images/blog/restaurant-pos-kenya.jpg",
    imageAlt:
      "Kenyan cafe server entering an order on a point-of-sale terminal with the kitchen counter behind",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>Restaurant POS</span>',
    related: [
      "blog/how-to-choose-pos-software-retail-kenya",
      "blog/how-to-reconcile-mpesa-and-cash-pos",
      "blog/pos-hardware-checklist-kenya",
    ],
    body: `<h2>Start with service style</h2>
<p>A takeaway counter, quick-service cafe, full table-service restaurant, bar and hotel outlet do not share one workflow. Write down where an order begins, who can change it, where it prints or displays, when payment occurs and how the shift closes.</p>

<h2>Order entry</h2>
<p>Test menu categories, item modifiers, notes, price sizes, combos and unavailable items. If waiters use tablets or handheld devices, check wireless coverage, battery, user identification and what happens when the network is unavailable.</p>

<h2>Tables and bills</h2>
<ul>
  <li>Open, move, merge and split a table or bill</li>
  <li>Transfer responsibility between authorised servers</li>
  <li>Handle deposits, partial payment and several payment methods</li>
  <li>Record voids, complimentary items and manager approval</li>
  <li>Keep a clear history when an order changes after sending</li>
</ul>

<h2>Kitchen or bar routing</h2>
<p>Confirm whether orders print to one or several stations, appear on a kitchen display, or use both. Run a test with food, drinks and a modified item. Then disconnect a printer or network connection and observe the warning and recovery. Missing kitchen tickets are an operational risk, not merely an IT inconvenience.</p>

<h2>Ingredients and recipes</h2>
<p>Some systems reduce finished menu items only; others consume recipe ingredients. Recipe-level inventory requires units, yields, wastage, substitutions and portion discipline. Ask the vendor to demonstrate the exact level rather than assuming “inventory included” means ingredient costing.</p>

<h2>M-Pesa, cash and delivery platforms</h2>
<p>Separate dine-in, takeaway and delivery channels where reporting needs them. Confirm whether M-Pesa is manually recorded or directly integrated. Third-party delivery platforms may settle later and charge commissions, so their orders and payments may need a separate reconciliation process.</p>

<h2>Hardware plan</h2>
<p>The normal computer, receipt printer, drawer, scanner and UPS considerations still apply. A restaurant may also need kitchen printers, splash or heat-resistant placement, a strong local network and backup order pads for a major failure. Put each device and connection in the floor plan.</p>

<h2>Pricing</h2>
<p>Kenyan market guides commonly place restaurant setups above basic retail because of tables, routing and additional hardware. Rekonet's standard retail and counter-service implementation starts from KES 25,000, while restaurant-specific workflow starts from the KES 45,000 operational tier and is quoted after demonstration. Kitchen displays, recipe control, extra terminals and delivery integrations are not assumed.</p>

<h2>Acceptance test before go-live</h2>
<ol class="steps">
  <li>Open and modify an order.</li>
  <li>Send items to the correct preparation station.</li>
  <li>Transfer, split and settle a bill with cash and M-Pesa.</li>
  <li>Process an authorised void and refund.</li>
  <li>Close the shift and compare each payment method.</li>
  <li>Recover from a printer, network or power interruption.</li>
</ol>
<div class="callout"><h3>Scope boundary</h3><p>Rekonet does not present table management, kitchen display or recipe depletion as standard until the current product version and quotation explicitly include and demonstrate them.</p></div>`,
  },
  {
    ...articleDefaults,
    slug: "blog/etims-and-pos-kenya-questions",
    title: "eTIMS & POS in Kenya: Questions to Verify Before Buying | Rekonet",
    cardTitle: "eTIMS and POS: questions to verify",
    description:
      "A neutral checklist for Kenyan businesses to verify eTIMS invoicing method, supported documents, outages, credentials and vendor responsibility.",
    eyebrow: "Compliance questions",
    h1: "eTIMS and POS in Kenya: what should a business verify?",
    lede:
      "Do not treat an “eTIMS-ready” label as proof. Ask which current KRA-supported method is used, what documents are handled and what happens when the service is unavailable.",
    category: "Compliance",
    readTime: "4",
    keywords: ["eTIMS POS Kenya", "KRA invoice POS", "eTIMS integration questions", "tax invoice software"],
    image: "/images/blog/etims-pos-questions-kenya.jpg",
    imageAlt:
      "Kenyan business manager reviewing a generic invoice beside a point-of-sale computer and calculator",
    crumbs: '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Guides</a> <span aria-hidden="true">›</span> <span>eTIMS and POS</span>',
    related: [
      "blog/how-to-choose-pos-software-retail-kenya",
      "blog/how-to-reconcile-mpesa-and-cash-pos",
      "blog/pos-system-cost-kenya-2026",
    ],
    body: `<div class="callout"><h2>First: this is not tax advice or a certification claim</h2><p>Requirements and supported technical methods can change. Confirm the current obligation and approved options with the Kenya Revenue Authority or a qualified tax adviser. Rekonet's standard POS should not be assumed to have direct eTIMS integration unless a written scope names and demonstrates it.</p></div>

<h2>1. Which invoicing method is being used?</h2>
<p>Ask the vendor to identify the current KRA-supported approach, application, device or system-to-system connection involved. Vague phrases such as “compliant” or “ready” do not explain whether your POS submits data itself, works alongside another tool or only exports information for later entry.</p>

<h2>2. Which documents are supported?</h2>
<ul>
  <li>Normal sales invoice or receipt</li>
  <li>Credit note, return or cancellation</li>
  <li>Different tax rates or exempt items relevant to the business</li>
  <li>Business-to-business customer details where required</li>
  <li>Deposits, partial payments or other business-specific cases</li>
</ul>
<p>Use real examples reviewed by the person responsible for tax records.</p>

<h2>3. What is the relationship between the POS sale and tax invoice?</h2>
<p>Determine whether one action creates both records, whether staff must complete a second step, and which reference links them. If one side fails, the system should make the exception visible instead of silently leaving mismatched totals.</p>

<h2>4. What happens during an outage?</h2>
<p>Ask about internet loss, KRA service unavailability, power loss and delayed submission. Which sales can continue? What queue or pending state appears? Who retries, and how are duplicates prevented? Obtain current official guidance for the applicable method rather than inventing an offline process.</p>

<h2>5. Who controls credentials and devices?</h2>
<p>The business should know which account, certificate, device or credential authorises submission, who can access it and how access is removed when staff or vendors change. Avoid sharing tax-system credentials through informal messages.</p>

<h2>6. How are returns and corrections handled?</h2>
<p>A POS void, stock return and tax credit note may be related but are not necessarily the same operation. Demonstrate the complete correction and confirm approval rights, references and reporting.</p>

<h2>7. How will totals be reconciled?</h2>
<p>Compare POS sales, submitted tax documents and accounting records for the same period. Investigate timing, rejected documents, duplicates and manual invoices. Integration reduces copying but does not remove review.</p>

<h2>8. What exactly is the vendor responsible for?</h2>
<p>The proposal should identify configuration, integration development, testing, training, hosting, monitoring and support. It should also state what the business, KRA, tax adviser or another provider controls. Regulatory changes and third-party availability cannot be hidden behind an absolute guarantee.</p>

<h2>Rekonet scope</h2>
<p>Rekonet can discuss the sales and data workflow, but direct eTIMS connectivity is optional custom work only where the current product, technical method and written quotation support it. Ask for a live test using the business's approved setup before relying on it.</p>
<p class="source-note">For current requirements, start with the official <a href="https://www.kra.go.ke/helping-tax-payers/faqs/learn-about-etims" rel="external">Kenya Revenue Authority eTIMS information</a>. Official guidance takes precedence over this article.</p>`,
  },
];

module.exports = {
  CONTACT,
  LAST_UPDATED,
  PAGES,
  POSTS,
};
