import { config } from '../config.js';
import { registerCrypto } from '../instruments.js';
import { fetchJson, num, startPoller } from './poller.js';

// BtcTurk herkese açık ticker uç noktası: tek istekte tüm pariteler gelir.
// Daha düşük gecikme gerekirse BtcTurk WebSocket akışına geçilebilir.

export function parseBtcturkTickers(body) {
  const out = [];
  for (const t of body?.data ?? []) {
    if (t.denominatorSymbol !== 'TRY') continue;
    const last = num(t.last);
    const open = num(t.open);
    if (last == null) continue;
    out.push({ code: t.numeratorSymbol, price: last, prevClose: open });
  }
  return out;
}

export function startBtcturk(store) {
  return startPoller('btcturk', config.btcturk.pollMs, async () => {
    const body = await fetchJson(`${config.btcturk.baseUrl}/api/v2/ticker`);
    for (const t of parseBtcturkTickers(body)) {
      registerCrypto(t.code);
      // BtcTurk "open" son 24 saatin açılışıdır; değişim yüzdesi 24 saatliktir.
      store.set(`CRYPTO:${t.code}`, { price: t.price, prevClose: t.prevClose, source: 'btcturk' });
      if (t.code === 'USDT') {
        // Döviz kaynağı yoksa USD/TRY için yaklaşık değer olarak kullanılır (en düşük öncelik).
        store.setRaw('USDTRY', { price: t.price, prevClose: t.prevClose, source: 'btcturk-usdt', priority: 0 });
      }
    }
  });
}
