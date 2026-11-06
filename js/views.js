/* GRAFFY — page views. Every number comes from the API or on-chain reads. */
(function () {
  const CFG = window.GRAFFY_CONFIG;
  const T = CFG.project.ticker;
  const SPLIT = [{ rank: 1, bps: 5000, pct: "50%" }, { rank: 2, bps: 3000, pct: "30%" }, { rank: 3, bps: 2000, pct: "20%" }];

  const sk = (w = "6ch") => `<span class="skeleton" style="display:inline-block;width:${w}">.</span>`;
  const netImg = (n, cls = "") => `<img src="${n.icon}" alt="${U.esc(n.name)}" class="${cls}" width="24" height="24">`;
  const statusPill = (label, s) => `<span class="status-pill ${U.statusClass(s)}">${U.esc(label)}: ${U.esc(s || "—")}</span>`;
  const txLink = (tx, net) => tx ? `<a class="addr" href="${Chain.explorerTx(net, tx)}" target="_blank" rel="noopener">${U.short(tx, 8, 6)} ↗</a>` : "—";
  const addrLink = (a, net) => a ? `<a class="addr" href="${Chain.explorerAddr(net, a)}" target="_blank" rel="noopener">${U.short(a)}</a>` : "—";

  function countdownHTML(end) {
    return `<div class="countdown" data-countdown="${U.esc(end || "")}">
      ${["Days", "Hours", "Min", "Sec"].map((l) => `<div class="cd-box"><b>--</b><span>${l}</span></div>`).join("")}
    </div>`;
  }

  function prizeCard(season) {
    const total = season?.totalPrizePool;
    const price = season?.usdPrice;
    const winners = season?.winners || [];
    const leaders = season?._leaders || [];
    return `<div class="prize">
      <div class="prize-label">Current Prize Pool</div>
      <div class="prize-total">${season ? U.fmtToken(total, 0) : sk("9ch")}<small>${T}</small></div>
      <div class="prize-usd">${season ? U.usd(total, price) + (price ? " · reference only" : "") : ""}</div>
      <div class="prize-rows">
        ${SPLIT.map((s) => {
          const amt = season ? U.share(total, s.bps) : null;
          const w = winners.find((x) => Number(x.rank) === s.rank) || leaders[s.rank - 1];
          return `<div class="prize-row">
            ${U.medal(s.rank)}
            <div class="who"><b>Top ${s.rank} · ${s.pct}</b>${w ? U.esc(w.title || "") + (w.artist ? " — " + U.esc(w.artist) : "") : "Awaiting votes"}</div>
            <div class="amt">${season ? U.fmtToken(amt, 0) : sk()}<small>${T} ${season ? U.usd(amt, price) : ""}</small></div>
          </div>`;
        }).join("")}
      </div>
      <div class="prize-foot"><span>100% of on-chain voting fees · upload fees excluded</span><span>${season ? "Season #" + U.esc(season.id) : ""}</span></div>
    </div>`;
  }

  function leaderRows(items, season) {
    return items.map((a, i) => {
      const r = Number(a.rank || i + 1);
      const reward = r <= 3 && season ? U.share(season.totalPrizePool, SPLIT[r - 1].bps) : null;
      return `<tr class="${r <= 3 ? "top-row-" + r : ""}">
        <td><span class="rank">${r <= 3 ? U.medal(r) : "#" + r}</span></td>
        <td><div class="art-cell clickable" data-action="view-art" data-id="${U.esc(a.id)}">${a.image ? `<img class="thumb" src="${U.esc(a.image)}" alt="" loading="lazy">` : `<span class="thumb"></span>`}
          <div><b>${U.esc(a.title)}</b><div class="addr">${U.esc(a.artist || "")} ${a.wallet ? "· " + U.short(a.wallet) : ""}</div></div></div></td>
        <td class="num"><b>${U.fmtInt(a.validVotes)}</b></td>
        <td class="num">${reward ? U.fmtToken(reward, 0) + " " + T : "—"}</td>
      </tr>`;
    }).join("");
  }

  function leaderTable(items, season) {
    if (!items || !items.length) return U.empty("No valid votes yet", "Rankings update automatically from on-chain verified votes.");
    return `<div class="table-wrap"><table>
      <thead><tr><th>Rank</th><th>Artwork</th><th class="num">Valid Votes</th><th class="num">Projected Reward</th></tr></thead>
      <tbody>${leaderRows(items, season)}</tbody></table></div>`;
  }

  function paramsList(s) {
    const p = s?.usdPrice;
    const row = (k, v, isFee) => `<div class="param"><span class="k">${k}</span><span class="v">${s ? U.fmtToken(v, 0) + " " + T : sk()}${s && v ? `<small>${U.usd(v, p)}</small>` : ""}</span></div>`;
    return `<div class="param-list">
      ${row("Minimum Holding to Submit", s?.minHoldingToSubmit)}
      ${row("Upload Fee", s?.uploadFee)}
      ${row("Minimum Holding to Vote", s?.minHoldingToVote)}
      ${row("Voting Fee (per vote)", s?.votingFee)}
    </div>
    <div class="lock-note">🔒 ${s ? (s.locked ? "Parameters are locked for this season." : "Parameters lock automatically when the season starts.") : "Set by Admin before each season. Locked once the season starts."}</div>`;
  }

  function artCard(a, i) {
    return `<article class="art-card">
      <div class="img clickable" data-action="view-art" data-id="${U.esc(a.id)}">${a.image ? `<img src="${U.esc(a.image)}" alt="${U.esc(a.title)}" loading="lazy">` : ""}
        <span class="zoom-hint">View</span>
        <span class="rank-tag">#${U.esc(a.rank || i + 1)}</span></div>
      <div class="body">
        <h4 class="clickable" data-action="view-art" data-id="${U.esc(a.id)}">${U.esc(a.title)}</h4>
        <div class="addr">${U.esc(a.artist || "")} ${a.wallet ? "· " + U.short(a.wallet) : ""}</div>
        ${a.description ? `<p class="art-desc">${U.esc(a.description)}</p>` : ""}
        <div class="meta">
          <span class="votes">${U.fmtInt(a.validVotes)} <small>valid votes</small></span>
          <button class="btn btn-primary btn-sm" data-action="vote" data-id="${U.esc(a.id)}">Vote</button>
        </div>
      </div>
    </article>`;
  }

  const V = {};

  /* ---------------- HOME ---------------- */
  V.home = () => `
    <section class="hero">
      <div class="hero-copy">
        <span class="kicker">Street art · on-chain · season based</span>
        <h1>Spray it.<br><span class="spray">Vote it.</span><br><span class="outline">Win it.</span></h1>
        <p class="lead">Artists submit work, the community votes with ${T}. <b>100% of voting fees</b> become the prize pool — the Top 3 artworks take it all.</p>
        <div class="hero-ctas">
          <a href="#/gallery" class="btn btn-primary">Browse & Vote</a>
          <a href="#/submit" class="btn btn-ghost">Submit Artwork</a>
          <button class="btn btn-buy" data-action="open-buy">Buy ${T}</button>
        </div>
        <div class="hero-nets"><span class="label">Live on</span>
          ${Chain.list().map((n) => `<span class="net-badge ${n.primary ? "primary" : ""}">${netImg(n)}${U.esc(n.short)}${n.primary ? '<span class="pill">MAIN</span>' : ""}</span>`).join("")}
        </div>
      </div>
      <div id="homePrize">${prizeCard(null)}</div>
    </section>

    <section>
      <div class="stats" id="homeStats">
        ${["Current Season", "Total Artworks", "Total Artists", "Total Valid Votes", "Total Prize Pool"].map((k) => `<div class="stat"><div class="k">${k}</div><div class="v">${sk()}</div></div>`).join("")}
      </div>
    </section>

    <section class="card season-strip" id="homeSeason">
      <div><span class="kicker">Countdown to season end</span><h3>${sk("12ch")}</h3></div>
      ${countdownHTML("")}
    </section>

    <section>
      <div class="section-head">
        <h2 class="section-title">Current Leaderboard <span class="tag">live</span></h2>
        <a href="#/leaderboard" class="btn btn-ghost btn-sm">Full leaderboard →</a>
      </div>
      <div id="homeLeaders"><div class="empty skeleton" style="height:180px"></div></div>
    </section>

    <section class="grid g-2">
      <div class="card">
        <h2 class="section-title">How it works</h2>
        <div class="grid steps" style="margin-top:20px;gap:22px">
          <div class="step"><h4>Hold & submit</h4><p>Hold the season's minimum ${T} and pay the upload fee to submit your artwork. Upload fees are not part of the prize pool.</p></div>
          <div class="step"><h4>Vote on-chain</h4><p>Each paid vote, confirmed on-chain, counts as exactly 1 valid vote. Failed or reverted transactions are never counted.</p></div>
          <div class="step"><h4>Top 3 win 100%</h4><p>When the season ends the pool is locked and sent automatically to the winning artists' wallets.</p></div>
        </div>
      </div>
      <div class="card">
        <h2 class="section-title">Prize split</h2>
        <div class="split-bar"><span></span><span></span><span></span></div>
        <div class="split-legend"><span>🥇 Top 1 · 50%</span><span>🥈 Top 2 · 30%</span><span>🥉 Top 3 · 20%</span></div>
        <p class="muted" style="font-size:14px;margin-top:18px">Ranking uses <b>valid votes only</b> — never token holdings, USD value or tokens spent. Ties are broken by whoever reached that vote count first.</p>
        <h4 style="margin:22px 0 10px">This season's parameters</h4>
        <div id="homeParams">${paramsList(null)}</div>
      </div>
    </section>`;

  V.homeHydrate = async (App) => {
    const s = await App.loadSeason();
    if (!s) {
      U.$("#homePrize").innerHTML = prizeCard(null).replace(/<span class="skeleton"[^>]*>.<\/span>/g, "—");
      U.$("#homeStats").innerHTML = ["Current Season", "Total Artworks", "Total Artists", "Total Valid Votes", "Total Prize Pool"]
        .map((k) => `<div class="stat"><div class="k">${k}</div><div class="v">—</div></div>`).join("");
      U.$("#homeSeason").innerHTML = `<div><span class="kicker">Countdown to season end</span><h3>No active season</h3><div class="muted">Season data loads from the backend.</div></div>${countdownHTML("")}`;
      U.$("#homeLeaders").innerHTML = U.empty("Leaderboard unavailable", "Live rankings will appear once the season API is online.");
      U.$("#homeParams").innerHTML = paramsList(null).replace(/<span class="skeleton"[^>]*>.<\/span>/g, "—");
      return;
    }
    const lb = await API.leaderboard(s.id, 10);
    const leaders = lb.ok ? (lb.data.items || lb.data) : [];
    s._leaders = leaders;
    App.artworks = leaders;
    U.$("#homePrize").innerHTML = prizeCard(s);
    const accents = ["var(--lime)", "var(--cyan)", "var(--pink)", "var(--orange)", "var(--gold)"];
    U.$("#homeStats").innerHTML = [
      ["Current Season", U.esc(s.name || "#" + s.id), "Season #" + U.esc(s.id)],
      ["Total Artworks", U.fmtInt(s.totalArtworks), ""],
      ["Total Artists", U.fmtInt(s.totalArtists), ""],
      ["Total Valid Votes", U.fmtInt(s.totalValidVotes), "on-chain verified"],
      ["Total Prize Pool", U.fmtCompact(s.totalPrizePool), T],
    ].map(([k, v, sub], i) => `<div class="stat" style="--accent:${accents[i]}"><div class="k">${k}</div><div class="v">${v}</div><div class="s">${sub}</div></div>`).join("");
    U.$("#homeSeason").innerHTML = `<div><span class="kicker">Countdown to season end</span><h3>${U.esc(s.name || "Season #" + s.id)}</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${statusPill("Submissions", s.submissionStatus)}${statusPill("Voting", s.votingStatus)}</div></div>
      ${countdownHTML(s.endDate)}`;
    U.$("#homeLeaders").innerHTML = leaderTable(leaders, s);
    U.$("#homeParams").innerHTML = paramsList(s);
    App.tick();
  };

  /* ---------------- GALLERY ---------------- */
  V.gallery = () => `
    <div class="page-head"><span class="kicker">Current season</span><h1>Gallery</h1><p>Every artwork in the current season. Votes shown are valid, on-chain confirmed votes.</p></div>
    <section>
      <div class="section-head">
        <div class="toolbar">
          <input class="input" id="gSearch" placeholder="Search title or artist…">
          <select class="input" id="gSort"><option value="votes">Most votes</option><option value="newest">Newest</option></select>
        </div>
        <span class="muted" id="gCount"></span>
      </div>
      <div id="gGrid"><div class="art-grid">${Array.from({ length: 4 }, () => '<div class="art-card"><div class="img skeleton"></div><div class="body"><div class="skeleton" style="height:40px"></div></div></div>').join("")}</div></div>
    </section>`;

  V.galleryHydrate = async (App) => {
    const s = await App.loadSeason();
    const grid = U.$("#gGrid");
    if (!s) { grid.innerHTML = U.empty("No artworks to show", "The gallery loads from the season API."); return; }
    const load = async () => {
      const r = await API.artworks(s.id, { sort: U.$("#gSort").value, q: U.$("#gSearch").value.trim() });
      const items = r.ok ? (r.data.items || r.data) : [];
      App.artworks = items;
      U.$("#gCount").textContent = r.ok ? `${U.fmtInt(r.data.total ?? items.length)} artworks` : "";
      grid.innerHTML = items.length ? `<div class="art-grid">${items.map(artCard).join("")}</div>`
        : U.empty(r.ok ? "No artworks yet" : "Gallery unavailable", r.ok ? "Be the first to submit this season." : r.error);
    };
    let t; U.$("#gSearch").addEventListener("input", () => { clearTimeout(t); t = setTimeout(load, 350); });
    U.$("#gSort").addEventListener("change", load);
    load();
  };

  /* ---------------- LEADERBOARD ---------------- */
  V.leaderboard = () => `
    <div class="page-head"><span class="kicker">Ranked by valid votes only</span><h1>Leaderboard</h1>
      <p>1 confirmed on-chain vote = 1 valid vote. Token holdings, USD value and tokens spent do not affect ranking. Ties: the artwork that reached the vote count first ranks higher.</p></div>
    <section><div id="lbBody"><div class="empty skeleton" style="height:240px"></div></div></section>`;

  V.leaderboardHydrate = async (App) => {
    const s = await App.loadSeason();
    if (!s) { U.$("#lbBody").innerHTML = U.empty("Leaderboard unavailable", "Live rankings load from the season API."); return; }
    const r = await API.leaderboard(s.id, 100);
    if (r.ok) App.artworks = r.data.items || r.data;
    U.$("#lbBody").innerHTML = `<div class="card" style="margin-bottom:18px"><div class="season-strip">
      <div><b>${U.esc(s.name || "Season #" + s.id)}</b><div class="muted" style="font-size:14px">Prize pool: ${U.fmtToken(s.totalPrizePool, 0)} ${T} · ${U.fmtInt(s.totalValidVotes)} valid votes</div></div>
      ${countdownHTML(s.endDate)}</div></div>` + (r.ok ? leaderTable(r.data.items || r.data, s) : U.empty("Leaderboard unavailable", r.error));
    App.tick();
  };

  /* ---------------- SUBMIT ---------------- */
  V.submit = () => `
    <div class="page-head"><span class="kicker">Get on the wall</span><h1>Submit Artwork</h1><p>Requirements and fees are set by the Admin for each season and locked once it starts.</p></div>
    <section class="grid g-2">
      <form class="card form" id="subForm">
        <div class="field"><label>Artwork image</label>
          <div class="dropzone" id="drop"><input type="file" id="subFile" accept="image/png,image/jpeg,image/webp,image/gif" required>
            <div id="dropInner"><b>Drop your image here</b><div class="muted" style="font-size:13px">PNG, JPG, WEBP or GIF</div></div></div></div>
        <div class="field"><label for="subTitle">Title</label><input class="input" id="subTitle" maxlength="80" required></div>
        <div class="field"><label for="subArtist">Artist name</label><input class="input" id="subArtist" maxlength="60" required></div>
        <div class="field"><label for="subX">X handle (optional)</label><input class="input" id="subX" maxlength="30" placeholder="@yourhandle"></div>
        <div class="field"><label for="subDesc">Description</label><textarea class="input" id="subDesc" rows="4" maxlength="600"></textarea></div>
        <button class="btn btn-primary btn-block" id="subBtn" type="submit" disabled>Pay upload fee & submit</button>
        <div id="subMsg"></div>
      </form>
      <div class="grid" style="align-content:start">
        <div class="card"><h3 style="margin-top:0">Eligibility</h3><div class="check-list" id="subChecks"></div></div>
        <div class="card"><h3 style="margin-top:0">Season parameters</h3><div id="subParams">${paramsList(null)}</div></div>
      </div>
    </section>`;

  V.submitHydrate = async (App) => {
    const file = U.$("#subFile");
    file.addEventListener("change", () => {
      const f = file.files[0]; if (!f) return;
      U.$("#dropInner").innerHTML = `<img src="${URL.createObjectURL(f)}" alt="preview"><div class="muted" style="margin-top:8px;font-size:13px">${U.esc(f.name)}</div>`;
    });
    const s = await App.loadSeason();
    U.$("#subParams").innerHTML = s ? paramsList(s) : paramsList(null).replace(/<span class="skeleton"[^>]*>.<\/span>/g, "—");
    const render = () => {
      const w = Wallet.state;
      const primary = CFG.primaryNetwork;
      const hold = U.toUnits(w.balance), min = U.toUnits(s?.minHoldingToSubmit);
      const checks = [
        [w.connected, "Wallet connected", w.connected ? U.short(w.address) : "Connect to continue"],
        [w.network === primary, `On ${Chain.get(primary).name}`, w.connected ? (Chain.get(w.network)?.name || "Unsupported network") : ""],
        [!!s && U.statusClass(s.submissionStatus) === "open", "Submissions open", s ? s.submissionStatus : "Season data unavailable"],
        [hold !== null && min !== null && hold >= min, "Minimum holding met", w.balance !== null ? `Balance: ${U.fmtToken(w.balance)} ${T}` : "Balance unknown"],
        [!!CFG.contracts.voting, "Season contract configured", CFG.contracts.voting ? U.short(CFG.contracts.voting) : "Not deployed yet"],
      ];
      U.$("#subChecks").innerHTML = checks.map(([ok, t, d]) => `<div class="check ${ok ? "ok" : "bad"}"><span class="ic">${ok ? "✓" : "!"}</span><div><b>${t}</b><div class="muted" style="font-size:12px">${U.esc(d)}</div></div></div>`).join("");
      U.$("#subBtn").disabled = !checks.every((c) => c[0]);
    };
    render();
    App.onWallet(render);
    U.$("#subForm").addEventListener("submit", (e) => {
      e.preventDefault();
      U.$("#subMsg").innerHTML = `<div class="notice">Upload-fee payment is handled by the season smart contract. This step will be enabled once the contract and backend are live.</div>`;
    });
  };

  /* ---------------- SEASONS ---------------- */
  V.seasons = () => `
    <div class="page-head"><span class="kicker">Archive</span><h1>Seasons</h1><p>Every season has its own parameters, prize pool and winners.</p></div>
    <section id="seasonsBody"><div class="empty skeleton" style="height:200px"></div></section>`;

  V.seasonsHydrate = async () => {
    const r = await API.seasons();
    const items = r.ok ? (r.data.items || r.data) : [];
    if (!items.length) { U.$("#seasonsBody").innerHTML = U.empty(r.ok ? "No seasons yet" : "Seasons unavailable", r.ok ? "The first season is coming soon." : r.error); return; }
    U.$("#seasonsBody").innerHTML = `<div class="grid g-2">${items.map((s) => `
      <div class="card">
        <div class="section-head" style="margin-bottom:10px"><div><span class="kicker">Season #${U.esc(s.id)}</span><h3 style="margin:2px 0;font-family:var(--display)">${U.esc(s.name)}</h3>
          <div class="muted" style="font-size:13px">${U.fmtDate(s.startDate)} → ${U.fmtDate(s.endDate)}</div></div>
          ${statusPill("Prize", s.prizeDistributionStatus)}</div>
        <div class="param-list">
          <div class="param"><span class="k">Total Prize Pool</span><span class="v">${U.fmtToken(s.totalPrizePool, 0)} ${T}</span></div>
          <div class="param"><span class="k">Total Valid Votes</span><span class="v">${U.fmtInt(s.totalValidVotes)}</span></div>
          ${[1, 2, 3].map((rk) => { const w = (s.winners || []).find((x) => Number(x.rank) === rk); return `<div class="param"><span class="k">${U.medal(rk).replace('class="medal"', 'class="medal" width="22" height="22" style="vertical-align:middle"')} Winner #${rk}</span><span class="v">${w ? U.esc(w.title) + "<small>" + addrLink(w.wallet) + " · " + txLink(w.txHash) + "</small>" : "—"}</span></div>`; }).join("")}
        </div>
        <a href="#/transparency?season=${encodeURIComponent(s.id)}" class="btn btn-ghost btn-sm" style="margin-top:14px">View transactions →</a>
      </div>`).join("")}</div>`;
  };

  /* ---------------- TRANSPARENCY ---------------- */
  V.transparency = () => `
    <div class="page-head"><span class="kicker">Public record</span><h1>Transparency</h1><p>Every voting fee received and every prize distribution, with on-chain transaction links. Admins cannot edit vote counts.</p></div>
    <section><div class="toolbar"><select class="input" id="trSeason"><option value="">Loading seasons…</option></select></div></section>
    <section id="trBody"></section>`;

  V.transparencyHydrate = async (App, query) => {
    const sel = U.$("#trSeason");
    const r = await API.seasons();
    const items = r.ok ? (r.data.items || r.data) : [];
    if (!items.length) { sel.innerHTML = `<option>No seasons</option>`; U.$("#trBody").innerHTML = U.empty("No records yet", r.ok ? "Records appear once a season starts." : r.error); return; }
    sel.innerHTML = items.map((s) => `<option value="${U.esc(s.id)}">Season #${U.esc(s.id)} — ${U.esc(s.name)}</option>`).join("");
    if (query.season) sel.value = query.season;
    const load = async () => {
      U.$("#trBody").innerHTML = `<div class="empty skeleton" style="height:200px"></div>`;
      const t = await API.transparency(sel.value);
      if (!t.ok) { U.$("#trBody").innerHTML = U.empty("Records unavailable", t.error); return; }
      const d = t.data, fees = d.feeReceipts || [], dist = d.distributions || [];
      U.$("#trBody").innerHTML = `
        <div class="stats" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
          <div class="stat"><div class="k">Total Prize Pool</div><div class="v">${U.fmtToken(d.totalPrizePool, 0)}</div><div class="s">${T}</div></div>
          <div class="stat" style="--accent:var(--cyan)"><div class="k">Fee receipts</div><div class="v">${U.fmtInt(d.feeReceiptsTotal ?? fees.length)}</div></div>
          <div class="stat" style="--accent:var(--pink)"><div class="k">Distribution</div><div class="v" style="font-size:18px">${U.esc(d.prizeDistributionStatus || "—")}</div></div>
        </div>
        <h2 class="section-title" style="margin-bottom:14px">Prize distribution</h2>
        ${dist.length ? `<div class="table-wrap"><table><thead><tr><th>Rank</th><th>Artist wallet</th><th class="num">Amount</th><th>Tx</th><th>Time</th></tr></thead><tbody>
          ${dist.map((x) => `<tr><td>${U.medal(Number(x.rank)).replace('class="medal"', 'class="medal" width="26" height="26"')}</td><td>${addrLink(x.wallet)}</td><td class="num">${U.fmtToken(x.amount)} ${T}</td><td>${txLink(x.txHash)}</td><td class="muted">${U.fmtDate(x.timestamp)}</td></tr>`).join("")}
          </tbody></table></div>` : U.empty("Not distributed yet", "Rewards are distributed automatically when the season ends.")}
        <h2 class="section-title" style="margin:34px 0 14px">Voting fee receipts</h2>
        ${fees.length ? `<div class="table-wrap"><table><thead><tr><th>Voter</th><th>Artwork</th><th class="num">Fee</th><th>Tx</th><th>Time</th></tr></thead><tbody>
          ${fees.map((x) => `<tr><td>${addrLink(x.from)}</td><td>${U.esc(x.artworkTitle || x.artworkId || "—")}</td><td class="num">${U.fmtToken(x.amount)} ${T}</td><td>${txLink(x.txHash)}</td><td class="muted">${U.fmtDate(x.timestamp)}</td></tr>`).join("")}
          </tbody></table></div>` : U.empty("No fees received yet", "Each confirmed vote will be listed here.")}`;
    };
    sel.addEventListener("change", load);
    load();
  };

  /* ---------------- TOKEN ---------------- */
  V.token = () => `
    <div class="page-head"><span class="kicker">${T}</span><h1>Token</h1><p>Fixed total supply. Robinhood Chain is the main network; BSC, Base and Ethereum share the same contract address. Solana uses its own mint.</p></div>
    <section class="grid g-3">
      <div class="stat"><div class="k">Total Supply (fixed)</div><div class="v">${U.fmtToken(CFG.project.totalSupply, 0)}</div><div class="s">${T}</div></div>
      <div class="stat" style="--accent:var(--cyan)"><div class="k">Main network</div><div class="v" style="font-size:20px">${U.esc(Chain.get(CFG.primaryNetwork).name)}</div><div class="s">Chain ID ${Chain.get(CFG.primaryNetwork).chainId}</div></div>
      <div class="stat" style="--accent:var(--pink)"><div class="k">Networks</div><div class="v">${Chain.list().length}</div><div class="s">${Chain.list().map((n) => n.short).join(" · ")}</div></div>
    </section>
    <section>
      <h2 class="section-title" style="margin-bottom:16px">Contract addresses</h2>
      <div class="grid" id="caList">
        ${Chain.list().map((n) => { const ca = Chain.tokenAddress(n.id); return `<div class="ca-row" style="--net:${n.color}">
          <img src="${n.icon}" alt="">
          <div><div class="name">${U.esc(n.name)} ${n.primary ? '<span class="pill" style="font-size:10px;background:var(--lime);color:var(--bg);padding:1px 6px;border-radius:6px">MAIN</span>' : ""}</div>
            <div class="ca">${ca ? U.esc(ca) : "TBA — not deployed yet"}</div>
            <div class="muted" style="font-size:12px">Live supply: <span data-supply="${n.id}">${ca ? "loading…" : "—"}</span></div></div>
          <div class="acts">
            ${ca ? `<button class="btn btn-ghost btn-sm" data-action="copy" data-text="${U.esc(ca)}">Copy</button><a class="btn btn-ghost btn-sm" href="${Chain.explorerToken(n.id)}" target="_blank" rel="noopener">Explorer</a>` : ""}
            <a class="btn btn-buy btn-sm" href="${Chain.uniswapUrl(n.id)}" target="_blank" rel="noopener">Buy</a>
          </div></div>`; }).join("")}
      </div>
    </section>`;

  V.tokenHydrate = async () => {
    Chain.list().forEach(async (n) => {
      if (!Chain.tokenAddress(n.id)) return;
      const v = await Chain.totalSupply(n.id);
      const el = U.$(`[data-supply="${n.id}"]`);
      if (el) el.textContent = v !== null ? U.fmtToken(v, 0) + " " + T : "unavailable";
    });
  };

  /* ---------------- ADMIN ---------------- */
  V.admin = () => `
    <div class="page-head"><span class="kicker">Restricted</span><h1>Season Admin</h1><p>Configure the next season. Values are written to the season contract and locked when the season starts — they cannot be changed mid-season, and vote counts can never be edited.</p></div>
    <section class="grid g-2">
      <form class="card form" id="admForm">
        <div class="grid g-2">
          <div class="field"><label>Season Name</label><input class="input" name="name" required maxlength="60"></div>
          <div class="field"><label>Season ID</label><input class="input" name="id" placeholder="Assigned by contract" disabled></div>
          <div class="field"><label>Start Date</label><input class="input" type="datetime-local" name="startDate" required></div>
          <div class="field"><label>End Date</label><input class="input" type="datetime-local" name="endDate" required></div>
        </div>
        <div class="grid g-2">
          <div class="field"><label>Minimum Holding to Submit (${T})</label><input class="input" name="minHoldingToSubmit" inputmode="decimal" pattern="\\d+(\\.\\d+)?" required></div>
          <div class="field"><label>Upload Fee (${T})</label><input class="input" name="uploadFee" inputmode="decimal" pattern="\\d+(\\.\\d+)?" required></div>
          <div class="field"><label>Minimum Holding to Vote (${T})</label><input class="input" name="minHoldingToVote" inputmode="decimal" pattern="\\d+(\\.\\d+)?" required></div>
          <div class="field"><label>Voting Fee per vote (${T})</label><input class="input" name="votingFee" inputmode="decimal" pattern="\\d+(\\.\\d+)?" required></div>
        </div>
        <div class="grid g-2">
          <div class="field"><label>Submission Status</label><select class="input" name="submissionStatus"><option>scheduled</option><option>open</option><option>closed</option></select></div>
          <div class="field"><label>Voting Status</label><select class="input" name="votingStatus"><option>scheduled</option><option>open</option><option>closed</option></select></div>
        </div>
        <div class="field"><label>USD reference price per ${T} (display only)</label><input class="input" name="usdPrice" inputmode="decimal" pattern="\\d+(\\.\\d+)?">
          <div class="hint">Shown as "~$" next to fees. Never used for payments, ranking or rewards.</div></div>
        <div class="field" id="admPreview"></div>
        <button class="btn btn-primary btn-block" id="admBtn" type="submit">Sign & save season</button>
        <div id="admMsg"></div>
      </form>
      <div class="grid" style="align-content:start">
        <div class="card"><h3 style="margin-top:0">Access</h3><div class="check-list" id="admChecks"></div></div>
        <div class="card"><h3 style="margin-top:0">Current season</h3><div id="admCurrent">${paramsList(null)}</div></div>
      </div>
    </section>`;

  V.adminHydrate = async (App) => {
    const s = await App.loadSeason();
    U.$("#admCurrent").innerHTML = s ? `<div style="margin-bottom:10px"><b>${U.esc(s.name)}</b> ${statusPill("Voting", s.votingStatus)}</div>` + paramsList(s)
      : paramsList(null).replace(/<span class="skeleton"[^>]*>.<\/span>/g, "—");
    const form = U.$("#admForm");
    const preview = () => {
      const fd = Object.fromEntries(new FormData(form));
      const p = fd.usdPrice;
      U.$("#admPreview").innerHTML = p ? `<div class="notice">Preview: Upload Fee ${U.fmtToken(fd.uploadFee, 0)} ${T} (${U.usd(fd.uploadFee, p) || "—"}) · Voting Fee ${U.fmtToken(fd.votingFee, 0)} ${T} (${U.usd(fd.votingFee, p) || "—"})</div>` : "";
    };
    form.addEventListener("input", preview);
    const render = () => {
      const w = Wallet.state, live = s && U.statusClass(s.votingStatus) === "open";
      const checks = [
        [w.connected, "Wallet connected", w.connected ? U.short(w.address) : "Connect an admin wallet"],
        [Wallet.isAdmin(), "Admin wallet", Wallet.isAdmin() ? "Authorised" : "Not in admin list"],
      ];
      U.$("#admChecks").dataset.note = live ? `"${s.name}" is live until ${U.fmtDate(s.endDate)} — its parameters are locked. A new season must start after it ends.` : "";
      U.$("#admChecks").innerHTML = checks.map(([ok, t, d]) => `<div class="check ${ok ? "ok" : "bad"}"><span class="ic">${ok ? "✓" : "!"}</span><div><b>${t}</b><div class="muted" style="font-size:12px">${U.esc(d)}</div></div></div>`).join("")
        + (U.$("#admChecks").dataset.note ? `<div class="notice">🔒 ${U.esc(U.$("#admChecks").dataset.note)}</div>` : "");
      U.$("#admBtn").disabled = !checks.every((c) => c[0]);
    };
    render();
    App.onWallet(render);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(form));
      if (new Date(payload.endDate) <= new Date(payload.startDate)) { U.$("#admMsg").innerHTML = `<div class="notice err">End Date must be after Start Date.</div>`; return; }
      payload.startDate = new Date(payload.startDate).toISOString();
      payload.endDate = new Date(payload.endDate).toISOString();
      payload.createdBy = Wallet.state.address;
      try {
        const msg = `GRAFFY admin: save season\n${JSON.stringify(payload)}\n${new Date().toISOString()}`;
        const sig = await Wallet.signMessage(msg);
        const r = await API.saveSeason(payload, { "X-Wallet": Wallet.state.address, "X-Signature": sig, "X-Message": btoa(unescape(encodeURIComponent(msg))) });
        if (r.ok) { form.reset(); App.season = undefined; }
        U.$("#admMsg").innerHTML = r.ok ? `<div class="notice">Season #${U.esc(r.data.id)} saved${API.seedMode ? " (test mode — stored in this browser only)" : ""}. <a href="#/seasons"><u>View seasons</u></a></div>` : `<div class="notice err">Save failed: ${U.esc(r.error)}</div>`;
      } catch (err) { U.$("#admMsg").innerHTML = `<div class="notice err">${U.esc(err.message)}</div>`; }
    });
  };

  /* ---------------- MODALS ---------------- */
  V.buyModal = () => `
    <h3 id="modalTitle">Buy ${T}</h3>
    <p class="sub">Choose a network. You'll be redirected to Uniswap with ${T} pre-selected.</p>
    <div class="net-list">
      ${Chain.list().map((n) => { const ca = Chain.tokenAddress(n.id); return `<a class="net-opt" style="--net:${n.color}" href="${Chain.uniswapUrl(n.id)}" target="_blank" rel="noopener">
        <img src="${n.icon}" alt=""><div><div class="n">${U.esc(n.name)}${n.primary ? '<span class="pill">MAIN</span>' : ""}</div>
        <div class="d">${ca ? U.short(ca, 8, 6) : "CA: TBA"}</div></div><span class="go">↗</span></a>`; }).join("")}
    </div>
    ${CFG.token.evmAddress || CFG.token.solanaAddress ? "" : `<div class="notice">Contract address not published yet. Always verify the CA on our official X ${U.esc(CFG.social.xHandle)} before buying.</div>`}`;

  V.connectModal = () => `
    <h3 id="modalTitle">Connect wallet</h3>
    <p class="sub">Pick the network you want to log in with.</p>
    <div class="net-list">
      ${Chain.list().map((n) => `<button class="net-opt" style="--net:${n.color}" data-action="pick-net" data-net="${n.id}">
        <img src="${n.icon}" alt=""><div><div class="n">${U.esc(n.name)}${n.primary ? '<span class="pill">MAIN</span>' : ""}</div>
        <div class="d">${n.type === "evm" ? "EVM · Chain ID " + n.chainId : "Solana wallets"}</div></div><span class="go">→</span></button>`).join("")}
    </div>`;

  V.walletPicker = (netId) => {
    const n = Chain.get(netId);
    const list = n.type === "evm" ? Wallet.evmWallets().map((w) => ({ key: w.info.rdns || "injected", name: w.info.name, icon: w.info.icon }))
      : Wallet.solanaWallets().map((w) => ({ key: w.name, name: w.name, icon: "" }));
    return `<h3 id="modalTitle"><img src="${n.icon}" alt="" width="28" height="28" style="vertical-align:middle;margin-right:8px">${U.esc(n.name)}</h3>
      <p class="sub">Select a wallet.</p>
      <div class="wallet-list">
        ${list.length ? list.map((w) => `<button class="wallet-opt" data-action="connect-wallet" data-net="${netId}" data-key="${U.esc(w.key)}">
          ${w.icon ? `<img src="${U.esc(w.icon)}" alt="">` : `<img src="${n.icon}" alt="">`}<b>${U.esc(w.name)}</b></button>`).join("")
        : `<div class="notice">No ${n.type === "evm" ? "EVM" : "Solana"} wallet detected in this browser.<br>
            ${n.type === "evm" ? 'Install <a href="https://metamask.io" target="_blank" rel="noopener"><u>MetaMask</u></a> or <a href="https://rabby.io" target="_blank" rel="noopener"><u>Rabby</u></a>.' : 'Install <a href="https://phantom.com" target="_blank" rel="noopener"><u>Phantom</u></a> or <a href="https://solflare.com" target="_blank" rel="noopener"><u>Solflare</u></a>.'}</div>`}
      </div>
      <button class="btn btn-ghost btn-sm" style="margin-top:16px" data-action="open-connect">← Back</button>
      <div id="connMsg"></div>`;
  };

  V.accountModal = () => {
    const w = Wallet.state, n = Chain.get(w.network);
    return `<h3 id="modalTitle">Your wallet</h3>
      <p class="sub">${U.esc(w.walletName || "")} · ${n ? U.esc(n.name) : "Unsupported network"}</p>
      <div class="param-list">
        <div class="param"><span class="k">Address</span><span class="v mono" style="font-size:12px">${U.short(w.address, 10, 8)}</span></div>
        <div class="param"><span class="k">${T} balance</span><span class="v">${w.balance !== null ? U.fmtToken(w.balance) : (Chain.tokenAddress(w.network) ? "—" : "CA not set")}</span></div>
      </div>
      ${w.type === "evm" ? `<h4 style="margin:18px 0 10px">Switch network</h4><div class="net-list">
        ${Chain.list().filter((x) => x.type === "evm").map((x) => `<button class="net-opt" style="--net:${x.color}" data-action="switch-net" data-net="${x.id}"><img src="${x.icon}" alt="">
          <div><div class="n">${U.esc(x.name)}${x.id === w.network ? '<span class="pill">CURRENT</span>' : ""}</div><div class="d">Chain ID ${x.chainId}</div></div><span class="go">→</span></button>`).join("")}</div>` : ""}
      <div style="display:flex;gap:8px;margin-top:18px">
        <button class="btn btn-ghost btn-sm" data-action="copy" data-text="${U.esc(w.address)}">Copy address</button>
        <a class="btn btn-ghost btn-sm" href="${Chain.explorerAddr(w.network, w.address)}" target="_blank" rel="noopener">Explorer</a>
        <button class="btn btn-ghost btn-sm" data-action="disconnect" style="margin-left:auto">Disconnect</button>
      </div>`;
  };

  V.artModal = (a, s) => {
    const r = Number(a.rank);
    const reward = r >= 1 && r <= 3 && s ? U.share(s.totalPrizePool, SPLIT[r - 1].bps) : null;
    const xh = a.artistX ? a.artistX.replace(/^@/, "") : "";
    return `<div class="art-modal">
      <div class="art-big">${a.image ? `<a href="${U.esc(a.image)}" target="_blank" rel="noopener" title="Open full size"><img src="${U.esc(a.image)}" alt="${U.esc(a.title)}"></a>` : ""}</div>
      <div class="art-info">
        <span class="kicker">${r <= 3 ? U.medal(r).replace('class="medal"', 'class="medal" width="26" height="26" style="vertical-align:middle"') : ""} Rank #${U.esc(a.rank || "—")}</span>
        <h3 id="modalTitle" style="margin-top:6px">${U.esc(a.title)}</h3>
        ${a.description ? `<p class="art-text">${U.esc(a.description)}</p>` : ""}
        <div class="param-list">
          <div class="param"><span class="k">Valid votes</span><span class="v">${U.fmtInt(a.validVotes)}</span></div>
          ${reward ? `<div class="param"><span class="k">Projected reward</span><span class="v">${U.fmtToken(reward, 0)} ${T}<small>${U.usd(reward, s?.usdPrice)}</small></span></div>` : ""}
          ${a.medium ? `<div class="param"><span class="k">Medium</span><span class="v" style="font-family:var(--body);font-weight:500">${U.esc(a.medium)}</span></div>` : ""}
          <div class="param"><span class="k">Submitted</span><span class="v" style="font-family:var(--body);font-weight:500">${U.fmtDate(a.createdAt)}</span></div>
        </div>
        <div class="artist-card">
          <div class="avatar">${U.esc((a.artist || "?").trim().charAt(0).toUpperCase())}</div>
          <div style="min-width:0">
            <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px">Artist</div>
            <b>${U.esc(a.artist || "Unknown")}</b>
            ${xh ? `<a class="addr" href="https://x.com/${encodeURIComponent(xh)}" target="_blank" rel="noopener" style="display:block">@${U.esc(xh)} ↗</a>` : ""}
            ${a.artistBio ? `<p class="art-text" style="margin:6px 0 0;font-size:13px">${U.esc(a.artistBio)}</p>` : ""}
            ${a.wallet ? `<div class="addr" style="margin-top:6px">${U.short(a.wallet, 8, 6)} <button class="link-btn" data-action="copy" data-text="${U.esc(a.wallet)}">copy</button></div>` : ""}
          </div>
        </div>
        <button class="btn btn-primary btn-block" style="margin-top:16px" data-action="vote" data-id="${U.esc(a.id)}">Vote for this artwork</button>
      </div>
    </div>`;
  };

  V.voteModal = (a, s) => {
    const w = Wallet.state, p = s?.usdPrice, primary = CFG.primaryNetwork;
    const hold = U.toUnits(w.balance), min = U.toUnits(s?.minHoldingToVote);
    const checks = [
      [w.connected, "Wallet connected"],
      [w.network === primary, `On ${Chain.get(primary).name}`],
      [!!s && U.statusClass(s.votingStatus) === "open", "Voting open"],
      [hold !== null && min !== null && hold >= min, "Minimum holding met"],
      [!!CFG.contracts.voting, "Voting contract configured"],
    ];
    const ok = checks.every((c) => c[0]);
    return `<h3 id="modalTitle">Vote</h3>
      <p class="sub">${U.esc(a.title)} — ${U.esc(a.artist || "")}</p>
      <div class="param-list">
        <div class="param"><span class="k">Voting fee</span><span class="v">${s ? U.fmtToken(s.votingFee, 0) + " " + T : "—"}<small>${s ? U.usd(s.votingFee, p) : ""}</small></span></div>
        <div class="param"><span class="k">Minimum holding</span><span class="v">${s ? U.fmtToken(s.minHoldingToVote, 0) + " " + T : "—"}</span></div>
        <div class="param"><span class="k">Your balance</span><span class="v">${w.balance !== null ? U.fmtToken(w.balance) + " " + T : "—"}</span></div>
      </div>
      <div class="check-list" style="margin-top:14px">${checks.map(([c, t]) => `<div class="check ${c ? "ok" : "bad"}"><span class="ic">${c ? "✓" : "!"}</span>${t}</div>`).join("")}</div>
      ${!w.connected ? `<button class="btn btn-ghost btn-block" style="margin-top:16px" data-action="open-connect">Connect wallet</button>`
        : w.type === "evm" && w.network !== primary ? `<button class="btn btn-ghost btn-block" style="margin-top:16px" data-action="switch-net" data-net="${primary}">Switch to ${Chain.get(primary).short}</button>` : ""}
      <button class="btn btn-primary btn-block" style="margin-top:10px" data-action="confirm-vote" data-id="${U.esc(a.id)}" ${ok ? "" : "disabled"}>Confirm vote · ${s ? U.fmtToken(s.votingFee, 0) : "—"} ${T}</button>
      <div class="notice" style="color:var(--muted);border-color:var(--line);background:#0f0f15">1 confirmed transaction = 1 valid vote. 100% of the fee goes to the season prize pool.</div>`;
  };

  window.Views = V;
})();
