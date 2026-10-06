import { config } from '../config.js';
import { CURRENCIES } from '../instruments.js';
import { num, startPoller } from './poller.js';

// TCMB gösterge niteliğindeki günlük kurlar (günde bir kez, 15:30 civarı yayımlanır).
// Yalnızca Twelve Data anahtarı yokken döviz fiyatı olarak kullanılır. Altın hesabında
// gün içi hareketi yakalamak için USD/TRY olarak BtcTurk USDT/TRY tercih edilir.

export function parseTcmbXml(xml) {
  const out = {};
  const re = /<Currency[^>]*Kod="([A-Z]{3})"[^>]*>([\s\S]*?)<\/Currency>/g;
  for (const [, code, body] of xml.matchAll(re)) {
    const unit = num(body.match(/<Unit>([^<]*)<\/Unit>/)?.[1]) ?? 1;
    const selling = num(body.match(/<ForexSelling>([^<]*)<\/ForexSelling>/)?.[1]);
    if (selling) out[code] = selling / unit;
  }
  return out;
}

export function startTcmb(store) {
  return startPoller('tcmb', config.tcmb.pollMs, async () => {
    const res = await fetch(config.tcmb.todayUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const rates = parseTcmbXml(await res.text());
    for (const c of CURRENCIES) {
      if (rates[c.code]) store.set(`FX:${c.code}`, { price: rates[c.code], source: 'tcmb', delayed: true });
    }
  });
}
