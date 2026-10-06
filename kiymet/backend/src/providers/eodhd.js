import { config } from '../config.js';
import { stockSymbols } from '../instruments.js';
import { fetchJson, num, startPoller } from './poller.js';

// BIST hisseleri (EODHD "real-time" uç noktası, 15 dk gecikmeli).
// Borsa İstanbul verisini uygulamada göstermek için sağlayıcınızın
// yeniden dağıtım (display/redistribution) lisansı vermesi gerekir.

export function parseEodhd(body) {
  const items = Array.isArray(body) ? body : [body];
  const out = [];
  for (const q of items) {
    const code = String(q?.code ?? '').split('.')[0];
    const price = num(q?.close);
    if (!code || price == null) continue;
    out.push({ code, price, prevClose: num(q.previousClose) });
  }
  return out;
}

export function startEodhd(store) {
  const { eodhdApiKey, eodhdBaseUrl, exchangeSuffix, pollMs } = config.stocks;
  return startPoller('eodhd', pollMs, async () => {
    const symbols = stockSymbols().map((s) => `${s}.${exchangeSuffix}`);
    if (symbols.length === 0) return;
    const [first, ...rest] = symbols;
    const url =
      `${eodhdBaseUrl}/real-time/${first}?api_token=${eodhdApiKey}&fmt=json` +
      (rest.length ? `&s=${rest.join(',')}` : '');
    for (const q of parseEodhd(await fetchJson(url))) {
      store.set(`STOCK:${q.code}`, { price: q.price, prevClose: q.prevClose, source: 'eodhd', delayed: true });
    }
  });
}
