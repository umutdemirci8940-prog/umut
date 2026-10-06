import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GOLD_PRODUCTS, pureGramTry, productValueTry, recomputeMetals } from '../src/metals.js';
import { PriceStore } from '../src/store.js';

const product = (id) => GOLD_PRODUCTS.find((p) => p.id === id);

test('saf gram fiyatı = ons × kur / 31,1035', () => {
  assert.ok(Math.abs(pureGramTry(3110.34768, 40) - 4000) < 1e-9);
  assert.equal(pureGramTry(0, 40), null);
  assert.equal(pureGramTry(3000, undefined), null);
});

test('çeyrek altın has değeri: 1,754 g × 0,916', () => {
  const pure = 4000;
  const value = productValueTry(product('CEYREK'), 3110.34768, 40);
  assert.ok(Math.abs(value - pure * 1.754 * 0.916) < 1e-6);
});

test('yarım = 2 çeyrek, tam = 2 yarım', () => {
  const v = (id) => productValueTry(product(id), 3900, 41.5);
  assert.ok(Math.abs(v('YARIM') - 2 * v('CEYREK')) < 1e-6);
  assert.ok(Math.abs(v('TAM') - 2 * v('YARIM')) < 1e-6);
});

test('recomputeMetals ham değerlerden ürün fiyatı ve değişim yüzdesi üretir', () => {
  const store = new PriceStore();
  store.setRaw('USDTRY', { price: 40, prevClose: 40, source: 't' });
  store.setRaw('XAUUSD', { price: 3110.34768, prevClose: 3110.34768 / 1.02, source: 't' });
  store.setRaw('XAGUSD', { price: 31.1034768, source: 't' });
  recomputeMetals(store);

  const gram = store.get('METAL:GRAM_ALTIN');
  assert.ok(Math.abs(gram.price - 4000 * 0.995) < 1e-6);
  assert.ok(Math.abs(gram.changePct - 2) < 1e-9);

  const silver = store.get('METAL:GRAM_GUMUS');
  assert.ok(Math.abs(silver.price - 40 * 0.999) < 1e-9);
  assert.equal(silver.changePct, null);
});

test('düşük öncelikli kaynak yüksek öncelikli taze değeri ezmez', () => {
  const store = new PriceStore();
  store.setRaw('USDTRY', { price: 41, source: 'twelvedata', priority: 2 });
  store.setRaw('USDTRY', { price: 42, source: 'btcturk-usdt', priority: 0 });
  assert.equal(store.getRaw('USDTRY').price, 41);
});
