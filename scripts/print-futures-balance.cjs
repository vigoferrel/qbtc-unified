#!/usr/bin/env node
/*
  Imprime balances de cuenta de Binance Futures (v2 account):
  - Lista assets con walletBalance y availableBalance
  - Destaca USDT y totales útiles para allocation
*/
const fs = require('fs');
const path = require('path');
const { BinanceRealConnector } = require('../quantum-core/BinanceRealConnector');

function loadDotEnvIfPresent(envPath) {
  try {
    if (!envPath) return;
    const full = path.resolve(envPath);
    if (!fs.existsSync(full)) return;
    const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx < 1) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}

async function main() {
  const envFile = process.argv[2] || path.join(__dirname, '..', 'quantum-core', '.env');
  loadDotEnvIfPresent(envFile);
  if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_SECRET_KEY) {
    console.log(JSON.stringify({ error: 'MISSING_KEYS', message: 'Faltan BINANCE_API_KEY/SECRET en entorno' }, null, 2));
    process.exit(2);
  }
  const conn = new BinanceRealConnector();
  await conn.testConnection();
  const acct = await conn.getAccountInfo(); // fapi/v2/account
  const assets = Array.isArray(acct.assets) ? acct.assets : [];
  const byAsset = assets.map(a => ({
    asset: a.asset,
    walletBalance: parseFloat(a.walletBalance || '0'),
    availableBalance: parseFloat(a.availableBalance || '0'),
    crossUnPnl: parseFloat(a.crossUnPnl || '0')
  })).filter(x => x.walletBalance !== 0 || x.availableBalance !== 0 || x.crossUnPnl !== 0)
    .sort((a,b)=> a.asset.localeCompare(b.asset));

  const usdt = byAsset.find(x => x.asset === 'USDT') || { walletBalance: 0, availableBalance: 0, crossUnPnl: 0 };
  const totalWallet = byAsset.reduce((s,x)=> s + x.walletBalance, 0);
  const totalAvailable = byAsset.reduce((s,x)=> s + x.availableBalance, 0);
  const totalUnPnl = byAsset.reduce((s,x)=> s + x.crossUnPnl, 0);

  const summary = {
    environment: 'PRODUCTION',
    accountType: acct.accountType || 'FUTURES',
    canTrade: acct.canTrade,
    totals: {
      walletBalance: totalWallet,
      availableBalance: totalAvailable,
      crossUnrealizedPnl: totalUnPnl
    },
    usdt: {
      walletBalance: usdt.walletBalance,
      availableBalance: usdt.availableBalance,
      crossUnPnl: usdt.crossUnPnl
    },
    assets: byAsset
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch(err => {
  const status = err?.response?.status;
  const msg = err?.response?.data?.msg || err.message;
  console.log(JSON.stringify({ error: 'RUNTIME_ERROR', status, message: msg }, null, 2));
  process.exit(1);
});

