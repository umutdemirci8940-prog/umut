import { config } from '../config.js';
import { fetchJson, num } from './poller.js';

// TCMB EVDS'den aylık TÜFE endeksi. Reel (enflasyondan arındırılmış) getiri hesabının temeli.
// Ücretsiz API anahtarı: https://evds2.tcmb.gov.tr (üye ol -> profil -> API anahtarı)

const pad = (n) => String(n).padStart(2, '0');

export function parseEvdsCpi(body, series) {
  const field = series.replaceAll('.', '_');
  const out = [];
  for (const item of body?.items ?? []) {
    // Tarih biçimi "2024-1" veya "2024-01"
    const [y, m] = String(item.Tarih ?? '').split('-');
    const index = num(item[field]);
    if (!y || !m || index == null) continue;
    out.push({ month: `${y}-${pad(m)}`, index });
  }
  return out.sort((a, b) => a.month.localeCompare(b.month));
}

export async function fetchCpiSeries() {
  const { apiKey, baseUrl, cpiSeries } = config.evds;
  const now = new Date();
  const end = `01-${pad(now.getUTCMonth() + 1)}-${now.getUTCFullYear()}`;
  const url = `${baseUrl}/series=${cpiSeries}&startDate=01-01-2015&endDate=${end}&type=json`;
  const body = await fetchJson(url, { headers: { key: apiKey } });
  const series = parseEvdsCpi(body, cpiSeries);
  if (series.length === 0) throw new Error('EVDS boş yanıt döndü');
  return series;
}
