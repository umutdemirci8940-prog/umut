/**
 * Belirli aralıklarla çalışan, hataları loglayıp devam eden basit zamanlayıcı.
 * Art arda hata olursa bekleme süresini (en fazla 5 kat) uzatır.
 */
export function startPoller(name, intervalMs, task) {
  let failures = 0;
  let timer = null;
  let stopped = false;

  const run = async () => {
    try {
      await task();
      if (failures > 0) console.log(`[${name}] tekrar çalışıyor`);
      failures = 0;
    } catch (err) {
      failures += 1;
      if (failures === 1 || failures % 10 === 0) {
        console.warn(`[${name}] hata (${failures}. kez): ${err.message}`);
      }
    }
    if (!stopped) {
      timer = setTimeout(run, intervalMs * Math.min(1 + failures, 5));
    }
  };

  run();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}

export async function fetchJson(url, options = {}) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${new URL(url).host})`);
  return res.json();
}

export const num = (v) => {
  const n = typeof v === 'number' ? v : Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
