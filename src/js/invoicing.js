/* Rekonet Invoicing & Receipts
 *
 * A dependency-free invoicing tool served as a static page at /invoicing/.
 * Create invoices, record payments and issue receipts, then print or
 * "Save as PDF" straight from the browser.
 *
 * There is no backend: data lives in this browser's localStorage (key:
 * rekonet.invoicing.v1) and can be exported / restored as a JSON backup from
 * Settings.
 *
 * The file is a plain script (no build step). The pure business logic (money
 * maths, totals, statuses, numbering, amount-in-words, storage) is exposed on
 * window.RekonetInvoicing in the browser and via module.exports in Node so it
 * can be unit tested with `npm test`.
 */
(function (root, factory) {
  "use strict";
  var api = factory(root);
  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.RekonetInvoicing = api;
    if (root.document && root.document.getElementById("invoicing-app")) {
      api.boot(root.document);
    }
  }
})(typeof window !== "undefined" ? window : null, function (root) {
  "use strict";

  var VERSION = 1;
  var STORAGE_KEY = "rekonet.invoicing.v1";
  var PAYMENT_METHODS = ["M-Pesa", "Cash", "Bank transfer", "Card", "Cheque", "Other"];
  var CURRENCIES = ["KES", "USD", "EUR", "GBP", "UGX", "TZS", "RWF", "ZAR"];
  var STATUS_LABELS = {
    unpaid: "Unpaid",
    partial: "Partially paid",
    overdue: "Overdue",
    paid: "Paid",
    void: "Void",
  };

  var DEFAULT_SETTINGS = {
    business: {
      name: "Rekonet Inv Systems",
      tagline: "POS, inventory and business software",
      address: "Nairobi, Kenya",
      phone: "+254 745 522 104",
      email: "rekonetsystems@outlook.com",
      website: "rekonetsystems.netlify.app",
      kraPin: "",
      logo: "",
    },
    currency: "KES",
    taxLabel: "VAT",
    taxRate: 16,
    taxMode: "exclusive",
    invoicePrefix: "INV-",
    nextInvoiceNumber: 1,
    receiptPrefix: "RCT-",
    nextReceiptNumber: 1,
    numberPadding: 4,
    dueDays: 14,
    paymentInstructions:
      "Pay by M-Pesa or bank transfer and quote the invoice number as the payment reference.",
    defaultNotes: "Thank you for your business.",
    defaultTerms: "Payment is due within 14 days of the invoice date.",
    lastBackupAt: "",
  };

  /* ------------------------------------------------------------------ */
  /* Small utilities                                                     */
  /* ------------------------------------------------------------------ */

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toIso(date) {
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
  }

  function parseIso(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!m) return null;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function addDays(iso, days) {
    var d = parseIso(iso) || new Date();
    d.setDate(d.getDate() + (Number(days) || 0));
    return toIso(d);
  }

  function daysBetween(fromIso, toIsoValue) {
    var a = parseIso(fromIso);
    var b = parseIso(toIsoValue);
    if (!a || !b) return 0;
    return Math.round((b - a) / 86400000);
  }

  function formatDate(iso, style) {
    var d = parseIso(iso);
    if (!d) return iso || "";
    var opts =
      style === "long"
        ? { day: "numeric", month: "long", year: "numeric" }
        : { day: "numeric", month: "short", year: "numeric" };
    return d.toLocaleDateString("en-GB", opts);
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uid() {
    var c = root && root.crypto;
    if (c && typeof c.randomUUID === "function") return c.randomUUID();
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function clamp(n, lo, hi) {
    return Math.min(Math.max(n, lo), hi);
  }

  function formatQty(qty) {
    var n = Number(qty) || 0;
    return Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000);
  }

  function closest(el, selector) {
    return el && typeof el.closest === "function" ? el.closest(selector) : null;
  }

  /* ------------------------------------------------------------------ */
  /* Money — all amounts are stored as integer cents                     */
  /* ------------------------------------------------------------------ */

  var money = {
    toCents: function (value) {
      if (typeof value === "number") {
        return Number.isFinite(value) ? Math.round(value * 100) : NaN;
      }
      var s = String(value == null ? "" : value)
        .trim()
        .replace(/^[A-Za-z]{2,4}\s*/, "")
        .replace(/[,\s_]/g, "");
      if (s === "" || s === "-" || s === ".") return NaN;
      if (!/^-?\d*(\.\d+)?$/.test(s)) return NaN;
      var n = Number(s);
      return Number.isFinite(n) ? Math.round(n * 100) : NaN;
    },
    format: function (cents, currency) {
      var n = (Number(cents) || 0) / 100;
      var abs = Math.abs(n).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return (n < 0 ? "-" : "") + (currency ? currency + " " : "") + abs;
    },
    plain: function (cents) {
      return ((Number(cents) || 0) / 100).toFixed(2);
    },
  };

  /* ------------------------------------------------------------------ */
  /* Invoice maths                                                       */
  /* ------------------------------------------------------------------ */

  function lineTotal(item) {
    return Math.round((Number(item.qty) || 0) * (Number(item.unitPrice) || 0));
  }

  function discountAmount(discount, subtotal) {
    if (!discount || discount.type === "none") return 0;
    var value = Number(discount.value) || 0;
    if (discount.type === "percent") return Math.round((subtotal * clamp(value, 0, 100)) / 100);
    if (discount.type === "fixed") return Math.round(clamp(value, 0, subtotal));
    return 0;
  }

  function computeTotals(inv) {
    var items = inv.items || [];
    var subtotal = 0;
    items.forEach(function (item) {
      subtotal += lineTotal(item);
    });
    var discount = discountAmount(inv.discount, subtotal);
    var afterDiscount = subtotal - discount;
    var rate = Number(inv.taxRate) || 0;
    var mode = inv.taxMode || "exclusive";
    var tax = 0;
    var net = afterDiscount;
    var total = afterDiscount;
    if (mode === "exclusive" && rate > 0) {
      tax = Math.round((afterDiscount * rate) / 100);
      total = afterDiscount + tax;
    } else if (mode === "inclusive" && rate > 0) {
      tax = Math.round(afterDiscount - afterDiscount / (1 + rate / 100));
      net = afterDiscount - tax;
      total = afterDiscount;
    }
    var paid = (inv.payments || []).reduce(function (sum, p) {
      return sum + (Number(p.amount) || 0);
    }, 0);
    return {
      subtotal: subtotal,
      discount: discount,
      afterDiscount: afterDiscount,
      net: net,
      tax: tax,
      total: total,
      paid: paid,
      balance: total - paid,
      rate: rate,
      mode: mode,
    };
  }

  function deriveStatus(inv, todayIso) {
    if (inv.status === "void") return "void";
    var t = computeTotals(inv);
    if (t.total > 0 && t.balance <= 0) return "paid";
    if (t.total <= 0) return t.paid > 0 ? "paid" : "unpaid";
    if (inv.dueDate && todayIso && inv.dueDate < todayIso) return "overdue";
    if (t.paid > 0) return "partial";
    return "unpaid";
  }

  function statusLabel(status) {
    return STATUS_LABELS[status] || status;
  }

  function formatNumber(prefix, n, padding) {
    return (prefix || "") + String(Math.max(0, parseInt(n, 10) || 0)).padStart(padding || 4, "0");
  }

  function computeStats(invoices, todayIso) {
    var month = String(todayIso || "").slice(0, 7);
    var stats = {
      outstanding: 0,
      outstandingCount: 0,
      overdue: 0,
      overdueCount: 0,
      receivedMonth: 0,
      receivedMonthCount: 0,
      invoicedMonth: 0,
      invoicedMonthCount: 0,
    };
    invoices.forEach(function (inv) {
      if (inv.status === "void") return;
      var t = computeTotals(inv);
      var st = deriveStatus(inv, todayIso);
      if (t.balance > 0) {
        stats.outstanding += t.balance;
        stats.outstandingCount += 1;
      }
      if (st === "overdue") {
        stats.overdue += t.balance;
        stats.overdueCount += 1;
      }
      if (String(inv.issueDate || "").slice(0, 7) === month) {
        stats.invoicedMonth += t.total;
        stats.invoicedMonthCount += 1;
      }
      (inv.payments || []).forEach(function (p) {
        if (String(p.date || "").slice(0, 7) === month) {
          stats.receivedMonth += Number(p.amount) || 0;
          stats.receivedMonthCount += 1;
        }
      });
    });
    return stats;
  }

  /* ------------------------------------------------------------------ */
  /* Amount in words (used on receipts)                                  */
  /* ------------------------------------------------------------------ */

  var ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen",
  ];
  var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  var SCALES = ["", "Thousand", "Million", "Billion", "Trillion"];
  var CURRENCY_NAMES = {
    KES: ["Kenya Shillings", "Cents"],
    USD: ["US Dollars", "Cents"],
    EUR: ["Euros", "Cents"],
    GBP: ["Pounds Sterling", "Pence"],
    UGX: ["Uganda Shillings", "Cents"],
    TZS: ["Tanzania Shillings", "Cents"],
    RWF: ["Rwandan Francs", "Centimes"],
    ZAR: ["South African Rand", "Cents"],
  };

  function threeDigitsToWords(n) {
    var parts = [];
    var hundreds = Math.floor(n / 100);
    var rest = n % 100;
    if (hundreds) parts.push(ONES[hundreds] + " Hundred");
    if (rest < 20) {
      if (rest) parts.push(ONES[rest]);
    } else {
      var tens = TENS[Math.floor(rest / 10)];
      var ones = ONES[rest % 10];
      parts.push(ones ? tens + "-" + ones : tens);
    }
    return parts.join(" ");
  }

  function integerToWords(n) {
    n = Math.floor(Math.abs(Number(n) || 0));
    if (n === 0) return "Zero";
    var parts = [];
    var scale = 0;
    while (n > 0 && scale < SCALES.length) {
      var chunk = n % 1000;
      if (chunk) {
        parts.unshift(threeDigitsToWords(chunk) + (SCALES[scale] ? " " + SCALES[scale] : ""));
      }
      n = Math.floor(n / 1000);
      scale += 1;
    }
    return parts.join(" ");
  }

  function amountInWords(cents, currency) {
    var c = Math.abs(Math.round(Number(cents) || 0));
    var major = Math.floor(c / 100);
    var minor = c % 100;
    var names = CURRENCY_NAMES[currency] || [currency || "", "Cents"];
    var text = (names[0] + " " + integerToWords(major)).trim();
    if (minor) text += " and " + integerToWords(minor) + " " + names[1];
    return text + " Only";
  }

  /* ------------------------------------------------------------------ */
  /* Phone numbers (WhatsApp links)                                      */
  /* ------------------------------------------------------------------ */

  function toWhatsAppNumber(raw, defaultCountryCode) {
    var cc = defaultCountryCode || "254";
    var text = String(raw || "").trim();
    var digits = text.replace(/\D/g, "");
    if (!digits) return "";
    if (text.charAt(0) === "+") return digits;
    if (digits.indexOf("00") === 0) return digits.slice(2);
    if (digits.charAt(0) === "0" && digits.length >= 9) return cc + digits.slice(1);
    if (digits.length === 9 && /^[17]/.test(digits)) return cc + digits;
    return digits;
  }

  /* ------------------------------------------------------------------ */
  /* Store — persistence and business operations                         */
  /* ------------------------------------------------------------------ */

  function createStore(storage, options) {
    var opts = options || {};
    var now = opts.now || function () { return new Date(); };
    var listeners = [];
    var state = load();

    function stamp() {
      return now().toISOString();
    }

    function today() {
      return toIso(now());
    }

    function freshState() {
      return { version: VERSION, settings: deepClone(DEFAULT_SETTINGS), clients: [], invoices: [] };
    }

    function normalizeSettings(raw) {
      var source = raw && typeof raw === "object" ? raw : {};
      var s = Object.assign({}, deepClone(DEFAULT_SETTINGS), source);
      s.business = Object.assign({}, deepClone(DEFAULT_SETTINGS.business), source.business || {});
      s.currency = String(s.currency || "KES").toUpperCase().slice(0, 3) || "KES";
      s.taxRate = clamp(Number(s.taxRate) || 0, 0, 100);
      if (["exclusive", "inclusive", "none"].indexOf(s.taxMode) < 0) s.taxMode = "exclusive";
      s.nextInvoiceNumber = Math.max(1, parseInt(s.nextInvoiceNumber, 10) || 1);
      s.nextReceiptNumber = Math.max(1, parseInt(s.nextReceiptNumber, 10) || 1);
      s.numberPadding = clamp(parseInt(s.numberPadding, 10) || 4, 1, 8);
      s.dueDays = clamp(parseInt(s.dueDays, 10) || 0, 0, 365);
      return s;
    }

    function normalizeClient(raw) {
      var c = Object.assign(
        { id: "", name: "", email: "", phone: "", address: "", kraPin: "", createdAt: "" },
        raw && typeof raw === "object" ? raw : {}
      );
      if (!c.id) c.id = uid();
      ["name", "email", "phone", "address", "kraPin"].forEach(function (key) {
        c[key] = String(c[key] == null ? "" : c[key]).trim();
      });
      return c;
    }

    function normalizeInvoice(raw) {
      var source = raw && typeof raw === "object" ? raw : {};
      var inv = Object.assign(
        {
          id: "",
          number: "",
          status: "open",
          currency: "KES",
          clientId: "",
          client: {},
          issueDate: "",
          dueDate: "",
          reference: "",
          items: [],
          discount: { type: "none", value: 0 },
          taxMode: "exclusive",
          taxRate: 0,
          notes: "",
          terms: "",
          paymentInstructions: "",
          payments: [],
          createdAt: "",
          updatedAt: "",
        },
        source
      );
      inv.client = Object.assign(
        { name: "", email: "", phone: "", address: "", kraPin: "" },
        source.client || {}
      );
      ["name", "email", "phone", "address", "kraPin"].forEach(function (key) {
        inv.client[key] = String(inv.client[key] == null ? "" : inv.client[key]).trim();
      });
      inv.currency = String(inv.currency || "KES").toUpperCase().slice(0, 3) || "KES";
      inv.items = (Array.isArray(inv.items) ? inv.items : []).map(function (item) {
        return {
          description: String(item.description == null ? "" : item.description).trim(),
          qty: Number(item.qty) || 0,
          unitPrice: Math.round(Number(item.unitPrice) || 0),
        };
      });
      inv.payments = (Array.isArray(inv.payments) ? inv.payments : []).map(function (p) {
        var payment = Object.assign(
          { id: "", receiptNumber: "", date: "", amount: 0, method: "Other", reference: "", note: "", createdAt: "" },
          p
        );
        if (!payment.id) payment.id = uid();
        payment.amount = Math.round(Number(payment.amount) || 0);
        return payment;
      });
      inv.discount = Object.assign({ type: "none", value: 0 }, inv.discount || {});
      if (["none", "percent", "fixed"].indexOf(inv.discount.type) < 0) inv.discount.type = "none";
      inv.discount.value = Number(inv.discount.value) || 0;
      if (["exclusive", "inclusive", "none"].indexOf(inv.taxMode) < 0) inv.taxMode = "exclusive";
      inv.taxRate = clamp(Number(inv.taxRate) || 0, 0, 100);
      inv.status = inv.status === "void" ? "void" : "open";
      ["reference", "notes", "terms", "paymentInstructions"].forEach(function (key) {
        inv[key] = String(inv[key] == null ? "" : inv[key]);
      });
      return inv;
    }

    function migrate(data) {
      var s = freshState();
      if (!data || typeof data !== "object") return s;
      s.settings = normalizeSettings(data.settings);
      s.clients = (Array.isArray(data.clients) ? data.clients : []).map(normalizeClient);
      s.invoices = (Array.isArray(data.invoices) ? data.invoices : []).map(normalizeInvoice);
      return s;
    }

    function load() {
      var raw = null;
      try {
        raw = storage.getItem(STORAGE_KEY);
        if (raw) return migrate(JSON.parse(raw));
      } catch (e) {
        // Keep a copy of anything unreadable so it is never silently lost.
        try {
          if (raw) storage.setItem(STORAGE_KEY + ".unreadable-" + Date.now(), raw);
        } catch (ignored) {
          /* storage unavailable */
        }
      }
      return freshState();
    }

    function persist() {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        if (typeof opts.onPersistError === "function") opts.onPersistError(e);
        return false;
      }
      listeners.forEach(function (fn) {
        fn(state);
      });
      return true;
    }

    function findClientByName(name) {
      var key = String(name || "").trim().toLowerCase();
      if (!key) return null;
      for (var i = 0; i < state.clients.length; i += 1) {
        if (state.clients[i].name.toLowerCase() === key) return state.clients[i];
      }
      return null;
    }

    // Insert or update a client without persisting (callers persist).
    function upsertClient(input) {
      var data = normalizeClient(input);
      if (!data.name) throw new Error("Client name is required.");
      var existing = null;
      for (var i = 0; i < state.clients.length; i += 1) {
        if (state.clients[i].id === data.id) existing = state.clients[i];
      }
      if (!existing) existing = findClientByName(data.name);
      if (existing) {
        existing.name = data.name;
        ["email", "phone", "address", "kraPin"].forEach(function (key) {
          if (data[key] || input.overwriteEmpty) existing[key] = data[key];
        });
        return existing;
      }
      data.createdAt = stamp();
      state.clients.push(data);
      return data;
    }

    /* ---- settings ---- */

    function getSettings() {
      return deepClone(state.settings);
    }

    function saveSettings(patch) {
      var merged = Object.assign({}, state.settings, patch || {});
      merged.business = Object.assign({}, state.settings.business, (patch && patch.business) || {});
      var next = normalizeSettings(merged);
      var nextInvoice = formatNumber(next.invoicePrefix, next.nextInvoiceNumber, next.numberPadding);
      var nextReceipt = formatNumber(next.receiptPrefix, next.nextReceiptNumber, next.numberPadding);
      state.invoices.forEach(function (inv) {
        if (inv.number === nextInvoice) {
          throw new Error("Invoice " + nextInvoice + " already exists. Choose a higher next invoice number.");
        }
        inv.payments.forEach(function (p) {
          if (p.receiptNumber === nextReceipt) {
            throw new Error("Receipt " + nextReceipt + " already exists. Choose a higher next receipt number.");
          }
        });
      });
      state.settings = next;
      return persist();
    }

    /* ---- clients ---- */

    function listClients() {
      return deepClone(state.clients).sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    }

    function getClient(id) {
      for (var i = 0; i < state.clients.length; i += 1) {
        if (state.clients[i].id === id) return deepClone(state.clients[i]);
      }
      return null;
    }

    function saveClient(input) {
      var saved = upsertClient(Object.assign({}, input, { overwriteEmpty: true }));
      persist();
      return deepClone(saved);
    }

    function deleteClient(id) {
      state.clients = state.clients.filter(function (c) {
        return c.id !== id;
      });
      return persist();
    }

    /* ---- invoices ---- */

    function listInvoices() {
      return deepClone(state.invoices).sort(function (a, b) {
        return (
          String(b.createdAt || "").localeCompare(String(a.createdAt || "")) ||
          String(b.number).localeCompare(String(a.number))
        );
      });
    }

    function getInvoice(id) {
      for (var i = 0; i < state.invoices.length; i += 1) {
        if (state.invoices[i].id === id) return deepClone(state.invoices[i]);
      }
      return null;
    }

    function saveInvoice(input) {
      var draft = normalizeInvoice(input);
      if (!draft.client.name) throw new Error("Client name is required.");
      var existing = null;
      for (var i = 0; i < state.invoices.length; i += 1) {
        if (draft.id && state.invoices[i].id === draft.id) existing = state.invoices[i];
      }
      var client = upsertClient(draft.client);
      draft.clientId = client.id;

      if (existing) {
        if (existing.payments.length) {
          throw new Error("This invoice has recorded payments and can no longer be edited.");
        }
        Object.assign(existing, draft, {
          number: existing.number,
          payments: existing.payments,
          status: existing.status,
          createdAt: existing.createdAt,
          updatedAt: stamp(),
        });
        persist();
        return deepClone(existing);
      }

      var s = state.settings;
      draft.id = uid();
      draft.number = formatNumber(s.invoicePrefix, s.nextInvoiceNumber, s.numberPadding);
      s.nextInvoiceNumber += 1;
      draft.payments = [];
      draft.status = "open";
      draft.createdAt = stamp();
      draft.updatedAt = draft.createdAt;
      state.invoices.push(draft);
      persist();
      return deepClone(draft);
    }

    function deleteInvoice(id) {
      state.invoices = state.invoices.filter(function (inv) {
        return inv.id !== id;
      });
      return persist();
    }

    function setInvoiceStatus(id, status) {
      var inv = null;
      for (var i = 0; i < state.invoices.length; i += 1) {
        if (state.invoices[i].id === id) inv = state.invoices[i];
      }
      if (!inv) return false;
      inv.status = status === "void" ? "void" : "open";
      inv.updatedAt = stamp();
      return persist();
    }

    /* ---- payments & receipts ---- */

    function recordPayment(invoiceId, input) {
      var inv = null;
      for (var i = 0; i < state.invoices.length; i += 1) {
        if (state.invoices[i].id === invoiceId) inv = state.invoices[i];
      }
      if (!inv) throw new Error("Invoice not found.");
      if (inv.status === "void") throw new Error("This invoice is void. Reopen it before recording a payment.");
      var amount = Math.round(Number(input && input.amount));
      if (!(amount > 0)) throw new Error("Enter an amount greater than zero.");
      var totals = computeTotals(inv);
      if (amount > totals.balance) {
        throw new Error(
          "Amount exceeds the outstanding balance of " + money.format(totals.balance, inv.currency) + "."
        );
      }
      var s = state.settings;
      var payment = {
        id: uid(),
        receiptNumber: formatNumber(s.receiptPrefix, s.nextReceiptNumber, s.numberPadding),
        date: parseIso(input.date) ? input.date : today(),
        amount: amount,
        method: PAYMENT_METHODS.indexOf(input.method) >= 0 ? input.method : "Other",
        reference: String(input.reference || "").trim(),
        note: String(input.note || "").trim(),
        createdAt: stamp(),
      };
      s.nextReceiptNumber += 1;
      inv.payments.push(payment);
      inv.updatedAt = payment.createdAt;
      persist();
      return deepClone(payment);
    }

    function deletePayment(invoiceId, paymentId) {
      var inv = null;
      for (var i = 0; i < state.invoices.length; i += 1) {
        if (state.invoices[i].id === invoiceId) inv = state.invoices[i];
      }
      if (!inv) return false;
      inv.payments = inv.payments.filter(function (p) {
        return p.id !== paymentId;
      });
      inv.updatedAt = stamp();
      return persist();
    }

    function receiptView(inv, payment, index) {
      var totals = computeTotals(inv);
      var paidBefore = inv.payments.slice(0, index).reduce(function (sum, p) {
        return sum + p.amount;
      }, 0);
      return {
        payment: deepClone(payment),
        invoice: deepClone(inv),
        invoiceTotal: totals.total,
        paidBefore: paidBefore,
        paidToDate: paidBefore + payment.amount,
        balanceAfter: totals.total - paidBefore - payment.amount,
      };
    }

    function listReceipts() {
      var out = [];
      state.invoices.forEach(function (inv) {
        inv.payments.forEach(function (p, index) {
          out.push(receiptView(inv, p, index));
        });
      });
      return out.sort(function (a, b) {
        return (
          String(b.payment.date).localeCompare(String(a.payment.date)) ||
          String(b.payment.createdAt).localeCompare(String(a.payment.createdAt))
        );
      });
    }

    function getReceipt(paymentId) {
      for (var i = 0; i < state.invoices.length; i += 1) {
        var inv = state.invoices[i];
        for (var j = 0; j < inv.payments.length; j += 1) {
          if (inv.payments[j].id === paymentId) return receiptView(inv, inv.payments[j], j);
        }
      }
      return null;
    }

    /* ---- backup ---- */

    function summary() {
      return {
        invoices: state.invoices.length,
        clients: state.clients.length,
        receipts: state.invoices.reduce(function (sum, inv) {
          return sum + inv.payments.length;
        }, 0),
      };
    }

    function exportJson() {
      state.settings.lastBackupAt = stamp();
      persist();
      return JSON.stringify(
        Object.assign({ app: "rekonet-invoicing", exportedAt: state.settings.lastBackupAt }, state),
        null,
        2
      );
    }

    function validateImport(data) {
      if (!data || typeof data !== "object") return "That file is not a valid backup.";
      if (!Array.isArray(data.invoices) || !data.settings || typeof data.settings !== "object") {
        return "That file does not look like a Rekonet invoicing backup.";
      }
      if (Number(data.version) > VERSION) return "That backup was made with a newer version of this tool.";
      return "";
    }

    function importJson(text) {
      var data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("That file is not valid JSON.");
      }
      var problem = validateImport(data);
      if (problem) throw new Error(problem);
      state = migrate(data);
      if (!persist()) throw new Error("The backup was read but could not be saved in this browser.");
      return summary();
    }

    function clearAll() {
      state = freshState();
      return persist();
    }

    function toCsv() {
      var todayIso = today();
      var head = [
        "Invoice", "Status", "Issue date", "Due date", "Client", "Currency",
        "Subtotal", "Discount", "Tax", "Total", "Paid", "Balance",
      ];
      var rows = listInvoices().map(function (inv) {
        var t = computeTotals(inv);
        return [
          inv.number, statusLabel(deriveStatus(inv, todayIso)), inv.issueDate, inv.dueDate,
          inv.client.name, inv.currency, money.plain(t.subtotal), money.plain(t.discount),
          money.plain(t.tax), money.plain(t.total), money.plain(t.paid), money.plain(t.balance),
        ];
      });
      return [head]
        .concat(rows)
        .map(function (row) {
          return row.map(csvCell).join(",");
        })
        .join("\r\n");
    }

    function subscribe(fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      };
    }

    return {
      today: today,
      getState: function () { return deepClone(state); },
      getSettings: getSettings,
      saveSettings: saveSettings,
      listClients: listClients,
      getClient: getClient,
      findClientByName: function (name) {
        var c = findClientByName(name);
        return c ? deepClone(c) : null;
      },
      saveClient: saveClient,
      deleteClient: deleteClient,
      listInvoices: listInvoices,
      getInvoice: getInvoice,
      saveInvoice: saveInvoice,
      deleteInvoice: deleteInvoice,
      setInvoiceStatus: setInvoiceStatus,
      recordPayment: recordPayment,
      deletePayment: deletePayment,
      listReceipts: listReceipts,
      getReceipt: getReceipt,
      summary: summary,
      exportJson: exportJson,
      importJson: importJson,
      clearAll: clearAll,
      toCsv: toCsv,
      subscribe: subscribe,
    };
  }

  function csvCell(value) {
    var s = String(value == null ? "" : value);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  /* ------------------------------------------------------------------ */
  /* Share text                                                          */
  /* ------------------------------------------------------------------ */

  function invoiceShareText(inv, settings, totals, status) {
    var cur = inv.currency;
    var lines = [];
    lines.push("Hello " + inv.client.name + ",");
    lines.push("Please find invoice " + inv.number + " from " + settings.business.name + ".");
    lines.push("");
    inv.items.slice(0, 6).forEach(function (item) {
      lines.push("• " + item.description + " × " + formatQty(item.qty) + " — " + money.format(lineTotal(item), cur));
    });
    if (inv.items.length > 6) lines.push("• …and " + (inv.items.length - 6) + " more");
    lines.push("");
    lines.push("Total: " + money.format(totals.total, cur));
    if (totals.paid) lines.push("Paid: " + money.format(totals.paid, cur));
    lines.push((status === "paid" ? "Balance: " : "Balance due: ") + money.format(totals.balance, cur));
    lines.push("Due date: " + formatDate(inv.dueDate));
    if (inv.paymentInstructions) {
      lines.push("");
      lines.push(inv.paymentInstructions);
    }
    lines.push("");
    lines.push("Thank you.");
    return lines.join("\n");
  }

  function receiptShareText(receipt, settings) {
    var inv = receipt.invoice;
    var p = receipt.payment;
    var cur = inv.currency;
    var lines = [];
    lines.push("Hello " + inv.client.name + ",");
    lines.push(
      "Thank you for your payment of " + money.format(p.amount, cur) + " (" + p.method +
        (p.reference ? ", ref " + p.reference : "") + ") received on " + formatDate(p.date) + "."
    );
    lines.push("Receipt: " + p.receiptNumber + " · Invoice: " + inv.number);
    lines.push("Invoice total: " + money.format(receipt.invoiceTotal, cur));
    lines.push("Paid to date: " + money.format(receipt.paidToDate, cur));
    lines.push("Balance due: " + money.format(Math.max(receipt.balanceAfter, 0), cur));
    lines.push("");
    lines.push("Regards, " + settings.business.name);
    return lines.join("\n");
  }

  function whatsAppLink(phone, text) {
    var number = toWhatsAppNumber(phone);
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  }

  function mailtoLink(email, subject, body) {
    return (
      "mailto:" + encodeURIComponent(email || "") +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body)
    );
  }

  /* ------------------------------------------------------------------ */
  /* Routing                                                             */
  /* ------------------------------------------------------------------ */

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch (e) {
      return value;
    }
  }

  function parseRoute(hash) {
    var raw = String(hash || "").replace(/^#/, "");
    var qIdx = raw.indexOf("?");
    var path = (qIdx >= 0 ? raw.slice(0, qIdx) : raw).replace(/^\/+|\/+$/g, "");
    var query = {};
    if (qIdx >= 0) {
      raw.slice(qIdx + 1).split("&").forEach(function (pair) {
        var kv = pair.split("=");
        if (kv[0]) query[safeDecode(kv[0])] = safeDecode(kv[1] || "");
      });
    }
    var parts = path ? path.split("/").map(safeDecode) : [];
    if (parts.length === 0 || (parts[0] === "invoices" && parts.length === 1)) {
      return { name: "invoices", query: query };
    }
    if (parts[0] === "invoices") {
      if (parts[1] === "new") return { name: "invoice-new", query: query };
      if (parts.length === 2) return { name: "invoice-view", id: parts[1], query: query };
      if (parts[2] === "edit") return { name: "invoice-edit", id: parts[1], query: query };
      if (parts[2] === "duplicate") return { name: "invoice-duplicate", id: parts[1], query: query };
    }
    if (parts[0] === "receipts") {
      return parts.length === 1
        ? { name: "receipts", query: query }
        : { name: "receipt-view", id: parts[1], query: query };
    }
    if (parts[0] === "clients") return { name: "clients", query: query };
    if (parts[0] === "settings") return { name: "settings", query: query };
    return { name: "not-found", query: query };
  }

  /* ------------------------------------------------------------------ */
  /* View templates                                                      */
  /* ------------------------------------------------------------------ */

  function pill(status) {
    return '<span class="pill pill-' + esc(status) + '">' + esc(statusLabel(status)) + "</span>";
  }

  function pageHead(title, subtitle, actionsHtml, backHref, backLabel) {
    return (
      '<div class="page-head"><div>' +
      (backHref ? '<a class="back-link" href="' + esc(backHref) + '">&larr; ' + esc(backLabel) + "</a>" : "") +
      "<h1>" + esc(title) + "</h1>" +
      (subtitle ? '<p class="muted">' + subtitle + "</p>" : "") +
      "</div>" +
      (actionsHtml ? '<div class="page-actions">' + actionsHtml + "</div>" : "") +
      "</div>"
    );
  }

  function emptyState(title, text, actionsHtml) {
    return (
      '<div class="empty-state"><h2>' + esc(title) + "</h2><p>" + text + "</p>" +
      (actionsHtml ? '<div class="btn-row">' + actionsHtml + "</div>" : "") +
      "</div>"
    );
  }

  function viewNotFound() {
    return (
      '<section class="page">' +
      pageHead("Not found", "That record does not exist or has been deleted.") +
      '<a class="btn btn-primary" href="#/invoices">Back to invoices</a></section>'
    );
  }

  function statusFilterOptions(selected) {
    var options = [["all", "All statuses"]].concat(
      Object.keys(STATUS_LABELS).map(function (key) {
        return [key, STATUS_LABELS[key]];
      })
    );
    return options
      .map(function (opt) {
        return '<option value="' + opt[0] + '"' + (opt[0] === selected ? " selected" : "") + ">" + opt[1] + "</option>";
      })
      .join("");
  }

  function filterInvoices(list, filters, todayIso) {
    var q = String(filters.q || "").trim().toLowerCase();
    return list.filter(function (inv) {
      if (filters.status && filters.status !== "all" && deriveStatus(inv, todayIso) !== filters.status) {
        return false;
      }
      if (!q) return true;
      return (
        inv.number.toLowerCase().indexOf(q) >= 0 ||
        inv.client.name.toLowerCase().indexOf(q) >= 0 ||
        String(inv.reference || "").toLowerCase().indexOf(q) >= 0
      );
    });
  }

  function invoiceRow(inv, todayIso) {
    var t = computeTotals(inv);
    var st = deriveStatus(inv, todayIso);
    var canPay = st !== "paid" && st !== "void";
    var late = st === "overdue" ? '<span class="sub-text">' + daysBetween(inv.dueDate, todayIso) + " days late</span>" : "";
    return (
      '<tr data-href="#/invoices/' + esc(inv.id) + '">' +
      '<td><a class="row-link" href="#/invoices/' + esc(inv.id) + '">' + esc(inv.number) + "</a></td>" +
      "<td>" + esc(inv.client.name) + "</td>" +
      "<td>" + esc(formatDate(inv.issueDate)) + "</td>" +
      "<td>" + esc(formatDate(inv.dueDate)) + late + "</td>" +
      '<td class="num">' + esc(money.format(t.total, inv.currency)) + "</td>" +
      '<td class="num">' + esc(money.format(t.balance, inv.currency)) + "</td>" +
      "<td>" + pill(st) + "</td>" +
      '<td class="row-actions">' +
      (canPay
        ? '<button type="button" class="btn btn-sm btn-ghost" data-action="record-payment" data-id="' + esc(inv.id) + '">Record payment</button>'
        : "") +
      "</td></tr>"
    );
  }

  function invoiceRows(ui) {
    var todayIso = ui.store.today();
    var list = filterInvoices(ui.store.listInvoices(), ui.filters, todayIso);
    if (!list.length) {
      return '<tr><td colspan="8" class="table-empty">No invoices match your search.</td></tr>';
    }
    return list
      .map(function (inv) {
        return invoiceRow(inv, todayIso);
      })
      .join("");
  }

  function viewInvoices(ui) {
    var settings = ui.store.getSettings();
    var invoices = ui.store.listInvoices();
    var todayIso = ui.store.today();
    var newBtn = '<a class="btn btn-primary" href="#/invoices/new">+ New invoice</a>';

    if (!invoices.length) {
      return (
        '<section class="page">' +
        pageHead("Invoices", "Create invoices, record payments and issue receipts.", newBtn) +
        '<div class="onboarding card">' +
        "<h2>Get set up in three steps</h2>" +
        '<ol class="steps">' +
        '<li><strong>Add your business details.</strong> Name, contacts, KRA PIN, logo and payment details appear on every document. <a href="#/settings">Open settings</a></li>' +
        '<li><strong>Create your first invoice.</strong> Add the client, line items, VAT and due date, then print or save it as a PDF. <a href="#/invoices/new">New invoice</a></li>' +
        "<li><strong>Record the payment when it arrives.</strong> Each payment creates a numbered receipt you can print or share on WhatsApp.</li>" +
        "</ol>" +
        '<p class="hint">Everything is stored in this browser — no account needed. Download a backup from Settings whenever you have new invoices.</p>' +
        "</div></section>"
      );
    }

    var stats = computeStats(invoices, todayIso);
    var cur = settings.currency;
    return (
      '<section class="page">' +
      pageHead("Invoices", "Create invoices, record payments and issue receipts.", newBtn) +
      '<div class="stats">' +
      '<div class="stat"><span class="stat-label">Outstanding</span><strong class="stat-value">' + esc(money.format(stats.outstanding, cur)) + "</strong><span class=\"stat-sub\">" + stats.outstandingCount + " unpaid invoice" + (stats.outstandingCount === 1 ? "" : "s") + "</span></div>" +
      '<div class="stat' + (stats.overdueCount ? " stat-danger" : "") + '"><span class="stat-label">Overdue</span><strong class="stat-value">' + esc(money.format(stats.overdue, cur)) + "</strong><span class=\"stat-sub\">" + stats.overdueCount + " overdue</span></div>" +
      '<div class="stat stat-success"><span class="stat-label">Received this month</span><strong class="stat-value">' + esc(money.format(stats.receivedMonth, cur)) + "</strong><span class=\"stat-sub\">" + stats.receivedMonthCount + " payment" + (stats.receivedMonthCount === 1 ? "" : "s") + "</span></div>" +
      '<div class="stat"><span class="stat-label">Invoiced this month</span><strong class="stat-value">' + esc(money.format(stats.invoicedMonth, cur)) + "</strong><span class=\"stat-sub\">" + stats.invoicedMonthCount + " invoice" + (stats.invoicedMonthCount === 1 ? "" : "s") + "</span></div>" +
      "</div>" +
      '<div class="toolbar">' +
      '<label class="visually-hidden" for="invoice-search">Search invoices</label>' +
      '<input type="search" id="invoice-search" data-filter="q" placeholder="Search by number, client or reference" value="' + esc(ui.filters.q) + '">' +
      '<label class="visually-hidden" for="invoice-status">Filter by status</label>' +
      '<select id="invoice-status" data-filter="status">' + statusFilterOptions(ui.filters.status) + "</select>" +
      "</div>" +
      '<div class="table-wrap card"><table class="data-table"><thead><tr>' +
      "<th>Invoice</th><th>Client</th><th>Issued</th><th>Due</th>" +
      '<th class="num">Total</th><th class="num">Balance</th><th>Status</th><th><span class="visually-hidden">Actions</span></th>' +
      '</tr></thead><tbody data-invoice-rows>' + invoiceRows(ui) + "</tbody></table></div>" +
      "</section>"
    );
  }

  function docBrandBlock(business) {
    var contactLine = [business.phone, business.email, business.website].filter(Boolean).map(esc).join(" · ");
    return (
      '<div class="doc-brand">' +
      (business.logo ? '<img class="doc-logo" src="' + esc(business.logo) + '" alt="">' : "") +
      "<div>" +
      '<p class="doc-business">' + esc(business.name) + "</p>" +
      (business.tagline ? '<p class="doc-tagline">' + esc(business.tagline) + "</p>" : "") +
      (business.address ? '<p class="doc-contact pre-line">' + esc(business.address) + "</p>" : "") +
      (contactLine ? '<p class="doc-contact">' + contactLine + "</p>" : "") +
      (business.kraPin ? '<p class="doc-contact">KRA PIN: ' + esc(business.kraPin) + "</p>" : "") +
      "</div></div>"
    );
  }

  function clientBlock(client, heading) {
    var line = [client.phone, client.email].filter(Boolean).map(esc).join(" · ");
    return (
      '<div class="doc-party"><h3>' + esc(heading) + "</h3>" +
      '<p class="doc-party-name">' + esc(client.name) + "</p>" +
      (client.address ? '<p class="pre-line">' + esc(client.address) + "</p>" : "") +
      (line ? "<p>" + line + "</p>" : "") +
      (client.kraPin ? "<p>KRA PIN: " + esc(client.kraPin) + "</p>" : "") +
      "</div>"
    );
  }

  function invoiceDocument(inv, settings, totals, status) {
    var b = settings.business;
    var cur = inv.currency;
    var taxLabel = settings.taxLabel || "VAT";
    var taxLine = "";
    if (totals.mode === "exclusive" && totals.rate > 0) {
      taxLine = "<div><dt>" + esc(taxLabel) + " " + esc(formatQty(totals.rate)) + "%</dt><dd>" + esc(money.format(totals.tax, cur)) + "</dd></div>";
    } else if (totals.mode === "inclusive" && totals.rate > 0) {
      taxLine = '<div class="doc-subtle"><dt>Includes ' + esc(taxLabel) + " " + esc(formatQty(totals.rate)) + "%</dt><dd>" + esc(money.format(totals.tax, cur)) + "</dd></div>";
    }
    var stamp = "";
    if (status === "paid") stamp = '<div class="doc-stamp doc-stamp-paid" aria-hidden="true">Paid</div>';
    if (status === "void") stamp = '<div class="doc-stamp doc-stamp-void" aria-hidden="true">Void</div>';
    var dueLabel = status === "paid" ? "Amount paid" : "Balance due";
    var dueValue = status === "paid" ? totals.paid : totals.balance;

    return (
      '<article class="doc doc-invoice" aria-label="Invoice ' + esc(inv.number) + '">' + stamp +
      '<header class="doc-head">' + docBrandBlock(b) +
      '<div class="doc-title-block"><h1 class="doc-type">Invoice</h1><p class="doc-number">' + esc(inv.number) + "</p>" +
      '<dl class="doc-meta">' +
      "<div><dt>Date</dt><dd>" + esc(formatDate(inv.issueDate)) + "</dd></div>" +
      "<div><dt>Due</dt><dd>" + esc(formatDate(inv.dueDate)) + "</dd></div>" +
      (inv.reference ? "<div><dt>Reference</dt><dd>" + esc(inv.reference) + "</dd></div>" : "") +
      "<div><dt>Status</dt><dd>" + esc(statusLabel(status)) + "</dd></div>" +
      "</dl></div></header>" +
      '<section class="doc-parties">' + clientBlock(inv.client, "Bill to") +
      '<div class="doc-party doc-amount-due"><h3>' + dueLabel + '</h3><p class="doc-big">' + esc(money.format(dueValue, cur)) + "</p>" +
      (status !== "paid" && status !== "void" ? '<p class="muted">Due ' + esc(formatDate(inv.dueDate, "long")) + "</p>" : "") +
      "</div></section>" +
      '<table class="doc-items"><thead><tr><th class="col-index">#</th><th>Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th></tr></thead><tbody>' +
      inv.items
        .map(function (item, i) {
          return (
            '<tr><td class="col-index">' + (i + 1) + '</td><td class="pre-line">' + esc(item.description) + "</td>" +
            '<td class="num">' + esc(formatQty(item.qty)) + '</td><td class="num">' + esc(money.format(item.unitPrice)) + "</td>" +
            '<td class="num">' + esc(money.format(lineTotal(item))) + "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>" +
      '<section class="doc-summary"><div class="doc-notes">' +
      (inv.paymentInstructions ? '<h3>Payment details</h3><p class="pre-line">' + esc(inv.paymentInstructions) + "</p>" : "") +
      (inv.notes ? '<h3>Notes</h3><p class="pre-line">' + esc(inv.notes) + "</p>" : "") +
      (inv.terms ? '<h3>Terms</h3><p class="pre-line">' + esc(inv.terms) + "</p>" : "") +
      "</div>" +
      '<dl class="doc-totals">' +
      "<div><dt>Subtotal</dt><dd>" + esc(money.format(totals.subtotal, cur)) + "</dd></div>" +
      (totals.discount
        ? "<div><dt>Discount" + (inv.discount.type === "percent" ? " (" + esc(formatQty(inv.discount.value)) + "%)" : "") + "</dt><dd>-" + esc(money.format(totals.discount, cur)) + "</dd></div>"
        : "") +
      taxLine +
      '<div class="doc-total"><dt>Total</dt><dd>' + esc(money.format(totals.total, cur)) + "</dd></div>" +
      (totals.paid
        ? "<div><dt>Paid</dt><dd>-" + esc(money.format(totals.paid, cur)) + '</dd></div><div class="doc-balance"><dt>Balance due</dt><dd>' + esc(money.format(totals.balance, cur)) + "</dd></div>"
        : "") +
      "</dl></section>" +
      '<footer class="doc-foot"><p>Thank you for your business.</p><p class="muted">' +
      [b.name, b.phone, b.email].filter(Boolean).map(esc).join(" · ") +
      "</p></footer></article>"
    );
  }

  function paymentsTable(inv, canPay) {
    var rows = inv.payments
      .map(function (p) {
        return (
          '<tr data-href="#/receipts/' + esc(p.id) + '">' +
          '<td><a class="row-link" href="#/receipts/' + esc(p.id) + '">' + esc(p.receiptNumber) + "</a></td>" +
          "<td>" + esc(formatDate(p.date)) + "</td><td>" + esc(p.method) + "</td><td>" + esc(p.reference || "—") + "</td>" +
          '<td class="num">' + esc(money.format(p.amount, inv.currency)) + "</td>" +
          '<td class="row-actions"><a class="btn btn-sm btn-ghost" href="#/receipts/' + esc(p.id) + '">View receipt</a>' +
          '<button type="button" class="btn btn-sm btn-ghost btn-danger-text" data-action="delete-payment" data-id="' + esc(inv.id) + '" data-payment-id="' + esc(p.id) + '">Delete</button></td></tr>'
        );
      })
      .join("");
    return (
      '<section class="card no-print"><div class="card-head"><h2 class="card-title">Payments &amp; receipts</h2>' +
      (canPay ? '<button type="button" class="btn btn-success btn-sm" data-action="record-payment" data-id="' + esc(inv.id) + '">Record payment</button>' : "") +
      "</div>" +
      (inv.payments.length
        ? '<div class="table-wrap"><table class="data-table"><thead><tr><th>Receipt</th><th>Date</th><th>Method</th><th>Reference</th><th class="num">Amount</th><th><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' + rows + "</tbody></table></div>"
        : '<p class="muted">No payments recorded yet. When the client pays, record the payment here to issue a numbered receipt.</p>') +
      "</section>"
    );
  }

  function viewInvoice(ui, id) {
    var inv = ui.store.getInvoice(id);
    if (!inv) return { html: viewNotFound(), title: "Not found" };
    var settings = ui.store.getSettings();
    var todayIso = ui.store.today();
    var totals = computeTotals(inv);
    var status = deriveStatus(inv, todayIso);
    var canPay = status !== "paid" && status !== "void";
    var canEdit = inv.payments.length === 0 && status !== "void";
    var shareText = invoiceShareText(inv, settings, totals, status);
    var subject = "Invoice " + inv.number + " from " + settings.business.name;
    var lockNote = "";
    if (inv.payments.length && status !== "void") {
      lockNote = '<p class="notice notice-info no-print">This invoice has recorded payments, so its details are locked. Delete the payment(s) below to edit it, or void it and create a new one.</p>';
    }
    if (status === "void") {
      lockNote = '<p class="notice notice-warn no-print">This invoice is void. It is kept for your records and excluded from totals.</p>';
    }
    if (status === "overdue") {
      lockNote = '<p class="notice notice-warn no-print">Overdue by ' + daysBetween(inv.dueDate, todayIso) + " day" + (daysBetween(inv.dueDate, todayIso) === 1 ? "" : "s") + ". Balance due: <strong>" + esc(money.format(totals.balance, inv.currency)) + "</strong>.</p>";
    }

    var html =
      '<section class="page page-doc">' +
      '<div class="doc-actions no-print">' +
      '<a class="back-link" href="#/invoices">&larr; Invoices</a>' +
      '<div class="btn-row">' +
      '<button type="button" class="btn btn-primary" data-action="print">Print / Save PDF</button>' +
      (canPay ? '<button type="button" class="btn btn-success" data-action="record-payment" data-id="' + esc(inv.id) + '">Record payment</button>' : "") +
      '<a class="btn btn-ghost" href="' + esc(whatsAppLink(inv.client.phone, shareText)) + '" target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>' +
      '<a class="btn btn-ghost" href="' + esc(mailtoLink(inv.client.email, subject, shareText)) + '">Email</a>' +
      "</div>" +
      '<div class="btn-row btn-row-secondary">' +
      (canEdit ? '<a class="btn btn-link" href="#/invoices/' + esc(inv.id) + '/edit">Edit</a>' : "") +
      '<a class="btn btn-link" href="#/invoices/' + esc(inv.id) + '/duplicate">Duplicate</a>' +
      (status === "void"
        ? '<button type="button" class="btn btn-link" data-action="reopen-invoice" data-id="' + esc(inv.id) + '">Reopen</button>'
        : '<button type="button" class="btn btn-link" data-action="void-invoice" data-id="' + esc(inv.id) + '">Void</button>') +
      '<button type="button" class="btn btn-link btn-danger-text" data-action="delete-invoice" data-id="' + esc(inv.id) + '">Delete</button>' +
      "</div></div>" +
      lockNote +
      invoiceDocument(inv, settings, totals, status) +
      paymentsTable(inv, canPay) +
      '<p class="hint no-print">Tip: use <strong>Print / Save PDF</strong> and choose “Save as PDF” as the destination, then attach the file when you share it.</p>' +
      "</section>";
    return { html: html, title: inv.number + " · " + inv.client.name };
  }

  function receiptDocument(receipt, settings) {
    var inv = receipt.invoice;
    var p = receipt.payment;
    var cur = inv.currency;
    var b = settings.business;
    return (
      '<article class="doc doc-receipt" aria-label="Receipt ' + esc(p.receiptNumber) + '">' +
      '<header class="doc-head">' + docBrandBlock(b) +
      '<div class="doc-title-block"><h1 class="doc-type">Receipt</h1><p class="doc-number">' + esc(p.receiptNumber) + "</p>" +
      '<dl class="doc-meta">' +
      "<div><dt>Date</dt><dd>" + esc(formatDate(p.date)) + "</dd></div>" +
      "<div><dt>Invoice</dt><dd>" + esc(inv.number) + "</dd></div>" +
      "<div><dt>Method</dt><dd>" + esc(p.method) + "</dd></div>" +
      (p.reference ? "<div><dt>Reference</dt><dd>" + esc(p.reference) + "</dd></div>" : "") +
      "</dl></div></header>" +
      '<section class="doc-parties">' + clientBlock(inv.client, "Received from") +
      '<div class="doc-party doc-amount-due"><h3>Amount received</h3><p class="doc-big">' + esc(money.format(p.amount, cur)) + "</p>" +
      '<p class="doc-words">' + esc(amountInWords(p.amount, cur)) + "</p></div></section>" +
      '<table class="doc-items receipt-summary"><thead><tr><th>Payment for</th><th class="num">Invoice total</th><th class="num">Previously paid</th><th class="num">This payment</th><th class="num">Balance due</th></tr></thead><tbody>' +
      "<tr><td>Invoice " + esc(inv.number) + " dated " + esc(formatDate(inv.issueDate)) + (inv.reference ? " (ref " + esc(inv.reference) + ")" : "") + "</td>" +
      '<td class="num">' + esc(money.format(receipt.invoiceTotal, cur)) + "</td>" +
      '<td class="num">' + esc(money.format(receipt.paidBefore, cur)) + "</td>" +
      '<td class="num">' + esc(money.format(p.amount, cur)) + "</td>" +
      '<td class="num"><strong>' + esc(money.format(Math.max(receipt.balanceAfter, 0), cur)) + "</strong></td></tr>" +
      "</tbody></table>" +
      (p.note ? '<section class="doc-summary"><div class="doc-notes"><h3>Note</h3><p class="pre-line">' + esc(p.note) + "</p></div></section>" : "") +
      '<footer class="doc-foot doc-foot-receipt"><div><p>' +
      (receipt.balanceAfter <= 0 ? "Paid in full — thank you." : "Received with thanks.") + "</p>" +
      '<p class="muted">' + [b.name, b.phone, b.email].filter(Boolean).map(esc).join(" · ") + "</p></div>" +
      '<div class="signature-line"><span>Received by / authorised signature</span></div>' +
      "</footer></article>"
    );
  }

  function viewReceipt(ui, paymentId) {
    var receipt = ui.store.getReceipt(paymentId);
    if (!receipt) return { html: viewNotFound(), title: "Not found" };
    var settings = ui.store.getSettings();
    var inv = receipt.invoice;
    var p = receipt.payment;
    var shareText = receiptShareText(receipt, settings);
    var subject = "Receipt " + p.receiptNumber + " from " + settings.business.name;
    var html =
      '<section class="page page-doc">' +
      '<div class="doc-actions no-print">' +
      '<a class="back-link" href="#/receipts">&larr; Receipts</a>' +
      '<div class="btn-row">' +
      '<button type="button" class="btn btn-primary" data-action="print">Print / Save PDF</button>' +
      '<a class="btn btn-ghost" href="' + esc(whatsAppLink(inv.client.phone, shareText)) + '" target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>' +
      '<a class="btn btn-ghost" href="' + esc(mailtoLink(inv.client.email, subject, shareText)) + '">Email</a>' +
      '<a class="btn btn-ghost" href="#/invoices/' + esc(inv.id) + '">View invoice</a>' +
      "</div></div>" +
      receiptDocument(receipt, settings) +
      "</section>";
    return { html: html, title: p.receiptNumber + " · " + inv.client.name };
  }

  function viewReceipts(ui) {
    var receipts = ui.store.listReceipts();
    var head = pageHead("Receipts", "Every recorded payment gets a numbered receipt you can print or share.");
    if (!receipts.length) {
      return (
        '<section class="page">' + head +
        emptyState(
          "No receipts yet",
          "Open an invoice and choose <strong>Record payment</strong> when the client pays. A receipt is created automatically.",
          '<a class="btn btn-primary" href="#/invoices">Go to invoices</a>'
        ) + "</section>"
      );
    }
    var rows = receipts
      .map(function (r) {
        return (
          '<tr data-href="#/receipts/' + esc(r.payment.id) + '">' +
          '<td><a class="row-link" href="#/receipts/' + esc(r.payment.id) + '">' + esc(r.payment.receiptNumber) + "</a></td>" +
          "<td>" + esc(formatDate(r.payment.date)) + "</td><td>" + esc(r.invoice.client.name) + "</td>" +
          '<td><a href="#/invoices/' + esc(r.invoice.id) + '">' + esc(r.invoice.number) + "</a></td>" +
          "<td>" + esc(r.payment.method) + "</td><td>" + esc(r.payment.reference || "—") + "</td>" +
          '<td class="num">' + esc(money.format(r.payment.amount, r.invoice.currency)) + "</td></tr>"
        );
      })
      .join("");
    return (
      '<section class="page">' + head +
      '<div class="table-wrap card"><table class="data-table"><thead><tr><th>Receipt</th><th>Date</th><th>Client</th><th>Invoice</th><th>Method</th><th>Reference</th><th class="num">Amount</th></tr></thead><tbody>' +
      rows + "</tbody></table></div></section>"
    );
  }

  function viewClients(ui) {
    var clients = ui.store.listClients();
    var invoices = ui.store.listInvoices();
    var settings = ui.store.getSettings();
    var newBtn = '<button type="button" class="btn btn-primary" data-action="new-client">+ New client</button>';
    var head = pageHead("Clients", "Clients are saved automatically from your invoices. Edits apply to new invoices.", newBtn);
    if (!clients.length) {
      return (
        '<section class="page">' + head +
        emptyState("No clients yet", "Clients are added automatically when you save an invoice, or you can add one now.", newBtn) +
        "</section>"
      );
    }
    var rows = clients
      .map(function (c) {
        var mine = invoices.filter(function (inv) {
          return inv.clientId === c.id || inv.client.name.toLowerCase() === c.name.toLowerCase();
        });
        var outstanding = mine.reduce(function (sum, inv) {
          if (inv.status === "void") return sum;
          var bal = computeTotals(inv).balance;
          return sum + (bal > 0 ? bal : 0);
        }, 0);
        return (
          "<tr><td><strong>" + esc(c.name) + "</strong>" + (c.kraPin ? '<span class="sub-text">PIN ' + esc(c.kraPin) + "</span>" : "") + "</td>" +
          "<td>" + esc(c.phone || "—") + "</td><td>" + esc(c.email || "—") + "</td>" +
          '<td class="num">' + mine.length + '</td><td class="num">' + esc(money.format(outstanding, settings.currency)) + "</td>" +
          '<td class="row-actions">' +
          '<a class="btn btn-sm btn-ghost" href="#/invoices/new?client=' + encodeURIComponent(c.id) + '">New invoice</a>' +
          '<button type="button" class="btn btn-sm btn-ghost" data-action="edit-client" data-id="' + esc(c.id) + '">Edit</button>' +
          '<button type="button" class="btn btn-sm btn-ghost btn-danger-text" data-action="delete-client" data-id="' + esc(c.id) + '">Delete</button>' +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<section class="page">' + head +
      '<div class="table-wrap card"><table class="data-table"><thead><tr><th>Client</th><th>Phone</th><th>Email</th><th class="num">Invoices</th><th class="num">Outstanding</th><th><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' +
      rows + "</tbody></table></div></section>"
    );
  }

  function field(label, inputHtml, extraClass) {
    return '<label class="field' + (extraClass ? " " + extraClass : "") + '"><span>' + label + "</span>" + inputHtml + "</label>";
  }

  function input(name, value, attrs) {
    return '<input name="' + name + '" value="' + esc(value == null ? "" : value) + '" ' + (attrs || "") + ">";
  }

  function textarea(name, value, rows) {
    return '<textarea name="' + name + '" rows="' + (rows || 2) + '">' + esc(value == null ? "" : value) + "</textarea>";
  }

  function select(name, options, selected, attrs) {
    return (
      '<select name="' + name + '" ' + (attrs || "") + ">" +
      options
        .map(function (opt) {
          return '<option value="' + esc(opt[0]) + '"' + (String(opt[0]) === String(selected) ? " selected" : "") + ">" + esc(opt[1]) + "</option>";
        })
        .join("") +
      "</select>"
    );
  }

  function currencyDatalist() {
    return '<datalist id="currency-codes">' + CURRENCIES.map(function (c) { return '<option value="' + c + '"></option>'; }).join("") + "</datalist>";
  }

  function itemRowHtml(item) {
    var price = item && Number.isFinite(item.unitPrice) && item.unitPrice !== null ? money.plain(item.unitPrice) : "";
    return (
      '<tr class="item-row">' +
      '<td data-label="Description"><input name="item-description" value="' + esc(item ? item.description : "") + '" placeholder="Description of product or service" aria-label="Item description"></td>' +
      '<td data-label="Qty"><input name="item-qty" type="number" min="0" step="any" inputmode="decimal" value="' + esc(item ? formatQty(item.qty) : "1") + '" aria-label="Quantity"></td>' +
      '<td data-label="Unit price"><input name="item-price" inputmode="decimal" value="' + esc(price) + '" placeholder="0.00" aria-label="Unit price"></td>' +
      '<td class="num item-amount" data-label="Amount" data-item-amount>' + esc(item ? money.format(lineTotal(item)) : "0.00") + "</td>" +
      '<td><button type="button" class="icon-btn" data-action="remove-item" aria-label="Remove item" title="Remove item">&times;</button></td>' +
      "</tr>"
    );
  }

  function newDraft(settings) {
    var todayIso = toIso(new Date());
    return {
      id: "",
      number: "",
      currency: settings.currency,
      clientId: "",
      client: { name: "", email: "", phone: "", address: "", kraPin: "" },
      issueDate: todayIso,
      dueDate: addDays(todayIso, settings.dueDays),
      reference: "",
      items: [{ description: "", qty: 1, unitPrice: null }],
      discount: { type: "none", value: 0 },
      taxMode: settings.taxMode,
      taxRate: settings.taxRate,
      notes: settings.defaultNotes,
      terms: settings.defaultTerms,
      paymentInstructions: settings.paymentInstructions,
      payments: [],
    };
  }

  function viewEditor(ui, route) {
    var settings = ui.store.getSettings();
    var inv;
    var mode = "new";
    var headTitle = "New invoice";
    var subtitle = "Number <strong>" + esc(formatNumber(settings.invoicePrefix, settings.nextInvoiceNumber, settings.numberPadding)) + "</strong> will be assigned when you save.";

    if (route.name === "invoice-edit") {
      inv = ui.store.getInvoice(route.id);
      if (!inv) return viewNotFound();
      if (inv.payments.length || inv.status === "void") {
        return (
          '<section class="page">' +
          pageHead("Invoice locked", "", "", "#/invoices/" + inv.id, inv.number) +
          '<p class="notice notice-info">' +
          (inv.status === "void"
            ? "Void invoices cannot be edited. Reopen it first, or duplicate it into a new invoice."
            : "This invoice has recorded payments, so its details are locked. Delete the payment(s) from the invoice page to edit it, or duplicate it into a new invoice.") +
          "</p>" +
          '<div class="btn-row"><a class="btn btn-primary" href="#/invoices/' + esc(inv.id) + '">Back to invoice</a><a class="btn btn-ghost" href="#/invoices/' + esc(inv.id) + '/duplicate">Duplicate</a></div></section>'
        );
      }
      mode = "edit";
      headTitle = "Edit " + inv.number;
      subtitle = "Issued " + esc(formatDate(inv.issueDate)) + ". Changes are saved to the same invoice number.";
    } else if (route.name === "invoice-duplicate") {
      var source = ui.store.getInvoice(route.id);
      if (!source) return viewNotFound();
      inv = newDraft(settings);
      inv.client = source.client;
      inv.clientId = source.clientId;
      inv.items = source.items;
      inv.discount = source.discount;
      inv.taxMode = source.taxMode;
      inv.taxRate = source.taxRate;
      inv.currency = source.currency;
      inv.notes = source.notes;
      inv.terms = source.terms;
      inv.paymentInstructions = source.paymentInstructions;
      subtitle = "Copied from " + esc(source.number) + ". " + subtitle;
    } else {
      inv = newDraft(settings);
      if (route.query && route.query.client) {
        var client = ui.store.getClient(route.query.client);
        if (client) {
          inv.clientId = client.id;
          inv.client = { name: client.name, email: client.email, phone: client.phone, address: client.address, kraPin: client.kraPin };
        }
      }
    }

    var clients = ui.store.listClients();
    var taxLabel = settings.taxLabel || "VAT";
    var discountIsPercent = inv.discount.type === "percent";
    var discountValue = inv.discount.type === "none" ? "" : discountIsPercent ? formatQty(inv.discount.value) : money.plain(inv.discount.value);

    return (
      '<form class="editor" data-form="invoice" data-mode="' + mode + '" data-invoice-id="' + esc(inv.id) + '" novalidate>' +
      '<input type="hidden" name="client-id" value="' + esc(inv.clientId) + '">' +
      pageHead(headTitle, subtitle, "", "#/invoices", "Invoices") +
      '<div class="editor-grid"><div class="editor-main">' +
      '<section class="card"><h2 class="card-title">Bill to</h2><div class="form-grid">' +
      field("Client name <em>*</em>", input("client-name", inv.client.name, 'list="client-names" required autocomplete="organization" placeholder="Business or person"'), "field-wide") +
      field("Phone", input("client-phone", inv.client.phone, 'type="tel" inputmode="tel" placeholder="07XX XXX XXX"')) +
      field("Email", input("client-email", inv.client.email, 'type="email" inputmode="email"')) +
      field("Address", textarea("client-address", inv.client.address, 2), "field-wide") +
      field("KRA PIN", input("client-kra-pin", inv.client.kraPin, 'autocapitalize="characters"')) +
      "</div>" +
      '<datalist id="client-names">' + clients.map(function (c) { return '<option value="' + esc(c.name) + '"></option>'; }).join("") + "</datalist>" +
      "</section>" +
      '<section class="card"><h2 class="card-title">Invoice details</h2><div class="form-grid form-grid-4">' +
      field("Invoice date <em>*</em>", input("issue-date", inv.issueDate, 'type="date" required')) +
      field("Due date <em>*</em>", input("due-date", inv.dueDate, 'type="date" required')) +
      field("Reference / PO", input("reference", inv.reference, 'placeholder="Optional"')) +
      field("Currency", input("currency", inv.currency, 'list="currency-codes" maxlength="3" autocapitalize="characters" class="input-upper"')) +
      "</div>" + currencyDatalist() + "</section>" +
      '<section class="card"><h2 class="card-title">Items</h2>' +
      '<div class="table-wrap"><table class="items-editor"><thead><tr><th>Description</th><th class="col-qty">Qty</th><th class="col-price">Unit price</th><th class="num col-amount">Amount</th><th class="col-remove"><span class="visually-hidden">Remove</span></th></tr></thead>' +
      '<tbody data-item-rows>' + inv.items.map(itemRowHtml).join("") + "</tbody></table></div>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="add-item">+ Add item</button>' +
      "</section>" +
      '<section class="card"><h2 class="card-title">Discount &amp; ' + esc(taxLabel) + '</h2><div class="form-grid form-grid-4">' +
      field("Discount", select("discount-type", [["none", "None"], ["percent", "Percentage (%)"], ["fixed", "Fixed amount"]], inv.discount.type)) +
      field("Discount value", input("discount-value", discountValue, 'inputmode="decimal" placeholder="0"' + (inv.discount.type === "none" ? " disabled" : ""))) +
      field(esc(taxLabel), select("tax-mode", [["exclusive", "Add " + taxLabel + " on top"], ["inclusive", "Prices include " + taxLabel], ["none", "No " + taxLabel]], inv.taxMode)) +
      field(esc(taxLabel) + " rate (%)", input("tax-rate", formatQty(inv.taxRate), 'type="number" min="0" max="100" step="0.01" inputmode="decimal"' + (inv.taxMode === "none" ? " disabled" : ""))) +
      "</div></section>" +
      '<section class="card"><h2 class="card-title">Notes &amp; terms</h2>' +
      field("Payment details (shown on the invoice)", textarea("payment-instructions", inv.paymentInstructions, 3)) +
      field("Notes", textarea("notes", inv.notes, 2)) +
      field("Terms", textarea("terms", inv.terms, 2)) +
      "</section>" +
      "</div>" +
      '<aside class="editor-side"><div class="card totals-card"><h2 class="card-title">Summary</h2>' +
      '<dl class="totals">' +
      '<div><dt>Subtotal</dt><dd data-total="subtotal"></dd></div>' +
      '<div data-total-row="discount" hidden><dt>Discount</dt><dd data-total="discount"></dd></div>' +
      '<div data-total-row="tax" hidden><dt data-total="tax-label"></dt><dd data-total="tax"></dd></div>' +
      '<div class="grand"><dt>Total</dt><dd data-total="total"></dd></div>' +
      "</dl>" +
      '<div class="form-errors" data-errors hidden role="alert"></div>' +
      '<button type="submit" class="btn btn-primary btn-block">' + (mode === "edit" ? "Save changes" : "Save invoice") + "</button>" +
      '<a class="btn btn-ghost btn-block" href="' + (mode === "edit" ? "#/invoices/" + esc(inv.id) : "#/invoices") + '">Cancel</a>' +
      '<p class="hint">You can print or save the PDF after saving.</p>' +
      "</div></aside></div></form>"
    );
  }

  function viewSettings(ui) {
    var s = ui.store.getSettings();
    var b = s.business;
    var summary = ui.store.summary();
    var nextInvoice = formatNumber(s.invoicePrefix, s.nextInvoiceNumber, s.numberPadding);
    var nextReceipt = formatNumber(s.receiptPrefix, s.nextReceiptNumber, s.numberPadding);
    return (
      '<section class="page">' +
      pageHead("Settings", "Business details, tax, numbering and defaults used on every invoice and receipt.") +
      '<form class="settings" data-form="settings" novalidate><div class="settings-grid">' +
      '<section class="card"><h2 class="card-title">Your business</h2>' +
      '<div class="logo-field"><div class="logo-preview" data-logo-preview>' +
      (b.logo ? '<img src="' + esc(b.logo) + '" alt="Business logo">' : '<span class="muted">No logo</span>') +
      "</div><div>" +
      '<label class="btn btn-ghost btn-sm btn-file">Upload logo<input type="file" class="visually-hidden" accept="image/png,image/jpeg,image/webp,image/svg+xml" data-action-change="logo-upload"></label> ' +
      (b.logo ? '<button type="button" class="btn btn-ghost btn-sm" data-action="logo-remove">Remove</button>' : "") +
      '<p class="hint">PNG or JPG. Shown at the top of invoices and receipts.</p>' +
      '<input type="hidden" name="logo" value="' + esc(b.logo) + '">' +
      "</div></div>" +
      '<div class="form-grid">' +
      field("Business name <em>*</em>", input("business-name", b.name, "required"), "field-wide") +
      field("Tagline", input("business-tagline", b.tagline, 'placeholder="Optional"'), "field-wide") +
      field("Phone", input("business-phone", b.phone, 'type="tel"')) +
      field("Email", input("business-email", b.email, 'type="email"')) +
      field("Website", input("business-website", b.website, 'placeholder="Optional"')) +
      field("KRA PIN", input("business-kra-pin", b.kraPin, 'placeholder="e.g. P051234567X"')) +
      field("Address", textarea("business-address", b.address, 2), "field-wide") +
      "</div></section>" +
      '<section class="card"><h2 class="card-title">Tax &amp; currency</h2><div class="form-grid">' +
      field("Currency code", input("currency", s.currency, 'list="currency-codes" maxlength="3" class="input-upper" required')) +
      field("Tax label", input("tax-label", s.taxLabel, 'placeholder="VAT"')) +
      field("Default tax rate (%)", input("tax-rate", formatQty(s.taxRate), 'type="number" min="0" max="100" step="0.01"')) +
      field("Default tax treatment", select("tax-mode", [["exclusive", "Add tax on top of prices"], ["inclusive", "Prices include tax"], ["none", "No tax"]], s.taxMode)) +
      "</div>" + currencyDatalist() +
      '<p class="hint">Kenya’s standard VAT rate is 16%. Set the rate to 0 or choose “No tax” if you are not VAT registered.</p>' +
      "</section>" +
      '<section class="card"><h2 class="card-title">Numbering &amp; due dates</h2><div class="form-grid">' +
      field("Invoice prefix", input("invoice-prefix", s.invoicePrefix, "")) +
      field("Next invoice number", input("next-invoice-number", s.nextInvoiceNumber, 'type="number" min="1" step="1"')) +
      field("Receipt prefix", input("receipt-prefix", s.receiptPrefix, "")) +
      field("Next receipt number", input("next-receipt-number", s.nextReceiptNumber, 'type="number" min="1" step="1"')) +
      field("Number padding (digits)", input("number-padding", s.numberPadding, 'type="number" min="1" max="8" step="1"')) +
      field("Default payment terms (days)", input("due-days", s.dueDays, 'type="number" min="0" max="365" step="1"')) +
      "</div>" +
      '<p class="hint">Next: <strong>' + esc(nextInvoice) + "</strong> and <strong>" + esc(nextReceipt) + "</strong>.</p>" +
      "</section>" +
      '<section class="card"><h2 class="card-title">Defaults for new invoices</h2>' +
      field("Payment details", textarea("payment-instructions", s.paymentInstructions, 3)) +
      field("Notes", textarea("default-notes", s.defaultNotes, 2)) +
      field("Terms", textarea("default-terms", s.defaultTerms, 2)) +
      "</section>" +
      "</div>" +
      '<div class="form-errors" data-errors hidden role="alert"></div>' +
      '<div class="form-actions"><button type="submit" class="btn btn-primary">Save settings</button></div>' +
      "</form>" +
      '<section class="card backup-card"><h2 class="card-title">Backup &amp; data</h2>' +
      "<p>Your data is stored only in this browser on this device — " + summary.invoices + " invoice" + (summary.invoices === 1 ? "" : "s") + ", " + summary.receipts + " receipt" + (summary.receipts === 1 ? "" : "s") + " and " + summary.clients + " client" + (summary.clients === 1 ? "" : "s") + ". Clearing browser data or switching devices will not carry it over, so download a backup regularly.</p>" +
      '<p class="hint">Last backup: <strong>' + (s.lastBackupAt ? esc(new Date(s.lastBackupAt).toLocaleString("en-GB")) : "never") + "</strong></p>" +
      '<div class="btn-row">' +
      '<button type="button" class="btn btn-primary" data-action="export-json">Download backup (JSON)</button>' +
      '<label class="btn btn-ghost btn-file">Restore from backup<input type="file" class="visually-hidden" accept="application/json,.json" data-action-change="import-json"></label>' +
      '<button type="button" class="btn btn-ghost" data-action="export-csv">Export invoices (CSV)</button>' +
      "</div>" +
      '<details class="danger-zone"><summary>Danger zone</summary><p>Permanently delete all invoices, receipts, clients and settings from this browser.</p>' +
      '<button type="button" class="btn btn-danger" data-action="clear-all">Delete all data</button></details>' +
      "</section></section>"
    );
  }

  /* ------------------------------------------------------------------ */
  /* UI runtime                                                          */
  /* ------------------------------------------------------------------ */

  function memoryStorage() {
    var mem = {};
    return {
      getItem: function (key) { return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null; },
      setItem: function (key, value) { mem[key] = String(value); },
      removeItem: function (key) { delete mem[key]; },
    };
  }

  function pickStorage(win) {
    try {
      var s = win.localStorage;
      var probe = "__rekonet_invoicing_probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
      return { storage: s, persistent: true };
    } catch (e) {
      return { storage: memoryStorage(), persistent: false };
    }
  }

  function toast(ui, message, type, duration) {
    var region = ui.doc.getElementById("toast-region");
    if (!region) return;
    var el = ui.doc.createElement("div");
    el.className = "toast" + (type ? " toast-" + type : "");
    el.textContent = message;
    region.appendChild(el);
    ui.win.setTimeout(function () {
      el.classList.add("toast-hide");
      ui.win.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, duration || 4000);
  }

  function openDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === "function") {
      try {
        if (!dlg.open) dlg.showModal();
        return;
      } catch (e) {
        /* fall through to attribute fallback */
      }
    }
    dlg.setAttribute("open", "");
  }

  function closeDialog(ui, dlg) {
    if (!dlg) return;
    if (typeof dlg.close === "function") {
      try {
        if (dlg.open) dlg.close();
        return;
      } catch (e) {
        /* fall through */
      }
    }
    dlg.removeAttribute("open");
    if (dlg.id === "confirm-dialog") resolveConfirm(ui, false);
  }

  function resolveConfirm(ui, value) {
    var resolver = ui.confirmResolver;
    ui.confirmResolver = null;
    if (resolver) resolver(value);
  }

  function confirmAction(ui, opts) {
    var dlg = ui.doc.getElementById("confirm-dialog");
    if (!dlg) return Promise.resolve(false);
    dlg.querySelector("[data-confirm-title]").textContent = opts.title;
    dlg.querySelector("[data-confirm-message]").textContent = opts.message;
    var okBtn = dlg.querySelector("[data-dialog-confirm]");
    okBtn.textContent = opts.confirmLabel || "Confirm";
    okBtn.classList.toggle("btn-danger", !!opts.danger);
    okBtn.classList.toggle("btn-primary", !opts.danger);
    return new Promise(function (resolve) {
      resolveConfirm(ui, false);
      ui.confirmResolver = resolve;
      openDialog(dlg);
    });
  }

  function showErrors(container, errors) {
    if (!container) return;
    if (!errors || !errors.length) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }
    container.hidden = false;
    container.innerHTML = "<ul>" + errors.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>";
  }

  function download(ui, filename, text, mime) {
    try {
      var blob = new ui.win.Blob([text], { type: mime });
      var url = ui.win.URL.createObjectURL(blob);
      var a = ui.doc.createElement("a");
      a.href = url;
      a.download = filename;
      ui.doc.body.appendChild(a);
      a.click();
      a.remove();
      ui.win.setTimeout(function () {
        ui.win.URL.revokeObjectURL(url);
      }, 1000);
      return true;
    } catch (e) {
      toast(ui, "Your browser blocked the download.", "error");
      return false;
    }
  }

  function updateNav(ui, route) {
    var section = route.name.split("-")[0];
    if (section === "invoice") section = "invoices";
    if (section === "receipt") section = "receipts";
    ui.doc.querySelectorAll("[data-nav]").forEach(function (link) {
      var active = link.getAttribute("data-nav") === section;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function render(ui) {
    var hash = ui.win.location.hash || "#/invoices";
    var route = parseRoute(hash);
    var changed = hash !== ui.lastHash;
    ui.route = route;
    ui.lastHash = hash;
    var html = "";
    var title = "Invoicing";
    var result;
    switch (route.name) {
      case "invoices":
        html = viewInvoices(ui);
        title = "Invoices";
        break;
      case "invoice-new":
      case "invoice-edit":
      case "invoice-duplicate":
        html = viewEditor(ui, route);
        title = route.name === "invoice-edit" ? "Edit invoice" : "New invoice";
        break;
      case "invoice-view":
        result = viewInvoice(ui, route.id);
        html = result.html;
        title = result.title;
        break;
      case "receipts":
        html = viewReceipts(ui);
        title = "Receipts";
        break;
      case "receipt-view":
        result = viewReceipt(ui, route.id);
        html = result.html;
        title = result.title;
        break;
      case "clients":
        html = viewClients(ui);
        title = "Clients";
        break;
      case "settings":
        html = viewSettings(ui);
        title = "Settings";
        break;
      default:
        html = viewNotFound();
        title = "Not found";
    }
    ui.app.innerHTML = html;
    ui.doc.title = title + " · Rekonet Invoicing";
    updateNav(ui, route);
    var editor = ui.app.querySelector('form[data-form="invoice"]');
    if (editor) refreshEditorTotals(ui, editor);
    if (changed) {
      var heading = ui.app.querySelector("h1");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        try {
          heading.focus({ preventScroll: true });
        } catch (e) {
          /* ignore */
        }
      }
      try {
        ui.win.scrollTo(0, 0);
      } catch (e) {
        /* jsdom */
      }
    }
  }

  /* ---- editor helpers ---- */

  function readEditorForm(ui, form) {
    var el = form.elements;
    var val = function (name) {
      return el[name] ? String(el[name].value || "") : "";
    };
    var items = [];
    form.querySelectorAll(".item-row").forEach(function (row) {
      var description = row.querySelector('[name="item-description"]').value.trim();
      var qtyRaw = row.querySelector('[name="item-qty"]').value;
      var priceRaw = row.querySelector('[name="item-price"]').value;
      if (!description && !priceRaw.trim()) return; // ignore blank rows
      items.push({
        description: description,
        qty: qtyRaw === "" ? 1 : Number(qtyRaw),
        unitPrice: priceRaw.trim() === "" ? 0 : money.toCents(priceRaw),
      });
    });
    var discountType = val("discount-type") || "none";
    var discountRaw = val("discount-value").trim();
    var discountValue = 0;
    if (discountType === "percent") discountValue = discountRaw === "" ? 0 : Number(discountRaw.replace(/%/g, ""));
    if (discountType === "fixed") discountValue = discountRaw === "" ? 0 : money.toCents(discountRaw);
    return {
      id: form.getAttribute("data-invoice-id") || "",
      clientId: val("client-id"),
      client: {
        name: val("client-name").trim(),
        phone: val("client-phone").trim(),
        email: val("client-email").trim(),
        address: val("client-address").trim(),
        kraPin: val("client-kra-pin").trim().toUpperCase(),
      },
      issueDate: val("issue-date"),
      dueDate: val("due-date"),
      reference: val("reference").trim(),
      currency: (val("currency").trim().toUpperCase() || ui.store.getSettings().currency),
      items: items,
      discount: { type: discountType, value: discountValue },
      taxMode: val("tax-mode") || "exclusive",
      taxRate: val("tax-rate") === "" ? 0 : Number(val("tax-rate")),
      notes: val("notes"),
      terms: val("terms"),
      paymentInstructions: val("payment-instructions"),
    };
  }

  function validateInvoice(draft) {
    var errors = [];
    if (!draft.client.name) errors.push("Enter the client’s name.");
    if (!parseIso(draft.issueDate)) errors.push("Enter a valid invoice date.");
    if (!parseIso(draft.dueDate)) errors.push("Enter a valid due date.");
    if (parseIso(draft.issueDate) && parseIso(draft.dueDate) && draft.dueDate < draft.issueDate) {
      errors.push("The due date cannot be before the invoice date.");
    }
    if (!/^[A-Z]{3}$/.test(draft.currency)) errors.push("Currency must be a 3-letter code such as KES.");
    if (!draft.items.length) errors.push("Add at least one line item.");
    draft.items.forEach(function (item, i) {
      var label = "Item " + (i + 1);
      if (!item.description) errors.push(label + ": add a description.");
      if (!(item.qty > 0)) errors.push(label + ": quantity must be more than zero.");
      if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) errors.push(label + ": enter a valid unit price.");
    });
    if (draft.discount.type === "percent" && !(draft.discount.value >= 0 && draft.discount.value <= 100)) {
      errors.push("Discount percentage must be between 0 and 100.");
    }
    if (draft.discount.type === "fixed" && !(Number.isFinite(draft.discount.value) && draft.discount.value >= 0)) {
      errors.push("Enter a valid discount amount.");
    }
    if (draft.taxMode !== "none" && !(draft.taxRate >= 0 && draft.taxRate <= 100)) {
      errors.push("Tax rate must be between 0 and 100.");
    }
    return errors;
  }

  function refreshEditorTotals(ui, form) {
    var draft = readEditorForm(ui, form);
    var settings = ui.store.getSettings();
    var cur = /^[A-Z]{3}$/.test(draft.currency) ? draft.currency : settings.currency;
    var preview = Object.assign({}, draft, {
      items: draft.items.map(function (item) {
        return { description: item.description, qty: item.qty, unitPrice: Number.isFinite(item.unitPrice) ? item.unitPrice : 0 };
      }),
      discount: { type: draft.discount.type, value: Number.isFinite(draft.discount.value) ? draft.discount.value : 0 },
    });
    var totals = computeTotals(preview);

    form.querySelectorAll(".item-row").forEach(function (row) {
      var qty = Number(row.querySelector('[name="item-qty"]').value);
      var price = money.toCents(row.querySelector('[name="item-price"]').value);
      var amount = Number.isFinite(price) ? lineTotal({ qty: qty === 0 && row.querySelector('[name="item-qty"]').value === "" ? 1 : qty, unitPrice: price }) : 0;
      row.querySelector("[data-item-amount]").textContent = money.format(amount);
    });

    var set = function (key, text) {
      var node = form.querySelector('[data-total="' + key + '"]');
      if (node) node.textContent = text;
    };
    set("subtotal", money.format(totals.subtotal, cur));
    set("discount", "-" + money.format(totals.discount, cur));
    set("total", money.format(totals.total, cur));
    var taxLabel = settings.taxLabel || "VAT";
    var taxRow = form.querySelector('[data-total-row="tax"]');
    if (taxRow) {
      taxRow.hidden = !(totals.rate > 0 && totals.mode !== "none");
      set("tax-label", (totals.mode === "inclusive" ? "Includes " : "") + taxLabel + " " + formatQty(totals.rate) + "%");
      set("tax", money.format(totals.tax, cur));
    }
    var discountRow = form.querySelector('[data-total-row="discount"]');
    if (discountRow) discountRow.hidden = !(totals.discount > 0);

    var discountInput = form.elements["discount-value"];
    if (discountInput) discountInput.disabled = draft.discount.type === "none";
    var rateInput = form.elements["tax-rate"];
    if (rateInput) rateInput.disabled = draft.taxMode === "none";
  }

  function addItemRow(ui, form) {
    var body = form.querySelector("[data-item-rows]");
    var tmp = ui.doc.createElement("tbody");
    tmp.innerHTML = itemRowHtml(null);
    var row = tmp.firstElementChild;
    body.appendChild(row);
    var first = row.querySelector('[name="item-description"]');
    if (first) first.focus();
  }

  function removeItemRow(ui, form, button) {
    var row = closest(button, ".item-row");
    var body = form.querySelector("[data-item-rows]");
    if (!row || !body) return;
    if (body.querySelectorAll(".item-row").length <= 1) {
      row.querySelectorAll("input").forEach(function (inputEl) {
        inputEl.value = inputEl.name === "item-qty" ? "1" : "";
      });
    } else {
      row.remove();
    }
    refreshEditorTotals(ui, form);
  }

  function autofillClient(ui, form) {
    var name = form.elements["client-name"].value;
    var client = ui.store.findClientByName(name);
    if (!client) {
      form.elements["client-id"].value = "";
      return;
    }
    form.elements["client-id"].value = client.id;
    var map = { "client-phone": client.phone, "client-email": client.email, "client-address": client.address, "client-kra-pin": client.kraPin };
    Object.keys(map).forEach(function (key) {
      var el = form.elements[key];
      if (el && !el.value.trim() && map[key]) el.value = map[key];
    });
  }

  function submitInvoice(ui, form) {
    var draft = readEditorForm(ui, form);
    var errors = validateInvoice(draft);
    var errorBox = form.querySelector("[data-errors]");
    showErrors(errorBox, errors);
    if (errors.length) {
      if (errorBox) errorBox.scrollIntoView({ block: "nearest" });
      return;
    }
    try {
      var saved = ui.store.saveInvoice(draft);
      toast(ui, "Invoice " + saved.number + " saved.", "success");
      ui.win.location.hash = "#/invoices/" + saved.id;
    } catch (e) {
      showErrors(errorBox, [e.message || "Could not save the invoice."]);
    }
  }

  /* ---- payment dialog ---- */

  function openPaymentDialog(ui, invoiceId) {
    var inv = ui.store.getInvoice(invoiceId);
    if (!inv) return;
    var totals = computeTotals(inv);
    var dlg = ui.doc.getElementById("payment-dialog");
    var form = dlg.querySelector("form");
    form.reset();
    form.elements["invoice-id"].value = inv.id;
    form.elements.amount.value = money.plain(Math.max(totals.balance, 0));
    form.elements.date.value = ui.store.today();
    form.elements.method.value = "M-Pesa";
    dlg.querySelector("[data-payment-summary]").textContent =
      inv.number + " · " + inv.client.name + " · Balance due " + money.format(totals.balance, inv.currency);
    dlg.querySelector("[data-payment-currency]").textContent = inv.currency;
    showErrors(dlg.querySelector("[data-errors]"), []);
    openDialog(dlg);
    try {
      form.elements.amount.focus();
      form.elements.amount.select();
    } catch (e) {
      /* ignore */
    }
  }

  function submitPayment(ui, form) {
    var el = form.elements;
    var errorBox = form.querySelector("[data-errors]");
    var amount = money.toCents(el.amount.value);
    var errors = [];
    if (!Number.isFinite(amount) || amount <= 0) errors.push("Enter the amount received.");
    if (!parseIso(el.date.value)) errors.push("Enter the payment date.");
    showErrors(errorBox, errors);
    if (errors.length) return;
    try {
      var payment = ui.store.recordPayment(el["invoice-id"].value, {
        amount: amount,
        date: el.date.value,
        method: el.method.value,
        reference: el.reference.value,
        note: el.note.value,
      });
      closeDialog(ui, closest(form, "dialog"));
      toast(ui, "Payment recorded — receipt " + payment.receiptNumber + " created.", "success");
      ui.win.location.hash = "#/receipts/" + payment.id;
    } catch (e) {
      showErrors(errorBox, [e.message || "Could not record the payment."]);
    }
  }

  /* ---- client dialog ---- */

  function openClientDialog(ui, clientId) {
    var dlg = ui.doc.getElementById("client-dialog");
    var form = dlg.querySelector("form");
    form.reset();
    var client = clientId ? ui.store.getClient(clientId) : null;
    form.elements["client-id"].value = client ? client.id : "";
    form.elements["client-name"].value = client ? client.name : "";
    form.elements["client-phone"].value = client ? client.phone : "";
    form.elements["client-email"].value = client ? client.email : "";
    form.elements["client-address"].value = client ? client.address : "";
    form.elements["client-kra-pin"].value = client ? client.kraPin : "";
    dlg.querySelector("[data-client-title]").textContent = client ? "Edit client" : "New client";
    showErrors(dlg.querySelector("[data-errors]"), []);
    openDialog(dlg);
    try {
      form.elements["client-name"].focus();
    } catch (e) {
      /* ignore */
    }
  }

  function submitClient(ui, form) {
    var el = form.elements;
    var errorBox = form.querySelector("[data-errors]");
    var name = el["client-name"].value.trim();
    if (!name) {
      showErrors(errorBox, ["Enter the client’s name."]);
      return;
    }
    try {
      ui.store.saveClient({
        id: el["client-id"].value || undefined,
        name: name,
        phone: el["client-phone"].value.trim(),
        email: el["client-email"].value.trim(),
        address: el["client-address"].value.trim(),
        kraPin: el["client-kra-pin"].value.trim().toUpperCase(),
      });
      closeDialog(ui, closest(form, "dialog"));
      toast(ui, "Client saved.", "success");
      render(ui);
    } catch (e) {
      showErrors(errorBox, [e.message || "Could not save the client."]);
    }
  }

  /* ---- settings ---- */

  function submitSettings(ui, form) {
    var el = form.elements;
    var v = function (name) {
      return el[name] ? String(el[name].value || "") : "";
    };
    var errors = [];
    if (!v("business-name").trim()) errors.push("Enter your business name.");
    if (!/^[A-Za-z]{3}$/.test(v("currency").trim())) errors.push("Currency must be a 3-letter code such as KES.");
    var rate = Number(v("tax-rate"));
    if (!(rate >= 0 && rate <= 100)) errors.push("Tax rate must be between 0 and 100.");
    if (!(parseInt(v("next-invoice-number"), 10) >= 1)) errors.push("Next invoice number must be 1 or more.");
    if (!(parseInt(v("next-receipt-number"), 10) >= 1)) errors.push("Next receipt number must be 1 or more.");
    var errorBox = form.querySelector("[data-errors]");
    showErrors(errorBox, errors);
    if (errors.length) return;
    var ok;
    try {
      ok = ui.store.saveSettings({
      business: {
        name: v("business-name").trim(),
        tagline: v("business-tagline").trim(),
        phone: v("business-phone").trim(),
        email: v("business-email").trim(),
        website: v("business-website").trim(),
        kraPin: v("business-kra-pin").trim().toUpperCase(),
        address: v("business-address").trim(),
        logo: v("logo"),
      },
      currency: v("currency").trim().toUpperCase(),
      taxLabel: v("tax-label").trim() || "VAT",
      taxRate: rate,
      taxMode: v("tax-mode"),
      invoicePrefix: v("invoice-prefix"),
      nextInvoiceNumber: parseInt(v("next-invoice-number"), 10),
      receiptPrefix: v("receipt-prefix"),
      nextReceiptNumber: parseInt(v("next-receipt-number"), 10),
      numberPadding: parseInt(v("number-padding"), 10),
      dueDays: parseInt(v("due-days"), 10),
      paymentInstructions: v("payment-instructions"),
      defaultNotes: v("default-notes"),
      defaultTerms: v("default-terms"),
      });
    } catch (e) {
      showErrors(errorBox, [e.message || "Could not save settings."]);
      return;
    }
    if (!ok) {
      toast(ui, "Settings could not be saved — browser storage may be full. Try a smaller logo.", "error", 7000);
      return;
    }
    toast(ui, "Settings saved.", "success");
    render(ui);
  }

  function resizeImage(ui, dataUrl, maxW, maxH) {
    return new Promise(function (resolve, reject) {
      if (dataUrl.indexOf("data:image/svg") === 0) {
        resolve(dataUrl);
        return;
      }
      var img = new ui.win.Image();
      img.onload = function () {
        try {
          var scale = Math.min(1, maxW / img.width, maxH / img.height);
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var canvas = ui.doc.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  function handleLogoUpload(ui, fileInput) {
    var file = fileInput.files && fileInput.files[0];
    var form = closest(fileInput, "form");
    if (!file || !form) return;
    if (file.size > 4 * 1024 * 1024) {
      toast(ui, "Please choose an image under 4 MB.", "error");
      return;
    }
    var reader = new ui.win.FileReader();
    reader.onload = function () {
      resizeImage(ui, String(reader.result), 600, 240)
        .then(function (dataUrl) {
          if (dataUrl.length > 700000) {
            toast(ui, "That image is too large to store. Try a smaller PNG or JPG.", "error", 6000);
            return;
          }
          form.elements.logo.value = dataUrl;
          var preview = form.querySelector("[data-logo-preview]");
          if (preview) preview.innerHTML = '<img src="' + esc(dataUrl) + '" alt="Business logo">';
          toast(ui, "Logo added — click Save settings to keep it.");
        })
        .catch(function () {
          toast(ui, "That file could not be read as an image.", "error");
        });
    };
    reader.onerror = function () {
      toast(ui, "That file could not be read.", "error");
    };
    reader.readAsDataURL(file);
    fileInput.value = "";
  }

  function handleImport(ui, fileInput) {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    var reader = new ui.win.FileReader();
    reader.onload = function () {
      var text = String(reader.result || "");
      confirmAction(ui, {
        title: "Restore from backup?",
        message: "This replaces everything currently stored in this browser with the contents of “" + file.name + "”. Download a backup first if you want to keep the current data.",
        confirmLabel: "Replace and restore",
        danger: true,
      }).then(function (ok) {
        if (!ok) return;
        try {
          var summary = ui.store.importJson(text);
          toast(ui, "Restored " + summary.invoices + " invoices, " + summary.receipts + " receipts and " + summary.clients + " clients.", "success", 6000);
          ui.win.location.hash = "#/invoices";
          render(ui);
        } catch (e) {
          toast(ui, e.message || "The backup could not be restored.", "error", 7000);
        }
      });
    };
    reader.readAsText(file);
    fileInput.value = "";
  }

  /* ---- actions ---- */

  function runAction(ui, action, button) {
    var id = button.getAttribute("data-id");
    var form = closest(button, "form");
    switch (action) {
      case "add-item":
        if (form) addItemRow(ui, form);
        break;
      case "remove-item":
        if (form) removeItemRow(ui, form, button);
        break;
      case "print":
        try {
          ui.win.print();
        } catch (e) {
          toast(ui, "Printing is not available in this browser.", "error");
        }
        break;
      case "record-payment":
        openPaymentDialog(ui, id);
        break;
      case "void-invoice":
        confirmAction(ui, {
          title: "Void this invoice?",
          message: "The invoice stays in your records marked as void and is excluded from totals. You can reopen it later.",
          confirmLabel: "Void invoice",
          danger: true,
        }).then(function (ok) {
          if (!ok) return;
          ui.store.setInvoiceStatus(id, "void");
          toast(ui, "Invoice voided.");
          render(ui);
        });
        break;
      case "reopen-invoice":
        ui.store.setInvoiceStatus(id, "open");
        toast(ui, "Invoice reopened.");
        render(ui);
        break;
      case "delete-invoice": {
        var inv = ui.store.getInvoice(id);
        if (!inv) return;
        confirmAction(ui, {
          title: "Delete " + inv.number + "?",
          message: inv.payments.length
            ? "This permanently deletes the invoice and its " + inv.payments.length + " receipt(s). Voiding is usually better for record keeping."
            : "This permanently deletes the invoice. Voiding is usually better for record keeping.",
          confirmLabel: "Delete permanently",
          danger: true,
        }).then(function (ok) {
          if (!ok) return;
          ui.store.deleteInvoice(id);
          toast(ui, "Invoice " + inv.number + " deleted.");
          ui.win.location.hash = "#/invoices";
          render(ui);
        });
        break;
      }
      case "delete-payment": {
        var paymentId = button.getAttribute("data-payment-id");
        var receipt = ui.store.getReceipt(paymentId);
        if (!receipt) return;
        confirmAction(ui, {
          title: "Delete receipt " + receipt.payment.receiptNumber + "?",
          message: "This removes the payment of " + money.format(receipt.payment.amount, receipt.invoice.currency) + " and its receipt. The invoice balance will increase accordingly.",
          confirmLabel: "Delete payment",
          danger: true,
        }).then(function (ok) {
          if (!ok) return;
          ui.store.deletePayment(id, paymentId);
          toast(ui, "Payment deleted.");
          render(ui);
        });
        break;
      }
      case "export-json": {
        var json = ui.store.exportJson();
        if (download(ui, "rekonet-invoicing-backup-" + ui.store.today() + ".json", json, "application/json")) {
          toast(ui, "Backup downloaded.", "success");
          render(ui);
        }
        break;
      }
      case "export-csv":
        download(ui, "rekonet-invoices-" + ui.store.today() + ".csv", "\ufeff" + ui.store.toCsv(), "text/csv;charset=utf-8");
        break;
      case "clear-all":
        confirmAction(ui, {
          title: "Delete all data?",
          message: "Every invoice, receipt, client and setting stored in this browser will be permanently deleted. Download a backup first if you might need them.",
          confirmLabel: "Delete everything",
          danger: true,
        }).then(function (ok) {
          if (!ok) return;
          ui.store.clearAll();
          toast(ui, "All data deleted.");
          ui.win.location.hash = "#/invoices";
          render(ui);
        });
        break;
      case "logo-remove":
        if (form) {
          form.elements.logo.value = "";
          var preview = form.querySelector("[data-logo-preview]");
          if (preview) preview.innerHTML = '<span class="muted">No logo</span>';
          toast(ui, "Logo removed — click Save settings to confirm.");
        }
        break;
      case "new-client":
        openClientDialog(ui, "");
        break;
      case "edit-client":
        openClientDialog(ui, id);
        break;
      case "delete-client": {
        var client = ui.store.getClient(id);
        if (!client) return;
        confirmAction(ui, {
          title: "Delete " + client.name + "?",
          message: "Existing invoices keep their own copy of the client details; only the saved contact is removed.",
          confirmLabel: "Delete client",
          danger: true,
        }).then(function (ok) {
          if (!ok) return;
          ui.store.deleteClient(id);
          toast(ui, "Client deleted.");
          render(ui);
        });
        break;
      }
      default:
        break;
    }
  }

  function bindEvents(ui) {
    var app = ui.app;
    var doc = ui.doc;

    app.addEventListener("click", function (e) {
      var actionEl = closest(e.target, "[data-action]");
      if (actionEl && app.contains(actionEl)) {
        e.preventDefault();
        runAction(ui, actionEl.getAttribute("data-action"), actionEl);
        return;
      }
      var row = closest(e.target, "tr[data-href]");
      if (row && !closest(e.target, "a, button, input, select, label")) {
        ui.win.location.hash = row.getAttribute("data-href");
      }
    });

    app.addEventListener("submit", function (e) {
      var form = closest(e.target, "form[data-form]");
      if (!form) return;
      e.preventDefault();
      var kind = form.getAttribute("data-form");
      if (kind === "invoice") submitInvoice(ui, form);
      if (kind === "settings") submitSettings(ui, form);
    });

    app.addEventListener("input", function (e) {
      var target = e.target;
      var editor = closest(target, 'form[data-form="invoice"]');
      if (editor) {
        refreshEditorTotals(ui, editor);
        return;
      }
      if (target && target.getAttribute && target.getAttribute("data-filter") === "q") {
        ui.filters.q = target.value;
        var body = app.querySelector("[data-invoice-rows]");
        if (body) body.innerHTML = invoiceRows(ui);
      }
    });

    app.addEventListener("change", function (e) {
      var target = e.target;
      if (!target || !target.getAttribute) return;
      var changeAction = target.getAttribute("data-action-change");
      if (changeAction === "logo-upload") {
        handleLogoUpload(ui, target);
        return;
      }
      if (changeAction === "import-json") {
        handleImport(ui, target);
        return;
      }
      if (target.getAttribute("data-filter") === "status") {
        ui.filters.status = target.value;
        var body = app.querySelector("[data-invoice-rows]");
        if (body) body.innerHTML = invoiceRows(ui);
        return;
      }
      var editor = closest(target, 'form[data-form="invoice"]');
      if (editor) {
        if (target.name === "client-name") autofillClient(ui, editor);
        refreshEditorTotals(ui, editor);
      }
    });

    doc.addEventListener("click", function (e) {
      var confirmBtn = closest(e.target, "[data-dialog-confirm]");
      if (confirmBtn) {
        resolveConfirm(ui, true);
        closeDialog(ui, closest(confirmBtn, "dialog"));
        return;
      }
      var cancelBtn = closest(e.target, "[data-dialog-cancel]");
      if (cancelBtn) closeDialog(ui, closest(cancelBtn, "dialog"));
    });

    doc.querySelectorAll("dialog").forEach(function (dlg) {
      var form = dlg.querySelector("form[data-form]");
      if (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var kind = form.getAttribute("data-form");
          if (kind === "payment") submitPayment(ui, form);
          if (kind === "client") submitClient(ui, form);
        });
      }
      dlg.addEventListener("close", function () {
        if (dlg.id === "confirm-dialog") resolveConfirm(ui, false);
      });
      dlg.addEventListener("click", function (e) {
        if (e.target === dlg) closeDialog(ui, dlg);
      });
    });
  }

  function boot(doc) {
    var win = doc.defaultView || root;
    var picked = pickStorage(win);
    var ui = null;
    var store = createStore(picked.storage, {
      onPersistError: function () {
        if (ui) toast(ui, "Could not save to browser storage — it may be full. Download a backup and remove the logo or old invoices.", "error", 8000);
      },
    });
    ui = {
      doc: doc,
      win: win,
      store: store,
      app: doc.getElementById("invoicing-app"),
      route: null,
      lastHash: null,
      filters: { q: "", status: "all" },
      confirmResolver: null,
    };
    bindEvents(ui);
    win.addEventListener("hashchange", function () {
      render(ui);
    });
    render(ui);
    if (!picked.persistent) {
      toast(ui, "Browser storage is unavailable, so nothing will be saved when you leave this page.", "error", 10000);
    }
    win.__rekonetInvoicingUi = ui;
    return ui;
  }

  return {
    VERSION: VERSION,
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    PAYMENT_METHODS: PAYMENT_METHODS,
    CURRENCIES: CURRENCIES,
    money: money,
    lineTotal: lineTotal,
    computeTotals: computeTotals,
    computeStats: computeStats,
    deriveStatus: deriveStatus,
    statusLabel: statusLabel,
    formatNumber: formatNumber,
    amountInWords: amountInWords,
    integerToWords: integerToWords,
    toWhatsAppNumber: toWhatsAppNumber,
    parseRoute: parseRoute,
    formatDate: formatDate,
    addDays: addDays,
    daysBetween: daysBetween,
    invoiceShareText: invoiceShareText,
    receiptShareText: receiptShareText,
    createStore: createStore,
    memoryStorage: memoryStorage,
    boot: boot,
    render: render,
  };
});
