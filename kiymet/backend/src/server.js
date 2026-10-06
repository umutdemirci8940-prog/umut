import http from 'node:http';
import { WebSocketServer } from 'ws';
import { config } from './config.js';
import { catalog, registerStock } from './instruments.js';
import { recomputeMetals } from './metals.js';
import { PriceStore } from './store.js';
import { startBinanceGold } from './providers/binance.js';
import { startBtcturk } from './providers/btcturk.js';
import { demoCpiSeries, startDemo } from './providers/demo.js';
import { startEodhd } from './providers/eodhd.js';
import { fetchCpiSeries } from './providers/evds.js';
import { startTcmb } from './providers/tcmb.js';
import { startTwelveData } from './providers/twelvedata.js';

const STOCK_CODE = /^[A-Z0-9]{3,6}$/;

export function createServer(options = {}) {
  const cfg = { ...config, ...options };
  const store = new PriceStore();
  const stops = [];
  let cpi = { series: [], source: null, updatedAt: null };

  // Ham değerler (ons, kur) değiştikçe altın/gümüş ürünlerini yeniden hesapla.
  let metalsPending = false;
  store.on('raw', () => {
    if (metalsPending) return;
    metalsPending = true;
    queueMicrotask(() => {
      metalsPending = false;
      recomputeMetals(store);
    });
  });

  const startProviders = () => {
    if (cfg.dataMode === 'demo') {
      stops.push(startDemo(store));
      cpi = { series: demoCpiSeries(), source: 'demo', updatedAt: new Date().toISOString() };
      return;
    }
    stops.push(startBtcturk(store));
    if (cfg.twelveData.apiKey) {
      stops.push(startTwelveData(store));
    } else {
      console.warn('TWELVEDATA_API_KEY yok: döviz TCMB günlük kurundan, ons altın PAXG üzerinden yaklaşık alınacak, gümüş olmayacak.');
      stops.push(startTcmb(store));
      stops.push(startBinanceGold(store));
    }
    if (cfg.stocks.eodhdApiKey) {
      stops.push(startEodhd(store));
    } else {
      console.warn('EODHD_API_KEY yok: hisse fiyatları gelmeyecek.');
    }
    if (cfg.evds.apiKey) {
      const refresh = async () => {
        try {
          cpi = { series: await fetchCpiSeries(), source: 'tcmb-evds', updatedAt: new Date().toISOString() };
        } catch (err) {
          console.warn(`[evds] hata: ${err.message}`);
        }
      };
      refresh();
      const t = setInterval(refresh, cfg.evds.refreshMs);
      stops.push(() => clearInterval(t));
    } else {
      console.warn('EVDS_API_KEY yok: reel getiri hesabı için enflasyon verisi olmayacak.');
    }
  };

  const sendJson = (res, status, body) => {
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'no-store',
    });
    res.end(JSON.stringify(body));
  };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    switch (url.pathname) {
      case '/health':
        return sendJson(res, 200, { ok: true, mode: cfg.dataMode, prices: store.all().length });
      case '/instruments':
        return sendJson(res, 200, { instruments: catalog() });
      case '/prices': {
        const ids = url.searchParams.get('ids')?.split(',');
        const prices = ids ? ids.map((id) => store.get(id)).filter(Boolean) : store.all();
        return sendJson(res, 200, { prices });
      }
      case '/inflation':
        return sendJson(res, 200, cpi);
      default:
        return sendJson(res, 404, { error: 'bulunamadı' });
    }
  });

  // --- WebSocket: bağlanınca anlık görüntü, sonra toplu güncellemeler ---
  const wss = new WebSocketServer({ server, path: '/ws' });
  const pending = new Map();
  store.on('update', (record) => pending.set(record.id, record));

  wss.on('connection', (socket) => {
    socket.isAlive = true;
    socket.on('pong', () => (socket.isAlive = true));
    socket.send(JSON.stringify({ type: 'snapshot', prices: store.all() }));

    socket.on('message', (data) => {
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }
      // Kullanıcının portföyünde olup katalogda olmayan hisseleri izlemeye al.
      if (msg?.type === 'watch' && Array.isArray(msg.ids)) {
        for (const id of msg.ids.slice(0, 100)) {
          const [type, code] = String(id).split(':');
          if (type === 'STOCK' && STOCK_CODE.test(code ?? '')) registerStock(code);
        }
      }
    });
  });

  const broadcast = setInterval(() => {
    if (pending.size === 0) return;
    const payload = JSON.stringify({ type: 'prices', prices: [...pending.values()] });
    pending.clear();
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) client.send(payload);
    }
  }, cfg.broadcastIntervalMs);

  // Kopan bağlantıları temizle
  const heartbeat = setInterval(() => {
    for (const client of wss.clients) {
      if (!client.isAlive) {
        client.terminate();
        continue;
      }
      client.isAlive = false;
      client.ping();
    }
  }, 30000);

  return {
    store,
    server,
    listen(port = cfg.port) {
      startProviders();
      return new Promise((resolve) => server.listen(port, () => resolve(server.address().port)));
    },
    async close() {
      stops.forEach((stop) => stop());
      clearInterval(broadcast);
      clearInterval(heartbeat);
      for (const client of wss.clients) client.terminate();
      wss.close();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const port = await app.listen();
  console.log(`Kıymet veri servisi çalışıyor: http://localhost:${port} (mod: ${config.dataMode})`);
  const shutdown = () => app.close().then(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
