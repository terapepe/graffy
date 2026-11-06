/* GRAFFY — shared helpers */
(function () {
  const SCALE = 18n;
  const TEN = 10n;

  const U = {
    $: (s, el = document) => el.querySelector(s),
    $$: (s, el = document) => [...el.querySelectorAll(s)],

    esc(v) {
      return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },

    isSet(v) { return v !== null && v !== undefined && v !== ""; },

    /** Decimal token string -> BigInt with 18 fractional digits. */
    toUnits(v) {
      if (!U.isSet(v)) return null;
      const s = String(v).trim();
      if (!/^\d+(\.\d+)?$/.test(s)) return null;
      const [i, f = ""] = s.split(".");
      return BigInt(i) * TEN ** SCALE + BigInt((f + "0".repeat(18)).slice(0, 18));
    },
    fromUnits(b, maxFrac = 2) {
      if (b === null || b === undefined) return null;
      const neg = b < 0n; if (neg) b = -b;
      const i = b / TEN ** SCALE;
      let f = (b % TEN ** SCALE).toString().padStart(18, "0").slice(0, maxFrac).replace(/0+$/, "");
      return (neg ? "-" : "") + i.toString() + (f ? "." + f : "");
    },

    /** Format a decimal token string with thousands separators. */
    fmtToken(v, maxFrac = 2) {
      if (!U.isSet(v)) return "—";
      const u = U.toUnits(v);
      if (u === null) return U.esc(v);
      const s = U.fromUnits(u, maxFrac);
      const [i, f] = s.split(".");
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (f ? "." + f : "");
    },

    fmtCompact(v) {
      const n = Number(v);
      if (!isFinite(n)) return "—";
      return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
    },

    fmtInt(v) {
      if (!U.isSet(v)) return "—";
      const n = Number(v);
      return isFinite(n) ? n.toLocaleString("en-US") : U.esc(v);
    },

    /** Split a token amount by percentage (integer basis points). */
    share(total, bps) {
      const u = U.toUnits(total);
      if (u === null) return null;
      return U.fromUnits((u * BigInt(bps)) / 10000n, 6);
    },

    /** USD reference (display only). price = USD per 1 token. */
    usd(amount, price) {
      if (!U.isSet(amount) || !U.isSet(price)) return "";
      const n = Number(amount) * Number(price);
      if (!isFinite(n)) return "";
      const digits = n < 1 ? 4 : 2;
      return "~$" + n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: n < 1 ? 2 : 0 });
    },

    short(a, l = 6, r = 4) {
      if (!a) return "";
      return a.length > l + r + 3 ? a.slice(0, l) + "…" + a.slice(-r) : a;
    },

    fmtDate(v) {
      if (!v) return "—";
      const d = new Date(v);
      return isNaN(d) ? U.esc(v) : d.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    },

    timeLeft(end) {
      const t = new Date(end).getTime() - Date.now();
      if (!isFinite(t)) return null;
      const s = Math.max(0, Math.floor(t / 1000));
      return { total: s, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    },

    pad(n) { return String(n).padStart(2, "0"); },

    toast(msg, ms = 2200) {
      const t = U.$("#toast");
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(U._tt);
      U._tt = setTimeout(() => t.classList.remove("show"), ms);
    },

    async copy(text) {
      try { await navigator.clipboard.writeText(text); U.toast("Copied to clipboard"); }
      catch { U.toast("Copy failed"); }
    },

    medal(rank) {
      const c = { 1: ["#FFD23F", "#B8860B"], 2: ["#E4E9F2", "#8A93A6"], 3: ["#F0A06A", "#9B5427"] }[rank];
      if (!c) return "";
      return `<svg class="medal" viewBox="0 0 48 48" aria-label="Rank ${rank}">
        <path d="M14 2h8l4 14h-8z" fill="#FF2E88"/><path d="M34 2h-8l-4 14h8z" fill="#00E5FF"/>
        <circle cx="24" cy="30" r="15" fill="${c[0]}" stroke="${c[1]}" stroke-width="3"/>
        <circle cx="24" cy="30" r="10" fill="none" stroke="${c[1]}" stroke-width="1.5" stroke-dasharray="2 2"/>
        <text x="24" y="31" text-anchor="middle" dominant-baseline="central" font-family="Arial Black, Arial" font-weight="900" font-size="14" fill="#1a1a1a">${rank}</text>
      </svg>`;
    },

    emptyIcon() {
      return `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <rect x="22" y="6" width="20" height="10" rx="2"/><rect x="18" y="16" width="28" height="40" rx="6"/>
        <path d="M26 30h12M26 38h8"/><path d="M50 12l6-4M50 20h8M50 4l4 2"/></svg>`;
    },

    empty(title, text) {
      return `<div class="empty">${U.emptyIcon()}<div class="tagline">${U.esc(title)}</div><div>${U.esc(text)}</div></div>`;
    },

    statusClass(s) {
      const v = String(s || "").toLowerCase();
      if (["open", "active", "live", "distributed", "completed"].includes(v)) return "open";
      if (["closed", "ended", "failed"].includes(v)) return "closed";
      return "pending";
    },
  };

  window.U = U;
})();
