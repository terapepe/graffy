/* GRAFFY — wallet login on Robinhood Chain (EVM wallets via EIP-6963/EIP-1193). */
(function () {
  const evmProviders = new Map(); // rdns -> { info, provider }
  const KEY = "graffy.wallet";

  const W = {
    state: { connected: false, type: null, network: null, address: null, provider: null, walletName: null, balance: null },

    init() {
      window.addEventListener("eip6963:announceProvider", (e) => {
        const { info, provider } = e.detail || {};
        if (info && provider) evmProviders.set(info.rdns || info.uuid, { info, provider });
      });
      window.dispatchEvent(new Event("eip6963:requestProvider"));
      W.restore();
    },

    evmWallets() {
      const list = [...evmProviders.values()];
      if (!list.length && window.ethereum) {
        list.push({ info: { name: window.ethereum.isMetaMask ? "MetaMask" : "Browser Wallet", rdns: "injected", icon: "" }, provider: window.ethereum });
      }
      return list;
    },

    async connectEvm(netId, rdns) {
      const net = Chain.get(netId);
      const entry = W.evmWallets().find((w) => (w.info.rdns || "injected") === rdns) || W.evmWallets()[0];
      if (!entry) throw new Error("No EVM wallet detected. Install MetaMask, Rabby, Coinbase Wallet or similar.");
      const p = entry.provider;
      const accounts = await p.request({ method: "eth_requestAccounts" });
      await W.switchEvm(p, net);
      W.set({ connected: true, type: "evm", network: netId, address: accounts[0], provider: p, walletName: entry.info.name, rdns: entry.info.rdns || "injected" });
      W.bindEvm(p);
    },

    async switchEvm(p, net) {
      const chainId = Chain.hex(net.chainId);
      try {
        await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
      } catch (e) {
        if (e.code === 4902 || /unrecognized|not added|unknown chain/i.test(e.message || "")) {
          await p.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId, chainName: net.name, nativeCurrency: net.nativeCurrency, rpcUrls: net.rpcUrls, blockExplorerUrls: [net.explorer] }],
          });
        } else throw e;
      }
    },

    bindEvm(p) {
      if (p._graffyBound || !p.on) return;
      p._graffyBound = true;
      p.on("accountsChanged", (a) => { a.length ? W.set({ address: a[0] }) : W.disconnect(); });
      p.on("chainChanged", (cid) => {
        const n = Chain.byChainId(parseInt(cid, 16));
        W.set({ network: n ? n.id : null });
      });
    },

    async disconnect() {
      W.state = { connected: false, type: null, network: null, address: null, provider: null, walletName: null, balance: null };
      try { localStorage.removeItem(KEY); } catch {}
      W.emit();
    },

    set(patch) {
      Object.assign(W.state, patch);
      if (W.state.connected) {
        try { localStorage.setItem(KEY, JSON.stringify({ type: W.state.type, network: W.state.network, rdns: W.state.rdns, walletName: W.state.walletName })); } catch {}
      }
      W.emit();
      if ("address" in patch || "network" in patch) W.refreshBalance();
    },

    async refreshBalance() {
      const s = W.state;
      if (!s.connected || !s.network) { s.balance = null; return; }
      const bal = await Chain.balanceOf(s.network, s.address, s.provider);
      s.balance = bal;
      W.emit();
    },

    /** Silent reconnect if the wallet already authorised this site. */
    async restore() {
      let saved; try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
      if (!saved) return;
      setTimeout(async () => {
        try {
          if (saved.type === "evm") {
            const entry = W.evmWallets().find((w) => (w.info.rdns || "injected") === saved.rdns) || W.evmWallets()[0];
            if (!entry) return;
            const acc = await entry.provider.request({ method: "eth_accounts" });
            if (!acc.length) return;
            const cid = await entry.provider.request({ method: "eth_chainId" });
            const n = Chain.byChainId(parseInt(cid, 16));
            W.set({ connected: true, type: "evm", network: n ? n.id : null, address: acc[0], provider: entry.provider, walletName: entry.info.name, rdns: entry.info.rdns || "injected" });
            W.bindEvm(entry.provider);
          }
        } catch {}
      }, 400);
    },

    /** Sign a login message (backend will verify the signature later). */
    async signMessage(message) {
      const s = W.state;
      if (!s.connected) throw new Error("Wallet not connected");
      return s.provider.request({ method: "personal_sign", params: [message, s.address] });
    },

    isAdmin() {
      const a = (W.state.address || "").toLowerCase();
      return !!a && window.GRAFFY_CONFIG.adminWallets.map((x) => x.toLowerCase()).includes(a);
    },

    emit() { window.dispatchEvent(new CustomEvent("wallet:change", { detail: W.state })); },
  };

  window.Wallet = W;
})();
