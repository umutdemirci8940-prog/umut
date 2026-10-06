import { config } from '../config.js';
import { CURRENCIES } from '../instruments.js';
import { fetchJson, num, startPoller } from './poller.js';

// Twelve Data: döviz ve ons altın/gümüş. Ticari kullanım ve yeniden dağıtım
// koşullarını planınızda kontrol edin.

export function parseTwelveDataQuotes(body, symbols) {
  // Tek sembolde yanıt düz nesne, çoklu sembolde sembol -> nesne haritasıdır.
  const map = symbols.length === 1 ? { [symbols[0]]: body } : body;
  const out = {};
  for (const sym of symbols) {
    const q = map?.[sym];
    if (!q || q.status === 'error') continue;
    const price = num(q.close);
    if (price == null) continue;
    out[sym] = { price, prevClose: num(q.previous_close) };
  }
  return out;
}

export function startTwelveData(store) {
  const { apiKey, baseUrl, pollMs } = config.twelveData;
  const fxSymbols = CURRENCIES.map((c) => `${c.code}/TRY`);
  const symbols = [...fxSymbols, 'XAU/USD', 'XAG/USD'];

  return startPoller('twelvedata', pollMs, async () => {
    const url = `${baseUrl}/quote?symbol=${encodeURIComponent(symbols.join(','))}&apikey=${apiKey}`;
    const body = await fetchJson(url);
    if (body?.status === 'error') throw new Error(body.message);
    const quotes = parseTwelveDataQuotes(body, symbols);

    for (const c of CURRENCIES) {
      const q = quotes[`${c.code}/TRY`];
      if (!q) continue;
      store.set(`FX:${c.code}`, { ...q, source: 'twelvedata' });
      if (c.code === 'USD') store.setRaw('USDTRY', { ...q, source: 'twelvedata', priority: 2 });
    }
    if (quotes['XAU/USD']) store.setRaw('XAUUSD', { ...quotes['XAU/USD'], source: 'twelvedata', priority: 2 });
    if (quotes['XAG/USD']) store.setRaw('XAGUSD', { ...quotes['XAG/USD'], source: 'twelvedata', priority: 2 });
  });
}
