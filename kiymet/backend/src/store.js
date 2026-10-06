import { EventEmitter } from 'node:events';

/**
 * Son fiyatların tutulduğu bellek içi önbellek.
 * Fiyatlar TRY cinsindendir; ham kaynak fiyatlar (ör. XAU/USD) ayrı tutulur.
 *
 * Fiyat kaydı: { id, price, prevClose, changePct, source, ts, delayed }
 */
export class PriceStore extends EventEmitter {
  #prices = new Map();
  #raw = new Map();

  /** Bir fiyatı yazar ve değiştiyse 'update' olayı yayar. */
  set(id, { price, prevClose = null, source, delayed = false, ts = Date.now() }) {
    if (!Number.isFinite(price) || price <= 0) return;
    const prev = this.#prices.get(id);
    const record = {
      id,
      price,
      prevClose: Number.isFinite(prevClose) && prevClose > 0 ? prevClose : null,
      changePct: null,
      source,
      ts,
      delayed,
    };
    if (record.prevClose) {
      record.changePct = ((price - record.prevClose) / record.prevClose) * 100;
    }
    this.#prices.set(id, record);
    if (!prev || prev.price !== price || prev.prevClose !== record.prevClose) {
      this.emit('update', record);
    }
  }

  get(id) {
    return this.#prices.get(id);
  }

  all() {
    return [...this.#prices.values()];
  }

  /** Türetilmiş hesaplarda kullanılan ham değerler (ör. XAUUSD, USDTRY). */
  setRaw(key, value) {
    if (!value || !Number.isFinite(value.price) || value.price <= 0) return;
    const old = this.#raw.get(key);
    // Öncelikli kaynak varken daha düşük öncelikli kaynak üzerine yazamaz.
    if (old && (old.priority ?? 0) > (value.priority ?? 0) && Date.now() - old.ts < 10 * 60 * 1000) return;
    this.#raw.set(key, { ts: Date.now(), ...value });
    this.emit('raw', key);
  }

  getRaw(key) {
    return this.#raw.get(key);
  }
}
