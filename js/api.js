/* GRAFFY — backend API client.
 * Every function returns { ok, data, error }. On failure the UI renders
 * empty states. No mock or demo data is ever produced here.
 */
(function () {
  const C = window.GRAFFY_CONFIG.api;
  const state = { online: null };

  function url(key, params = {}) {
    let p = C.endpoints[key];
    Object.entries(params).forEach(([k, v]) => { p = p.replace(`{${k}}`, encodeURIComponent(v)); });
    return C.baseUrl.replace(/\/$/, "") + p;
  }

  async function request(key, { params, query, method = "GET", body, headers } = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), C.timeoutMs);
    try {
      let u = url(key, params);
      if (query) {
        const q = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== ""));
        if ([...q].length) u += "?" + q;
      }
      const isForm = body instanceof FormData;
      const res = await fetch(u, {
        method, signal: ctrl.signal, credentials: "include",
        headers: isForm ? headers : { "Content-Type": "application/json", ...(headers || {}) },
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) throw new Error(`Unexpected response (${res.status})`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setOnline(true);
      return { ok: true, data: json.data !== undefined ? json.data : json };
    } catch (e) {
      if (method === "GET") setOnline(false);
      return { ok: false, error: e.name === "AbortError" ? "Request timed out" : e.message };
    } finally {
      clearTimeout(t);
    }
  }

  function setOnline(v) {
    if (state.online === v) return;
    state.online = v;
    const b = document.getElementById("apiBanner");
    if (b) b.hidden = v;
  }

  const LIVE = {
    currentSeason: () => request("currentSeason"),
    seasons: () => request("seasons"),
    season: (id) => request("season", { params: { id } }),
    leaderboard: (id, limit) => request("leaderboard", { params: { id }, query: { limit } }),
    artworks: (id, query) => request("artworks", { params: { id }, query }),
    transparency: (id) => request("transparency", { params: { id } }),
    submitArtwork: (form) => request("submitArtwork", { method: "POST", body: form }),
    saveSeason: (payload, sig) => request("adminSaveSeason", { method: "POST", body: payload, headers: sig }),
  };

  /* ---------- SEED mode: test data, every figure derived from vote records ---------- */
  const LS_KEY = "graffy.seed.seasons";
  let seedCache = null;
  const ok = (data) => ({ ok: true, data });
  const fail = (error) => ({ ok: false, error });

  async function seed() {
    if (seedCache) return seedCache;
    const res = await fetch(C.seedUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("Seed data not found");
    seedCache = await res.json();
    return seedCache;
  }
  function localSeasons() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }

  function status(s) {
    const now = Date.now(), st = new Date(s.startDate).getTime(), en = new Date(s.endDate).getTime();
    return now < st ? "scheduled" : now > en ? "closed" : "open";
  }

  function ranked(arts) {
    // Valid votes desc; tie -> earlier time of reaching that count wins.
    return [...arts].sort((a, b) => b.validVotes - a.validVotes || new Date(a.reachedAt) - new Date(b.reachedAt))
      .map((a, i) => ({ ...a, rank: i + 1 }));
  }

  function sumFees(votes) {
    const total = votes.reduce((t, v) => t + (U.toUnits(v.amount) || 0n), 0n);
    return U.fromUnits(total, 6);
  }

  async function allSeasons() {
    const d = await seed();
    const base = { ...d.season, artworks: d.artworks, votes: d.votes };
    return [base, ...localSeasons().map((s) => ({ ...s, artworks: [], votes: [] }))].map((s) => {
      const st = status(s);
      const arts = ranked(s.artworks);
      const winners = st === "closed" ? arts.slice(0, 3) : [];
      return {
        ...s,
        submissionStatus: st === "open" ? s.submissionStatus || "open" : st,
        votingStatus: st === "open" ? s.votingStatus || "open" : st,
        locked: st !== "scheduled",
        totalValidVotes: s.votes.length,
        totalPrizePool: sumFees(s.votes),
        totalArtworks: arts.length,
        totalArtists: new Set(arts.map((a) => a.wallet)).size,
        winners, _arts: arts,
      };
    });
  }
  const strip = (s) => { const { artworks, votes, _arts, ...rest } = s; return rest; };

  const SEED = {
    async currentSeason() {
      try {
        const all = await allSeasons();
        const cur = [...all].reverse().find((s) => status(s) === "open") || all[0];
        return ok(strip(cur));
      } catch (e) { return fail(e.message); }
    },
    async seasons() {
      try { return ok({ items: (await allSeasons()).reverse().map(strip) }); } catch (e) { return fail(e.message); }
    },
    async season(id) {
      const s = (await allSeasons()).find((x) => String(x.id) === String(id));
      return s ? ok(strip(s)) : fail("Season not found");
    },
    async leaderboard(id, limit) {
      const s = (await allSeasons()).find((x) => String(x.id) === String(id));
      return s ? ok({ items: s._arts.slice(0, limit || 100) }) : fail("Season not found");
    },
    async artworks(id, q = {}) {
      const s = (await allSeasons()).find((x) => String(x.id) === String(id));
      if (!s) return fail("Season not found");
      let items = s._arts;
      if (q.q) { const k = q.q.toLowerCase(); items = items.filter((a) => (a.title + " " + a.artist).toLowerCase().includes(k)); }
      if (q.sort === "newest") items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return ok({ items, total: items.length });
    },
    async transparency(id) {
      const s = (await allSeasons()).find((x) => String(x.id) === String(id));
      if (!s) return fail("Season not found");
      const title = Object.fromEntries(s.artworks.map((a) => [a.id, a.title]));
      return ok({
        totalPrizePool: s.totalPrizePool, prizeDistributionStatus: s.prizeDistributionStatus || "pending",
        feeReceiptsTotal: s.votes.length,
        feeReceipts: [...s.votes].reverse().map((v) => ({ ...v, artworkTitle: title[v.artworkId], txHash: null })),
        distributions: [],
      });
    },
    async submitArtwork() { return fail("Submissions require the live backend"); },
    async saveSeason(p) {
      try {
        const all = await allSeasons();
        const running = all.find((s) => status(s) === "open");
        if (running && new Date(p.startDate) < new Date(running.endDate))
          return fail(`"${running.name}" is running until ${U.fmtDate(running.endDate)}. New season must start after it ends.`);
        const list = localSeasons();
        const id = Math.max(...all.map((s) => Number(s.id))) + 1;
        list.push({ ...p, id, prizeDistributionStatus: "pending", createdBy: p.createdBy });
        localStorage.setItem(LS_KEY, JSON.stringify(list));
        return ok({ id });
      } catch (e) { return fail(e.message); }
    },
  };

  const SEED_MODE = C.mode === "seed";
  if (SEED_MODE) {
    const b = document.getElementById("apiBanner");
    if (b) {
      b.hidden = false;
      document.getElementById("apiBannerText").textContent = "TEST SEASON — sample data for preview only. Votes and prize pool are not real.";
    }
  }

  window.API = { state, seedMode: SEED_MODE, ...(SEED_MODE ? SEED : LIVE) };
})();
