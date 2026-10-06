import assert from 'node:assert/strict';
import { test } from 'node:test';
import WebSocket from 'ws';
import { createServer } from '../src/server.js';

test('demo modunda REST ve WebSocket uçtan uca çalışır', async () => {
  const app = createServer({ dataMode: 'demo', broadcastIntervalMs: 50 });
  const port = await app.listen(0);
  try {
    const base = `http://127.0.0.1:${port}`;

    const { instruments } = await (await fetch(`${base}/instruments`)).json();
    const ids = new Set(instruments.map((i) => i.id));
    for (const id of ['METAL:CEYREK', 'METAL:GRAM_GUMUS', 'FX:USD', 'CRYPTO:BTC', 'STOCK:THYAO']) {
      assert.ok(ids.has(id), `${id} katalogda olmalı`);
    }

    const { prices } = await (await fetch(`${base}/prices?ids=METAL:CEYREK,CRYPTO:BTC`)).json();
    assert.equal(prices.length, 2);
    assert.ok(prices.every((p) => p.price > 0));

    const inflation = await (await fetch(`${base}/inflation`)).json();
    assert.ok(inflation.series.length > 12);

    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    const messages = [];
    await new Promise((resolve, reject) => {
      ws.on('message', (data) => {
        messages.push(JSON.parse(data.toString()));
        if (messages.length === 2) resolve();
      });
      ws.on('error', reject);
      setTimeout(() => reject(new Error('mesaj gelmedi')), 5000);
    });
    ws.close();
    assert.equal(messages[0].type, 'snapshot');
    assert.ok(messages[0].prices.some((p) => p.id === 'METAL:GRAM_ALTIN'));
    assert.equal(messages[1].type, 'prices');
  } finally {
    await app.close();
  }
});
