import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseBtcturkTickers } from '../src/providers/btcturk.js';
import { parseEodhd } from '../src/providers/eodhd.js';
import { parseEvdsCpi } from '../src/providers/evds.js';
import { parseTcmbXml } from '../src/providers/tcmb.js';
import { parseTwelveDataQuotes } from '../src/providers/twelvedata.js';

test('BtcTurk: yalnızca TRY pariteleri alınır', () => {
  const body = {
    data: [
      { pair: 'BTCTRY', numeratorSymbol: 'BTC', denominatorSymbol: 'TRY', last: 5000000, open: 4900000 },
      { pair: 'BTCUSDT', numeratorSymbol: 'BTC', denominatorSymbol: 'USDT', last: 120000, open: 119000 },
    ],
  };
  assert.deepEqual(parseBtcturkTickers(body), [{ code: 'BTC', price: 5000000, prevClose: 4900000 }]);
});

test('TCMB XML: birim (ör. 100 JPY) dikkate alınır', () => {
  const xml = `
    <Tarih_Date>
      <Currency CrossOrder="0" Kod="USD" CurrencyCode="USD"><Unit>1</Unit><ForexSelling>41.6120</ForexSelling></Currency>
      <Currency CrossOrder="9" Kod="JPY" CurrencyCode="JPY"><Unit>100</Unit><ForexSelling>28.10</ForexSelling></Currency>
    </Tarih_Date>`;
  const rates = parseTcmbXml(xml);
  assert.equal(rates.USD, 41.612);
  assert.ok(Math.abs(rates.JPY - 0.281) < 1e-12);
});

test('Twelve Data: çoklu ve tekli yanıt biçimleri', () => {
  const multi = {
    'USD/TRY': { close: '41.50', previous_close: '41.40' },
    'XAU/USD': { status: 'error', message: 'x' },
  };
  assert.deepEqual(parseTwelveDataQuotes(multi, ['USD/TRY', 'XAU/USD']), {
    'USD/TRY': { price: 41.5, prevClose: 41.4 },
  });
  assert.deepEqual(parseTwelveDataQuotes({ close: '3900' }, ['XAU/USD']), {
    'XAU/USD': { price: 3900, prevClose: null },
  });
});

test('EODHD: tekli/çoklu yanıt, sembol eki atılır', () => {
  assert.deepEqual(parseEodhd({ code: 'THYAO.IS', close: 300.5, previousClose: 295 }), [
    { code: 'THYAO', price: 300.5, prevClose: 295 },
  ]);
  assert.equal(parseEodhd([{ code: 'GARAN.IS', close: 'NA' }]).length, 0);
});

test('EVDS: TÜFE serisi aylara göre sıralanır', () => {
  const body = {
    items: [
      { Tarih: '2024-2', TP_FG_J0: '2000.5' },
      { Tarih: '2024-1', TP_FG_J0: '1984.0' },
      { Tarih: '2024-3', TP_FG_J0: null },
    ],
  };
  assert.deepEqual(parseEvdsCpi(body, 'TP.FG.J0'), [
    { month: '2024-01', index: 1984 },
    { month: '2024-02', index: 2000.5 },
  ]);
});
