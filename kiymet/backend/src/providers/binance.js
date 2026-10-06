import { config } from '../config.js';
import { fetchJson, num, startPoller } from './poller.js';

// Twelve Data anahtarı yokken ons altın için YAKLAŞIK kaynak:
// PAXG, 1 ons altına endeksli bir tokendir; fiyatı spot altına yakın seyreder.
// Canlı yayında lisanslı bir altın verisiyle değiştirilmelidir.

export function startBinanceGold(store) {
  return startPoller('binance-paxg', config.binance.pollMs, async () => {
    const t = await fetchJson(`${config.binance.baseUrl}/api/v3/ticker/24hr?symbol=PAXGUSDT`);
    const price = num(t.lastPrice);
    if (price == null) throw new Error('PAXGUSDT fiyatı yok');
    store.setRaw('XAUUSD', { price, prevClose: num(t.openPrice), source: 'binance-paxg', priority: 0 });
  });
}
