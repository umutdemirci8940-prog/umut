#!/usr/bin/env python3
"""Kıymet fiyat yayıncısı: yalnızca ücretsiz ve kullanım koşulları uygun kaynaklardan
fiyatları toplar ve uygulamanın okuyacağı statik JSON dosyalarını üretir.

Kaynaklar (her biri uygulamada kaynak olarak gösterilir):
  • Döviz:   TCMB gösterge kurları (today.xml + günlük arşiv)
  • Altın:   TCMB EVDS (koşullar: kaynak gösterilerek ticari amaçla dahi kullanılabilir)
  • TÜFE:    OECD (TÜİK verisi) + BIS ile güncel aylar
  • Kripto:  CoinPaprika (ENABLE_CRYPTO=1 olduğunda; yazılı onay alındıktan sonra açılır)

Kullanım:
  EVDS_API_KEY=... python3 build_feed.py --out site/data
  EVDS_API_KEY=... python3 build_feed.py --discover      # EVDS'deki altın/gümüş serilerini listeler
"""
import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timedelta, timezone

UA = {"User-Agent": "Kiymet-Feed/1.0"}
EVDS_BASE = os.environ.get("EVDS_BASE", "https://evds2.tcmb.gov.tr/service/evds")
EVDS_KEY = os.environ.get("EVDS_API_KEY", "")
GOLD_SERIES = os.environ.get("GOLD_SERIES", "")          # gram (24 ayar) altın TL fiyatı serisi
GOLD_PURITY = float(os.environ.get("GOLD_PURITY", "0.995"))  # serinin saflığı
SILVER_SERIES = os.environ.get("SILVER_SERIES", "")      # gram gümüş TL fiyatı serisi (varsa)
ENABLE_CRYPTO = os.environ.get("ENABLE_CRYPTO", "0") == "1"
CRYPTO = ["BTC", "ETH", "USDT", "SOL", "XRP", "AVAX", "DOGE", "ADA", "BNB", "LINK"]
PAPRIKA_IDS = {
    "BTC": "btc-bitcoin", "ETH": "eth-ethereum", "USDT": "usdt-tether", "SOL": "sol-solana",
    "XRP": "xrp-xrp", "AVAX": "avax-avalanche", "DOGE": "doge-dogecoin", "ADA": "ada-cardano",
    "BNB": "bnb-binance-coin", "LINK": "link-chainlink",
}
CURRENCIES = ["USD", "EUR", "GBP", "CHF"]

# Uygulamadaki ürünlerle aynı katsayılar (app/lib/logic/metals.dart)
GOLD_PRODUCTS = [
    ("GRAM_ALTIN", 1, 0.995), ("CEYREK", 1.754, 0.916), ("YARIM", 3.508, 0.916), ("TAM", 7.016, 0.916),
    ("CUMHURIYET", 7.216, 0.916), ("GREMSE", 17.54, 0.916), ("AYAR22", 1, 0.916), ("AYAR18", 1, 0.75),
    ("AYAR14", 1, 0.585),
]


def get(url, headers=None, timeout=30):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8-sig")


def evds(path):
    return json.loads(get(f"{EVDS_BASE}/{path}", {"key": EVDS_KEY}))


# ---------------- TCMB döviz ----------------
def parse_tcmb(xml):
    out = {}
    for code, body in re.findall(r'<Currency[^>]*Kod="([A-Z]{3})"[^>]*>(.*?)</Currency>', xml, re.S):
        unit = re.search(r"<Unit>([^<]*)</Unit>", body)
        sell = re.search(r"<ForexSelling>([^<]*)</ForexSelling>", body)
        try:
            out[code] = float(sell.group(1)) / float(unit.group(1) if unit else 1)
        except (AttributeError, ValueError):
            pass
    return out


def tcmb_on(d):
    try:
        return parse_tcmb(get(f"https://www.tcmb.gov.tr/kurlar/{d:%Y%m}/{d:%d%m%Y}.xml"))
    except Exception:
        return {}


def fx_prices():
    today = parse_tcmb(get("https://www.tcmb.gov.tr/kurlar/today.xml"))
    prev = {}
    for back in range(1, 8):  # bir önceki yayın günü
        prev = tcmb_on(date.today() - timedelta(days=back))
        if prev and prev.get("USD") != today.get("USD"):
            break
    return [price(f"FX:{c}", today[c], prev.get(c), "TCMB", delayed=True) for c in CURRENCIES if c in today]


# ---------------- EVDS altın ----------------
def evds_series(code, start):
    end = date.today()
    body = evds(f"series={code}&startDate={start:%d-%m-%Y}&endDate={end:%d-%m-%Y}&type=json")
    field = code.replace(".", "_")
    out = {}
    for item in body.get("items", []):
        v, t = item.get(field), item.get("Tarih", "")
        try:
            d = datetime.strptime(t, "%d-%m-%Y").date()
            out[d.isoformat()] = float(v)
        except (TypeError, ValueError):
            continue
    return out


def metal_prices(history):
    out = []
    if not (EVDS_KEY and GOLD_SERIES):
        print("::warning::EVDS_API_KEY veya GOLD_SERIES yok; altın fiyatı üretilmedi")
        return out
    start = date(2005, 1, 1) if "METAL:GRAM_ALTIN" not in history else date.today() - timedelta(days=21)
    gold = evds_series(GOLD_SERIES, start)
    if not gold:
        print("::warning::EVDS altın serisi boş döndü")
        return out
    days = sorted(gold)
    pure_now = gold[days[-1]] / GOLD_PURITY
    pure_prev = gold[days[-2]] / GOLD_PURITY if len(days) > 1 else None
    for code, weight, purity in GOLD_PRODUCTS:
        out.append(price(f"METAL:{code}", pure_now * weight * purity,
                         pure_prev * weight * purity if pure_prev else None, "TCMB EVDS", delayed=True, day=days[-1]))
    # Geçmiş: günlük gram (24 ayar) fiyatları; diğer ürünler uygulamada katsayıyla türetilir
    history.setdefault("METAL:GRAM_ALTIN", {}).update({d: round(v / GOLD_PURITY * 0.995, 4) for d, v in gold.items()})
    if SILVER_SERIES:
        silver = evds_series(SILVER_SERIES, date.today() - timedelta(days=21))
        if silver:
            sd = sorted(silver)
            out.append(price("METAL:GRAM_GUMUS", silver[sd[-1]], silver[sd[-2]] if len(sd) > 1 else None,
                             "TCMB EVDS", delayed=True, day=sd[-1]))
            history.setdefault("METAL:GRAM_GUMUS", {}).update(silver)
    return out


# ---------------- CoinPaprika kripto ----------------
def crypto_prices():
    if not ENABLE_CRYPTO:
        return []
    out = []
    for code in CRYPTO:
        t = json.loads(get(f"https://api.coinpaprika.com/v1/tickers/{PAPRIKA_IDS[code]}?quotes=TRY"))
        q = t["quotes"]["TRY"]
        p, pct = float(q["price"]), q.get("percent_change_24h")
        prev = p / (1 + pct / 100) if pct is not None else None
        out.append(price(f"CRYPTO:{code}", p, prev, "CoinPaprika"))
    return out


# ---------------- TÜFE ----------------
def cpi():
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path[:0] = [here, os.path.join(here, "..", "app", "tool")]  # site reposunda yan yana durur
    import fetch_cpi  # noqa: E402  (OECD + BIS zincirleme)
    tmp = os.path.join(os.environ.get("RUNNER_TEMP", "/tmp"), "cpi_feed.json")
    fetch_cpi.OUT = tmp
    fetch_cpi.main()
    try:
        with open(tmp, encoding="utf-8") as f:
            return json.load(f)
    except OSError:
        return None


def price(id_, p, prev, source, delayed=False, day=None):
    rec = {"id": id_, "price": round(p, 6), "prevClose": round(prev, 6) if prev else None,
           "changePct": round((p - prev) / prev * 100, 4) if prev else None, "source": source,
           "ts": int(datetime.now(timezone.utc).timestamp() * 1000), "delayed": delayed}
    if day:
        rec["asOf"] = day
    return rec


def discover():
    cats = evds("categories/type=json")
    for c in cats:
        groups = evds(f"datagroups/mode=2&code={c['CATEGORY_ID']}&type=json")
        for g in groups:
            name = f"{g.get('DATAGROUP_NAME', '')} {g.get('DATAGROUP_NAME_ENG', '')}"
            if re.search(r"alt[ıi]n|gold|g[üu]m[üu][şs]|silver|k[ıi]ymetli|borsa|bist|hisse|stock|equity|endeks|index", name, re.I):
                print(f"\n# {g['DATAGROUP_CODE']}: {name.strip()} ({g.get('FREQUENCY_STR', '')})")
                for s in evds(f"serieList/type=json&code={g['DATAGROUP_CODE']}"):
                    print(f"  {s['SERIE_CODE']}: {s.get('SERIE_NAME', '')} | {s.get('SERIE_NAME_ENG', '')}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="site/data")
    ap.add_argument("--history-url", default="", help="Önceki history.json (birikimli geçmiş için)")
    ap.add_argument("--discover", action="store_true")
    a = ap.parse_args()
    if a.discover:
        discover()
        return 0

    history = {}
    if a.history_url:
        try:
            history = json.loads(get(a.history_url)).get("series", {})
        except Exception as e:  # noqa: BLE001
            print(f"Önceki geçmiş alınamadı ({e}); sıfırdan başlanıyor")

    prices, sources = [], []
    for name, fn in [("Döviz", fx_prices), ("Altın", lambda: metal_prices(history)), ("Kripto", crypto_prices)]:
        try:
            got = fn()
            prices += got
            print(f"{name}: {len(got)} fiyat")
        except Exception as e:  # noqa: BLE001
            print(f"::warning::{name} alınamadı: {e}")

    # Günlük kapanışları geçmişe ekle (alış tarihindeki fiyatı otomatik doldurmak için)
    today = date.today().isoformat()
    for p in prices:
        if p["id"].startswith("CRYPTO:"):
            history.setdefault(p["id"], {})[today] = p["price"]

    os.makedirs(a.out, exist_ok=True)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    cpi_data = cpi()
    feed = {
        "updatedAt": now,
        "attribution": "Kaynaklar: TCMB, TCMB EVDS, OECD, BIS" + (", CoinPaprika" if ENABLE_CRYPTO else ""),
        "prices": prices,
        "cpi": cpi_data,
    }
    with open(os.path.join(a.out, "prices.json"), "w", encoding="utf-8") as f:
        json.dump(feed, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(a.out, "history.json"), "w", encoding="utf-8") as f:
        json.dump({"updatedAt": now, "series": history}, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Yazıldı: {len(prices)} fiyat, {sum(len(v) for v in history.values())} geçmiş kayıt")
    return 0 if prices else 1


if __name__ == "__main__":
    sys.exit(main())
