/* GRAFFY — network helpers + live on-chain reads (JSON-RPC, no libraries). */
(function () {
  const CFG = window.GRAFFY_CONFIG;

  const Chain = {
    list() {
      return Object.entries(CFG.networks).map(([id, n]) => ({ id, ...n }))
        .sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0));
    },
    get(id) { const n = CFG.networks[id]; return n ? { id, ...n } : null; },
    byChainId(cid) { return Chain.list().find((n) => n.type === "evm" && n.chainId === Number(cid)) || null; },
    hex(cid) { return "0x" + Number(cid).toString(16); },

    tokenAddress(id) {
      const n = CFG.networks[id];
      if (!n) return "";
      if (n.tokenAddress) return n.tokenAddress;
      return n.type === "solana" ? CFG.token.solanaAddress : CFG.token.evmAddress;
    },
    explorerToken(id) {
      const n = CFG.networks[id], a = Chain.tokenAddress(id);
      return n && a ? n.explorer + n.explorerToken + a : "";
    },
    explorerTx(id, tx) {
      const n = CFG.networks[id || CFG.primaryNetwork];
      return n && tx ? n.explorer + n.explorerTx + tx : "";
    },
    explorerAddr(id, a) {
      const n = CFG.networks[id || CFG.primaryNetwork];
      return n && a ? n.explorer + (n.type === "solana" ? "/account/" : "/address/") + a : "";
    },

    uniswapUrl(id) {
      const n = CFG.networks[id];
      const q = new URLSearchParams({ chain: n.uniswapChain, inputCurrency: "NATIVE" });
      const ca = Chain.tokenAddress(id);
      if (ca) q.set("outputCurrency", ca);
      return CFG.uniswap.base + "?" + q.toString();
    },

    async rpc(id, method, params) {
      const n = CFG.networks[id];
      const res = await fetch(n.rpcUrls[0], {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      const j = await res.json();
      if (j.error) throw new Error(j.error.message || "RPC error");
      return j.result;
    },

    /** Raw BigInt -> decimal string given decimals. */
    format(raw, dec) {
      const b = BigInt(raw), d = 10n ** BigInt(dec);
      const i = b / d; const f = (b % d).toString().padStart(dec, "0").replace(/0+$/, "");
      return i.toString() + (f ? "." + f : "");
    },

    async evmCall(id, to, data, provider) {
      const params = [{ to, data }, "latest"];
      return provider ? provider.request({ method: "eth_call", params }) : Chain.rpc(id, "eth_call", params);
    },

    async evmDecimals(id, ca, provider) {
      try { return Number(BigInt(await Chain.evmCall(id, ca, "0x313ce567", provider))); }
      catch { return CFG.project.decimals; }
    },

    /** Live total supply on a network, or null when CA not set / unreachable. */
    async totalSupply(id) {
      const n = CFG.networks[id], ca = Chain.tokenAddress(id);
      if (!n || !ca) return null;
      try {
        if (n.type === "solana") {
          const r = await Chain.rpc(id, "getTokenSupply", [ca]);
          return r.value.uiAmountString;
        }
        const dec = await Chain.evmDecimals(id, ca);
        const raw = await Chain.evmCall(id, ca, "0x18160ddd");
        return Chain.format(raw, dec);
      } catch { return null; }
    },

    /** $GRAFFY balance of an address on a network. */
    async balanceOf(id, owner, provider) {
      const n = CFG.networks[id], ca = Chain.tokenAddress(id);
      if (!n || !ca || !owner) return null;
      try {
        if (n.type === "solana") {
          const r = await Chain.rpc(id, "getTokenAccountsByOwner", [owner, { mint: ca }, { encoding: "jsonParsed" }]);
          let total = 0n, dec = 0;
          r.value.forEach((acc) => {
            const t = acc.account.data.parsed.info.tokenAmount;
            total += BigInt(t.amount); dec = t.decimals;
          });
          return Chain.format(total, dec);
        }
        const data = "0x70a08231" + owner.toLowerCase().replace(/^0x/, "").padStart(64, "0");
        const dec = await Chain.evmDecimals(id, ca, provider);
        const raw = await Chain.evmCall(id, ca, data, provider);
        return Chain.format(raw, dec);
      } catch { return null; }
    },
  };

  window.Chain = Chain;
})();
