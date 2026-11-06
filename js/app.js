/* GRAFFY — app shell: router, modals, wallet button, countdown. */
(function () {
  const CFG = window.GRAFFY_CONFIG;
  const ROUTES = ["home", "gallery", "leaderboard", "submit", "seasons", "transparency", "token", "admin"];

  const App = {
    season: undefined,
    artworks: [],
    _walletHandlers: [],

    async loadSeason(force) {
      if (this.season !== undefined && !force) return this.season;
      const r = await API.currentSeason();
      this.season = r.ok && r.data && r.data.id !== undefined ? r.data : null;
      return this.season;
    },

    onWallet(fn) { this._walletHandlers.push(fn); },

    parse() {
      const h = location.hash.replace(/^#\/?/, "");
      const [path, qs] = h.split("?");
      const route = ROUTES.includes(path) ? path : "home";
      return { route, query: Object.fromEntries(new URLSearchParams(qs || "")) };
    },

    render() {
      let { route, query } = this.parse();
      if (route === "admin" && !Wallet.isAdmin()) route = "home";
      this.current = route;
      this._walletHandlers = [];
      U.$$("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === route));
      U.$("#nav").classList.remove("open");
      const app = U.$("#app");
      app.innerHTML = Views[route]();
      window.scrollTo({ top: 0 });
      const h = Views[route + "Hydrate"];
      if (h) h(this, query);
    },

    tick() {
      U.$$("[data-countdown]").forEach((el) => {
        const end = el.dataset.countdown;
        const b = el.querySelectorAll("b");
        if (!end) { b.forEach((x) => (x.textContent = "--")); return; }
        const t = U.timeLeft(end);
        if (!t) return;
        [t.d, t.h, t.m, t.s].forEach((v, i) => (b[i].textContent = U.pad(v)));
      });
    },

    openModal(html, wide) {
      U.$("#modalBody").innerHTML = html;
      U.$(".modal-card").classList.toggle("wide", !!wide);
      U.$("#modal").hidden = false;
      document.body.style.overflow = "hidden";
    },
    closeModal() {
      U.$("#modal").hidden = true;
      document.body.style.overflow = "";
    },

    updateWalletBtn() {
      const isAdmin = Wallet.isAdmin();
      U.$(".nav-admin").hidden = !isAdmin;
      // Lost admin while on the page -> leave. Became admin with #/admin in the URL -> show it.
      if (!isAdmin && this.current === "admin") location.hash = "#/";
      else if (isAdmin && this.parse().route === "admin" && this.current !== "admin") this.render();
      const w = Wallet.state, btn = U.$("#walletBtn");
      if (!w.connected) { btn.textContent = "Connect"; btn.dataset.action = "open-connect"; return; }
      const n = Chain.get(w.network);
      btn.dataset.action = "open-account";
      btn.innerHTML = `<span class="wallet-chip">${n ? `<img src="${n.icon}" alt="">` : "⚠"}${U.short(w.address, 4, 4)}</span>`;
    },

    async handle(action, el) {
      switch (action) {
        case "open-buy": return this.openModal(Views.buyModal());
        case "open-connect": return this.openModal(Views.connectModal());
        case "open-account": return this.openModal(Views.accountModal());
        case "close-modal": return this.closeModal();
        case "pick-net": return this.openModal(Views.walletPicker(el.dataset.net));
        case "copy": return U.copy(el.dataset.text);
        case "disconnect": await Wallet.disconnect(); return this.closeModal();
        case "connect-wallet": {
          const net = el.dataset.net;
          el.disabled = true;
          try {
            if (Chain.get(net).type === "evm") await Wallet.connectEvm(net, el.dataset.key);
            else await Wallet.connectSolana(el.dataset.key);
            this.closeModal();
            U.toast("Wallet connected");
          } catch (e) {
            el.disabled = false;
            const m = U.$("#connMsg");
            if (m) m.innerHTML = `<div class="notice err">${U.esc(e.message || "Connection rejected")}</div>`;
          }
          return;
        }
        case "switch-net": {
          try {
            await Wallet.switchEvm(Wallet.state.provider, Chain.get(el.dataset.net));
            Wallet.set({ network: el.dataset.net });
            this.closeModal();
          } catch (e) { U.toast(e.message || "Switch rejected"); }
          return;
        }
        case "view-art": {
          const a = this.artworks.find((x) => String(x.id) === el.dataset.id);
          if (a) this.openModal(Views.artModal(a, this.season), true);
          return;
        }
        case "vote": {
          const a = this.artworks.find((x) => String(x.id) === el.dataset.id);
          if (a) this.openModal(Views.voteModal(a, this.season));
          return;
        }
        case "confirm-vote":
          // Vote transaction is sent to the season contract (contracts.voting) once deployed.
          return U.toast("Voting contract not live yet");
      }
    },

    init() {
      U.$("#xLink").href = CFG.social.x;
      const xf = U.$("#xLinkFooter");
      xf.href = CFG.social.x;
      xf.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L4.9 21H1.8l7.3-8.3L1.4 3h6.4l4.4 5.9L17.5 3Zm-1.1 16.2h1.7L6.8 4.7H5L16.4 19.2Z"/></svg>${U.esc(CFG.social.xHandle)}`;
      U.$("#footerNets").innerHTML = Chain.list().map((n) => `<img src="${n.icon}" alt="${U.esc(n.name)}" title="${U.esc(n.name)}">`).join("");

      document.addEventListener("click", (e) => {
        const el = e.target.closest("[data-action]");
        if (!el) return;
        if (el.tagName === "A" && el.getAttribute("href")) return; // external links
        e.preventDefault();
        this.handle(el.dataset.action, el);
      });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") this.closeModal(); });
      U.$("#burger").addEventListener("click", () => U.$("#nav").classList.toggle("open"));

      window.addEventListener("hashchange", () => this.render());
      window.addEventListener("wallet:change", () => {
        this.updateWalletBtn();
        this._walletHandlers.forEach((f) => f());
        if (!U.$("#modal").hidden && U.$("#modalBody [data-action='disconnect']")) U.$("#modalBody").innerHTML = Views.accountModal();
      });

      setInterval(() => this.tick(), 1000);
      Wallet.init();
      this.updateWalletBtn();
      this.render();
    },
  };

  window.App = App;
  document.addEventListener("DOMContentLoaded", () => App.init());
})();
