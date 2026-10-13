#!/usr/bin/env python3
"""Türkiye aylık TÜFE endeksini anahtarsız kaynaklardan indirip uygulamaya gömülecek JSON'u yazar.

Temel seri OECD'dir (TÜİK TÜFE, 2015=100, uzun geçmiş). OECD'nin henüz yayımlamadığı son aylar,
güncel olan diğer kaynakların (BIS, Eurostat) AYLIK DEĞİŞİM ORANLARIYLA zincirlenerek eklenir;
böylece TÜİK'in baz yılı değişikliği hesabı bozmaz. Hiçbir kaynak erişilemezse mevcut dosya korunur.
"""
import csv
import io
import json
import sys
import urllib.request
from datetime import datetime, timezone

OUT = sys.argv[1] if len(sys.argv) > 1 else "assets/data/cpi_tr.json"
UA = {"User-Agent": "Kiymet/1.0"}


def get(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=60).read().decode("utf-8-sig")


def sdmx_csv(text: str) -> dict:
    out = {}
    for row in csv.DictReader(io.StringIO(text)):
        month, value = row.get("TIME_PERIOD", ""), row.get("OBS_VALUE", "")
        try:
            out[month[:7]] = float(value)
        except ValueError:
            pass
    return out


def oecd() -> dict:
    return sdmx_csv(get(
        "https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0/"
        "TUR.M.N.CPI.IX._T.N._Z?startPeriod=2005-01&format=csvfile"))


def bis() -> dict:
    # BIS uzun dönem TÜFE, Türkiye, endeks (628)
    return sdmx_csv(get("https://stats.bis.org/api/v1/data/WS_LONG_CPI/M.TR.628?startPeriod=2015-01&format=csv"))


def eurostat() -> dict:
    # Eurostat HICP (uyumlaştırılmış TÜFE), Türkiye, genel endeks
    data = json.loads(get(
        "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_midx"
        "?format=JSON&lang=EN&geo=TR&coicop=CP00&unit=I15&sinceTimePeriod=2015-01"))
    index = data["dimension"]["time"]["category"]["index"]
    values = data.get("value", {})
    out = {}
    for label, pos in index.items():
        v = values.get(str(pos))
        if v is not None:
            out[label.replace("M", "-")[:7]] = float(v)
    return out


def fetch(name, fn):
    try:
        s = fn()
        months = sorted(s)
        print(f"{name}: {len(s)} ay" + (f", {months[0]} … {months[-1]} = {s[months[-1]]}" if s else ""))
        return s
    except Exception as exc:  # noqa: BLE001
        print(f"::warning::{name} indirilemedi: {exc}")
        return {}


def main() -> int:
    base = fetch("OECD", oecd)
    extenders = [("BIS", fetch("BIS", bis)), ("Eurostat HICP", fetch("Eurostat", eurostat))]

    if len(base) < 100:
        print("::warning::OECD temel serisi yok, dosya korunuyor")
        return 0

    series = dict(base)
    notes = []
    for name, ext in extenders:
        last = max(series)
        tail = [m for m in sorted(ext) if m > last]
        if not tail or last not in ext:
            continue
        prev_month, prev_val = last, series[last]
        for m in tail:
            series[m] = prev_val * ext[m] / ext[prev_month]
            prev_month, prev_val = m, series[m]
        notes.append(f"{tail[0]}…{tail[-1]} {name} aylık değişimiyle")
        print(f"{name} ile uzatıldı: {tail[0]} … {tail[-1]}")

    months = sorted(series)
    data = {
        "source": "OECD (TÜİK TÜFE, 2015=100)" + (f"; {', '.join(notes)} uzatıldı" if notes else ""),
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "series": [{"month": m, "index": round(series[m], 4)} for m in months],
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=0)
    print(f"TÜFE yazıldı: {len(months)} ay, {months[0]} … {months[-1]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
