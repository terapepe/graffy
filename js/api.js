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

  window.API = {
    state,
    currentSeason: () => request("currentSeason"),
    seasons: () => request("seasons"),
    season: (id) => request("season", { params: { id } }),
    leaderboard: (id, limit) => request("leaderboard", { params: { id }, query: { limit } }),
    artworks: (id, query) => request("artworks", { params: { id }, query }),
    transparency: (id) => request("transparency", { params: { id } }),
    submitArtwork: (form) => request("submitArtwork", { method: "POST", body: form }),
    saveSeason: (payload, sig) => request("adminSaveSeason", { method: "POST", body: payload, headers: sig }),
  };
})();
