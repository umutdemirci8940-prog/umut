import { config } from './config.js';
import { GOLD_PRODUCTS, SILVER_PRODUCTS } from './metals.js';

// Uygulamanın "Varlık ekle" ekranında gösterilen katalog.
// id biçimi: <TÜR>:<KOD>  (ör. CRYPTO:BTC, METAL:CEYREK, FX:USD, STOCK:THYAO)

const CRYPTO_NAMES = {
  BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Tether', SOL: 'Solana', XRP: 'XRP',
  AVAX: 'Avalanche', DOGE: 'Dogecoin', ADA: 'Cardano', BNB: 'BNB', LINK: 'Chainlink',
};

export const CURRENCIES = [
  { code: 'USD', name: 'Amerikan Doları' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'İngiliz Sterlini' },
  { code: 'CHF', name: 'İsviçre Frangı' },
];

const dynamicCrypto = new Set();

/** BtcTurk'te görülen yeni TRY paritelerini kataloğa ekler. */
export function registerCrypto(code) {
  dynamicCrypto.add(code);
}

const dynamicStocks = new Set();

/** Kullanıcının izlemek istediği listede olmayan hisseyi kataloğa ekler. */
export function registerStock(code) {
  dynamicStocks.add(code);
}

export function stockSymbols() {
  return [...new Set([...config.stocks.symbols, ...dynamicStocks])];
}

export function catalog() {
  const metals = [...GOLD_PRODUCTS, ...SILVER_PRODUCTS].map((p) => ({
    id: `METAL:${p.id}`,
    type: 'metal',
    code: p.id,
    name: p.name,
    unit: p.unit,
  }));

  const currencies = CURRENCIES.map((c) => ({
    id: `FX:${c.code}`,
    type: 'currency',
    code: c.code,
    name: c.name,
    unit: c.code,
  }));

  const featured = config.crypto.featured;
  const cryptoCodes = [...featured, ...[...dynamicCrypto].filter((c) => !featured.includes(c)).sort()];
  const crypto = cryptoCodes.map((code) => ({
    id: `CRYPTO:${code}`,
    type: 'crypto',
    code,
    name: CRYPTO_NAMES[code] ?? code,
    unit: code,
    featured: featured.includes(code),
  }));

  const stocks = stockSymbols().map((code) => ({
    id: `STOCK:${code}`,
    type: 'stock',
    code,
    name: code,
    unit: 'lot',
  }));

  return [...metals, ...currencies, ...crypto, ...stocks];
}
