// Unit tests for the invoicing tool's business logic (src/js/invoicing.js).
// Runs with the built-in Node test runner: `npm test` / `node --test tests/`.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

const api = require(path.join(__dirname, "..", "src", "js", "invoicing.js"));
const { money, computeTotals, deriveStatus, deriveQuoteStatus, amountInWords, createStore, memoryStorage } = api;

const FIXED_NOW = () => new Date(2026, 8, 7, 10, 30); // 7 Sept 2026

function newStore() {
  return createStore(memoryStorage(), { now: FIXED_NOW });
}

function sampleInvoice(overrides) {
  return Object.assign(
    {
      client: { name: "Kamau Hardware Ltd", phone: "0712 345 678" },
      issueDate: "2026-09-01",
      dueDate: "2026-09-15",
      currency: "KES",
      items: [
        { description: "POS software licence", qty: 1, unitPrice: 2500000 },
        { description: "Thermal printer", qty: 2, unitPrice: 850050 },
      ],
      discount: { type: "none", value: 0 },
      taxMode: "exclusive",
      taxRate: 16,
    },
    overrides || {}
  );
}

test("money.toCents parses typed amounts and formats them back", () => {
  assert.equal(money.toCents("25,000"), 2500000);
  assert.equal(money.toCents("KES 1,234.5"), 123450);
  assert.equal(money.toCents(" 99.999 "), 10000);
  assert.equal(money.toCents(12.34), 1234);
  assert.ok(Number.isNaN(money.toCents("abc")));
  assert.ok(Number.isNaN(money.toCents("")));
  assert.ok(Number.isNaN(money.toCents("1.2.3")));
  assert.equal(money.format(4384904, "KES"), "KES 43,849.04");
  assert.equal(money.format(-500), "-5.00");
  assert.equal(money.plain(100050), "1000.50");
});

test("computeTotals: subtotal, percentage discount and VAT added on top", () => {
  const t = computeTotals(sampleInvoice({ discount: { type: "percent", value: 10 } }));
  assert.equal(t.subtotal, 4200100);
  assert.equal(t.discount, 420010);
  assert.equal(t.tax, 604814); // 16% of 37,800.90 = 6,048.144 -> rounded to cents
  assert.equal(t.total, 4384904);
  assert.equal(t.balance, 4384904);
});

test("computeTotals: fixed discount is capped at the subtotal", () => {
  const t = computeTotals(sampleInvoice({ discount: { type: "fixed", value: 99999999 }, taxMode: "none" }));
  assert.equal(t.discount, 4200100);
  assert.equal(t.total, 0);
});

test("computeTotals: tax-inclusive prices back out the VAT without changing the total", () => {
  const t = computeTotals(sampleInvoice({ items: [{ description: "x", qty: 1, unitPrice: 116000 }], taxMode: "inclusive" }));
  assert.equal(t.total, 116000);
  assert.equal(t.tax, 16000);
  assert.equal(t.net, 100000);
});

test("computeTotals: taxMode none ignores the rate", () => {
  const t = computeTotals(sampleInvoice({ taxMode: "none", taxRate: 16 }));
  assert.equal(t.tax, 0);
  assert.equal(t.total, 4200100);
});

test("deriveStatus follows payments, due date and void flag", () => {
  const inv = sampleInvoice({ payments: [] });
  assert.equal(deriveStatus(inv, "2026-09-07"), "unpaid");
  assert.equal(deriveStatus(inv, "2026-09-16"), "overdue");
  assert.equal(deriveStatus(sampleInvoice({ payments: [{ amount: 100 }] }), "2026-09-07"), "partial");
  assert.equal(deriveStatus(sampleInvoice({ payments: [{ amount: 100 }] }), "2026-10-01"), "overdue");
  assert.equal(deriveStatus(sampleInvoice({ payments: [{ amount: 4872116 }] }), "2026-10-01"), "paid");
  assert.equal(deriveStatus(sampleInvoice({ status: "void", payments: [] }), "2026-10-01"), "void");
});

test("amountInWords spells out shillings and cents", () => {
  assert.equal(amountInWords(2000000, "KES"), "Kenya Shillings Twenty Thousand Only");
  assert.equal(amountInWords(4384904, "KES"), "Kenya Shillings Forty-Three Thousand Eight Hundred Forty-Nine and Four Cents Only");
  assert.equal(amountInWords(100000000000, "USD"), "US Dollars One Billion Only");
  assert.equal(amountInWords(0, "KES"), "Kenya Shillings Zero Only");
  assert.equal(api.integerToWords(1000010), "One Million Ten");
});

test("toWhatsAppNumber normalises Kenyan numbers", () => {
  assert.equal(api.toWhatsAppNumber("0712 345 678"), "254712345678");
  assert.equal(api.toWhatsAppNumber("+254 712 345 678"), "254712345678");
  assert.equal(api.toWhatsAppNumber("712345678"), "254712345678");
  assert.equal(api.toWhatsAppNumber("00254712345678"), "254712345678");
  assert.equal(api.toWhatsAppNumber(""), "");
});

test("parseRoute maps hashes to views", () => {
  assert.deepEqual(api.parseRoute(""), { name: "invoices", query: {} });
  assert.deepEqual(api.parseRoute("#/invoices/new?client=abc"), { name: "invoice-new", query: { client: "abc" } });
  assert.equal(api.parseRoute("#/invoices/123").name, "invoice-view");
  assert.equal(api.parseRoute("#/invoices/123/edit").name, "invoice-edit");
  assert.equal(api.parseRoute("#/invoices/123/duplicate").name, "invoice-duplicate");
  assert.equal(api.parseRoute("#/receipts/xyz").id, "xyz");
  assert.equal(api.parseRoute("#/settings").name, "settings");
  assert.equal(api.parseRoute("#/nope").name, "not-found");
});

test("store assigns sequential invoice numbers using the configured prefix", () => {
  const store = newStore();
  store.saveSettings({ invoicePrefix: "MNT-", nextInvoiceNumber: 101, numberPadding: 4 });
  const a = store.saveInvoice(sampleInvoice());
  const b = store.saveInvoice(sampleInvoice());
  assert.equal(a.number, "MNT-0101");
  assert.equal(b.number, "MNT-0102");
  assert.equal(store.getSettings().nextInvoiceNumber, 103);
});

test("store rejects settings that would reuse an existing invoice or receipt number", () => {
  const store = newStore();
  const inv = store.saveInvoice(sampleInvoice());
  store.recordPayment(inv.id, { amount: 100, date: "2026-09-07", method: "Cash" });
  assert.throws(() => store.saveSettings({ nextInvoiceNumber: 1 }), /INV-0001 already exists/);
  assert.throws(() => store.saveSettings({ nextReceiptNumber: 1 }), /RCT-0001 already exists/);
  assert.ok(store.saveSettings({ nextInvoiceNumber: 50 }));
});

test("store saves the client from the invoice and reuses it by name", () => {
  const store = newStore();
  store.saveInvoice(sampleInvoice());
  store.saveInvoice(sampleInvoice({ client: { name: "kamau hardware ltd", email: "acc@kamau.co.ke" } }));
  const clients = store.listClients();
  assert.equal(clients.length, 1);
  assert.equal(clients[0].phone, "0712 345 678");
  assert.equal(clients[0].email, "acc@kamau.co.ke");
});

test("payments create numbered receipts, track balance and cannot exceed it", () => {
  const store = newStore();
  const inv = store.saveInvoice(sampleInvoice({ discount: { type: "percent", value: 10 } }));
  assert.throws(() => store.recordPayment(inv.id, { amount: 0 }), /greater than zero/);
  assert.throws(() => store.recordPayment(inv.id, { amount: 5000000 }), /exceeds the outstanding balance/);

  const p1 = store.recordPayment(inv.id, { amount: 2000000, date: "2026-09-03", method: "M-Pesa", reference: "RJK7HD2Q1P" });
  assert.equal(p1.receiptNumber, "RCT-0001");
  let r = store.getReceipt(p1.id);
  assert.equal(r.paidBefore, 0);
  assert.equal(r.balanceAfter, 2384904);
  assert.equal(deriveStatus(store.getInvoice(inv.id), "2026-09-07"), "partial");

  const p2 = store.recordPayment(inv.id, { amount: 2384904, date: "2026-09-05", method: "Cash" });
  assert.equal(p2.receiptNumber, "RCT-0002");
  r = store.getReceipt(p2.id);
  assert.equal(r.paidBefore, 2000000);
  assert.equal(r.balanceAfter, 0);
  assert.equal(deriveStatus(store.getInvoice(inv.id), "2026-09-07"), "paid");
  assert.equal(store.listReceipts().length, 2);
  assert.equal(store.listReceipts()[0].payment.receiptNumber, "RCT-0002", "newest receipt first");
});

test("invoices with payments are locked from editing until the payments are removed", () => {
  const store = newStore();
  const inv = store.saveInvoice(sampleInvoice());
  const p = store.recordPayment(inv.id, { amount: 100, date: "2026-09-07", method: "Cash" });
  assert.throws(() => store.saveInvoice(Object.assign({}, inv, { reference: "PO-1" })), /can no longer be edited/);
  store.deletePayment(inv.id, p.id);
  const edited = store.saveInvoice(Object.assign({}, store.getInvoice(inv.id), { reference: "PO-1" }));
  assert.equal(edited.reference, "PO-1");
  assert.equal(edited.number, inv.number, "editing keeps the same number");
});

test("void invoices cannot take payments and are excluded from stats", () => {
  const store = newStore();
  const inv = store.saveInvoice(sampleInvoice());
  store.setInvoiceStatus(inv.id, "void");
  assert.throws(() => store.recordPayment(inv.id, { amount: 100 }), /void/);
  const stats = api.computeStats(store.listInvoices(), "2026-09-07");
  assert.equal(stats.outstanding, 0);
  assert.equal(stats.invoicedMonthCount, 0);
  store.setInvoiceStatus(inv.id, "open");
  assert.equal(api.computeStats(store.listInvoices(), "2026-09-07").outstandingCount, 1);
});

test("computeStats sums outstanding, overdue and this month's activity", () => {
  const store = newStore();
  const a = store.saveInvoice(sampleInvoice({ taxMode: "none", items: [{ description: "a", qty: 1, unitPrice: 100000 }] }));
  store.saveInvoice(sampleInvoice({ taxMode: "none", issueDate: "2026-08-01", dueDate: "2026-08-15", items: [{ description: "b", qty: 1, unitPrice: 50000 }] }));
  store.recordPayment(a.id, { amount: 25000, date: "2026-09-02", method: "Cash" });
  const stats = api.computeStats(store.listInvoices(), "2026-09-07");
  assert.equal(stats.outstanding, 125000);
  assert.equal(stats.outstandingCount, 2);
  assert.equal(stats.overdue, 50000);
  assert.equal(stats.overdueCount, 1);
  assert.equal(stats.receivedMonth, 25000);
  assert.equal(stats.invoicedMonth, 100000);
});

test("backup export/import round-trips and rejects foreign files", () => {
  const store = newStore();
  store.saveSettings({ business: { name: "Mama Njeri Traders" } });
  const inv = store.saveInvoice(sampleInvoice());
  store.recordPayment(inv.id, { amount: 100, date: "2026-09-07", method: "Cash" });
  const json = store.exportJson();
  assert.ok(store.getSettings().lastBackupAt, "records the backup time");

  const fresh = newStore();
  const summary = fresh.importJson(json);
  assert.deepEqual(summary, { invoices: 1, quotes: 0, clients: 1, receipts: 1 });
  assert.equal(fresh.getSettings().business.name, "Mama Njeri Traders");
  assert.equal(fresh.getInvoice(inv.id).payments.length, 1);

  assert.throws(() => fresh.importJson("not json"), /not valid JSON/);
  assert.throws(() => fresh.importJson('{"hello":"world"}'), /does not look like/);
  assert.throws(() => fresh.importJson(JSON.stringify({ version: 99, settings: {}, invoices: [] })), /newer version/);
});

test("CSV export has a header row and one line per invoice", () => {
  const store = newStore();
  store.saveInvoice(sampleInvoice({ client: { name: 'Acme "Quotes", Ltd' }, taxMode: "none" }));
  const lines = store.toCsv().split("\r\n");
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^Invoice,Status,Issue date/);
  assert.match(lines[1], /^INV-0001,Unpaid,2026-09-01,2026-09-15,"Acme ""Quotes"", Ltd",KES,42001\.00/);
});

test("store starts fresh on corrupt storage and keeps a copy of the unreadable data", () => {
  const written = {};
  const storage = {
    getItem: (key) => (key in written ? written[key] : null),
    setItem: (key, value) => { written[key] = String(value); },
    removeItem: (key) => { delete written[key]; },
  };
  storage.setItem(api.STORAGE_KEY, "{corrupt");
  const store = createStore(storage, { now: FIXED_NOW });
  assert.equal(store.listInvoices().length, 0);
  assert.equal(store.getState().version, api.VERSION);
  const backupKey = Object.keys(written).find((k) => k.startsWith(api.STORAGE_KEY + ".unreadable-"));
  assert.ok(backupKey, "unreadable payload is preserved under a side key");
  assert.equal(written[backupKey], "{corrupt");
});

test("store normalises legacy or hand-edited records", () => {
  const storage = memoryStorage();
  storage.setItem(
    api.STORAGE_KEY,
    JSON.stringify({
      version: 1,
      settings: { currency: "kes", taxRate: "16", numberPadding: 99, taxMode: "weird" },
      clients: [{ name: "  Spaced  " }],
      invoices: [{ id: "x", number: "INV-0007", client: { name: "X" }, items: [{ description: "a", qty: "2", unitPrice: "150.7" }], payments: [{ amount: "10" }], discount: { type: "bogus" } }],
    })
  );
  const store = createStore(storage, { now: FIXED_NOW });
  const s = store.getSettings();
  assert.equal(s.currency, "KES");
  assert.equal(s.taxRate, 16);
  assert.equal(s.numberPadding, 8);
  assert.equal(s.taxMode, "exclusive");
  assert.equal(store.listClients()[0].name, "Spaced");
  const inv = store.getInvoice("x");
  assert.equal(inv.items[0].qty, 2);
  assert.equal(inv.items[0].unitPrice, 151);
  assert.equal(inv.discount.type, "none");
  assert.ok(inv.payments[0].id, "payments get ids");
  assert.equal(inv.payments[0].amount, 10);
});

test("share text summarises invoice and receipt for WhatsApp/email", () => {
  const store = newStore();
  const inv = store.saveInvoice(sampleInvoice({ taxMode: "none", discount: { type: "none" } }));
  const settings = store.getSettings();
  const text = api.invoiceShareText(inv, settings, computeTotals(inv), "unpaid");
  assert.match(text, /invoice INV-0001 from Rekonet Inv Systems/);
  assert.match(text, /Total: KES 42,001\.00/);
  assert.match(text, /Balance due: KES 42,001\.00/);
  const p = store.recordPayment(inv.id, { amount: 100000, date: "2026-09-07", method: "M-Pesa", reference: "ABC" });
  const rText = api.receiptShareText(store.getReceipt(p.id), settings);
  assert.match(rText, /payment of KES 1,000\.00 \(M-Pesa, ref ABC\)/);
  assert.match(rText, /Receipt: RCT-0001 · Invoice: INV-0001/);
  assert.match(rText, /Balance due: KES 41,001\.00/);
});

/* ---- quotations ---- */

function sampleQuote(overrides) {
  const q = sampleInvoice(overrides);
  delete q.dueDate;
  q.validUntil = (overrides && overrides.validUntil) || "2026-10-01";
  return q;
}

test("quotations get their own number sequence and never consume invoice numbers", () => {
  const store = newStore();
  const q1 = store.saveQuote(sampleQuote());
  const q2 = store.saveQuote(sampleQuote({ client: { name: "Wanjiru Pharmacy" } }));
  assert.equal(q1.number, "QUO-0001");
  assert.equal(q2.number, "QUO-0002");
  assert.equal(q1.status, "open");
  assert.equal(q1.validUntil, "2026-10-01");
  assert.equal(q1.payments, undefined, "quotations carry no payments");
  const inv = store.saveInvoice(sampleInvoice());
  assert.equal(inv.number, "INV-0001", "invoice numbering is unaffected by quotations");
  assert.equal(store.getSettings().nextQuoteNumber, 3);
  assert.equal(store.listClients().length, 2, "quotation clients are saved like invoice clients");
  assert.throws(() => store.saveSettings({ nextQuoteNumber: 1 }), /QUO-0001 already exists/);
});

test("quotation status is derived: open, expired after validity date, accepted/declined by hand", () => {
  const store = newStore(); // today = 2026-09-07
  const q = store.saveQuote(sampleQuote({ validUntil: "2026-09-20" }));
  assert.equal(deriveQuoteStatus(q, "2026-09-07"), "open");
  assert.equal(deriveQuoteStatus(q, "2026-09-21"), "expired");
  store.setQuoteStatus(q.id, "accepted");
  const accepted = store.getQuote(q.id);
  assert.equal(deriveQuoteStatus(accepted, "2026-12-01"), "accepted", "an accepted quote does not expire");
  assert.ok(accepted.acceptedAt);
  store.setQuoteStatus(q.id, "declined");
  assert.equal(deriveQuoteStatus(store.getQuote(q.id), "2026-09-07"), "declined");
  store.setQuoteStatus(q.id, "open");
  assert.equal(store.getQuote(q.id).acceptedAt, "");
  assert.equal(deriveQuoteStatus(store.getQuote(q.id), "2026-09-07"), "open");
});

test("converting a quotation creates a linked invoice with the same items and locks the quotation", () => {
  const store = newStore();
  store.saveSettings({ dueDays: 7, paymentInstructions: "Paybill 400200" });
  const q = store.saveQuote(sampleQuote({ discount: { type: "percent", value: 10 }, reference: "PO-77" }));
  const quoteTotal = computeTotals(q).total;

  const inv = store.convertQuoteToInvoice(q.id);
  assert.equal(inv.number, "INV-0001");
  assert.equal(inv.issueDate, "2026-09-07", "invoice is dated today");
  assert.equal(inv.dueDate, "2026-09-14", "due date uses the default payment terms");
  assert.equal(inv.reference, "PO-77");
  assert.equal(inv.quoteNumber, "QUO-0001", "invoice remembers which quotation it came from");
  assert.equal(inv.paymentInstructions, "Paybill 400200", "payment details fall back to settings");
  assert.deepEqual(inv.items, q.items);
  assert.deepEqual(inv.discount, q.discount);
  assert.equal(computeTotals(inv).total, quoteTotal, "invoice total matches the quotation");
  assert.equal(inv.quoteId, q.id);
  assert.equal(deriveStatus(inv, "2026-09-07"), "unpaid");

  const after = store.getQuote(q.id);
  assert.equal(after.invoiceId, inv.id);
  assert.equal(after.status, "accepted", "converting an open quote marks it accepted");
  assert.equal(deriveQuoteStatus(after, "2026-09-07"), "invoiced");
  assert.throws(() => store.convertQuoteToInvoice(q.id), /already been converted/);
  assert.throws(() => store.saveQuote(Object.assign({}, after, { reference: "changed" })), /already been invoiced/);
  assert.throws(() => store.setQuoteStatus(q.id, "declined"), /follows the invoice/);

  // Deleting the invoice releases the quotation so it can be invoiced again.
  store.deleteInvoice(inv.id);
  const released = store.getQuote(q.id);
  assert.equal(released.invoiceId, "");
  assert.equal(deriveQuoteStatus(released, "2026-09-07"), "accepted");
  const again = store.convertQuoteToInvoice(q.id);
  assert.equal(again.number, "INV-0002");
});

test("declined quotations cannot be converted, and quotation edits keep the number", () => {
  const store = newStore();
  const q = store.saveQuote(sampleQuote());
  store.setQuoteStatus(q.id, "declined");
  assert.throws(() => store.convertQuoteToInvoice(q.id), /declined quotation cannot be invoiced/);
  const edited = store.saveQuote(Object.assign({}, store.getQuote(q.id), { validUntil: "2026-12-31", reference: "R2" }));
  assert.equal(edited.number, "QUO-0001");
  assert.equal(edited.status, "declined", "editing does not change the status");
  assert.equal(edited.validUntil, "2026-12-31");
  store.deleteQuote(q.id);
  assert.equal(store.getQuote(q.id), null);
  assert.equal(store.listQuotes().length, 0);
});

test("quotations survive backup round-trips and export to CSV", () => {
  const store = newStore();
  const q = store.saveQuote(sampleQuote({ client: { name: 'Acme "Quotes", Ltd' } }));
  store.convertQuoteToInvoice(q.id);
  store.saveQuote(sampleQuote({ client: { name: "Open Client" } }));
  const fresh = newStore();
  const summary = fresh.importJson(store.exportJson());
  assert.deepEqual(summary, { invoices: 1, quotes: 2, clients: 2, receipts: 0 });
  assert.equal(fresh.getQuote(q.id).invoiceId, store.getQuote(q.id).invoiceId, "quote/invoice link is preserved");

  const lines = fresh.quotesToCsv().split("\r\n");
  assert.equal(lines.length, 3);
  assert.ok(lines[0].startsWith("Quotation,Status,Issue date,Valid until,Client"));
  const invoicedRow = lines.find((l) => l.startsWith("QUO-0001"));
  assert.ok(/,Invoiced,/.test(invoicedRow), invoicedRow);
  assert.ok(/"Acme ""Quotes"", Ltd"/.test(invoicedRow), "quotes escaped");
  assert.ok(/,INV-0001$/.test(invoicedRow), "invoice number in the last column");
  const openRow = lines.find((l) => l.startsWith("QUO-0002"));
  assert.ok(/,Open,/.test(openRow) && /,$/.test(openRow), openRow);
});

test("routes for quotations parse like invoice routes", () => {
  const { parseRoute } = api;
  assert.equal(parseRoute("#/quotes").name, "quotes");
  assert.equal(parseRoute("#/quotes/new").name, "quote-new");
  assert.deepEqual(parseRoute("#/quotes/abc"), { name: "quote-view", id: "abc", query: {} });
  assert.equal(parseRoute("#/quotes/abc/edit").name, "quote-edit");
  assert.equal(parseRoute("#/quotes/abc/duplicate").name, "quote-duplicate");
  assert.deepEqual(parseRoute("#/quotes/new?client=c1").query, { client: "c1" });
});
