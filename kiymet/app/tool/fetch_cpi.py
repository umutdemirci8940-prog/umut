#!/usr/bin/env python3
"""OECD'den Türkiye aylık TÜFE endeksini indirip uygulamaya gömülecek JSON'u yazar.

Uygulama açılışta güncel veriyi kendisi de çeker; bu dosya ilk açılış ve çevrimdışı
kullanım içindir. İndirme başarısız olursa mevcut dosya korunur (derleme durmaz).
"""
import csv
import io
import json
import sys
import urllib.request
from datetime import datetime, timezone

URL = (
    "https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0/"
    "TUR.M.N.CPI.IX._T.N._Z?startPeriod=2005-01&format=csvfile"
)
OUT = sys.argv[1] if len(sys.argv) > 1 else "assets/data/cpi_tr.json"


def main() -> int:
    try:
        req = urllib.request.Request(URL, headers={"User-Agent": "Kiymet/1.0"})
        text = urllib.request.urlopen(req, timeout=60).read().decode("utf-8-sig")
    except Exception as exc:  # noqa: BLE001
        print(f"::warning::OECD TÜFE indirilemedi: {exc}")
        return 0

    rows = list(csv.DictReader(io.StringIO(text)))
    series = {}
    for row in rows:
        month, value = row.get("TIME_PERIOD", ""), row.get("OBS_VALUE", "")
        try:
            series[month[:7]] = float(value)
        except ValueError:
            continue

    if len(series) < 100:
        print(f"::warning::OECD yanıtı beklenenden kısa ({len(series)} ay), dosya korunuyor")
        print(text[:500])
        return 0

    data = {
        "source": "OECD (TÜİK TÜFE, 2015=100)",
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "series": [{"month": m, "index": series[m]} for m in sorted(series)],
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=0)
    first, last = data["series"][0], data["series"][-1]
    print(f"TÜFE: {len(series)} ay, {first['month']}={first['index']} … {last['month']}={last['index']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
