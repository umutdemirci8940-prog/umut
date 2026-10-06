# Kıymet

**Tüm kıymetlerin tek yerde.** Altın (gram, çeyrek, yarım, tam, Cumhuriyet, bilezik…), gümüş, döviz,
kripto ve BIST hisselerini tek ekranda takip eden; toplam değeri, kâr/zararı ve enflasyona göre
**reel getiriyi** gösteren mobil uygulama.

| Klasör | İçerik |
|---|---|
| `app/` | Flutter uygulaması (Android + iOS) |
| `backend/` | Node.js canlı fiyat servisi (WebSocket) |
X

## Test APK'sı

Her push'ta `.github/workflows/kiymet-apk.yml` testleri çalıştırır, APK'yı derler ve
`kiymet/release/kiymet.apk` olarak dala ekler. Telefona kurmak için APK'yı açın ve
"bilinmeyen kaynaklardan yüklemeye" izin verin.

## Veri modları

Uygulama iki modda çalışır:

1. **Doğrudan mod (varsayılan, test sürümü):** Sunucu gerekmez. Fiyatlar telefondan herkese açık
   kaynaklardan çekilir: BtcTurk (kripto, USDT/TRY), Binance PAXG ve gold-api.com (ons altın/gümüş),
   TCMB (döviz), Yahoo Finance (BIST, gecikmeli). **Bu kaynakların bir kısmı ticari yayın için
   lisanslı değildir; mağazaya çıkmadan önce sunucu moduna geçilmelidir.** Enflasyon verisi bu
   modda yoktur, reel getiri "Yakında" görünür.
2. **Sunucu modu (yayın için):** `backend/` servisi lisanslı kaynaklardan (Twelve Data, EODHD,
   TCMB EVDS) veri toplar, altın türlerini hesaplar ve WebSocket ile tüm kullanıcılara dağıtır.
   ```bash
   cd backend && npm install
   DATA_MODE=demo npm start          # anahtarsız deneme
   cp .env.example .env              # canlı için anahtarları girin
   cd ../app && flutter run --dart-define=KIYMET_API=http://10.0.2.2:8080
   ```

## Altın hesabı

`Has değer = ons (USD) × USD/TRY / 31,1035 × ağırlık (g) × saflık`

| Ürün | Ağırlık | Saflık |
|---|---|---|
| Gram altın | 1 g | 0,995 |
| Çeyrek / Yarım / Tam | 1,754 / 3,508 / 7,016 g | 0,916 |
| Cumhuriyet (Ata) | 7,216 g | 0,916 |
| Gremse | 17,54 g | 0,916 |
| 22 / 18 / 14 ayar | 1 g | 0,916 / 0,750 / 0,585 |

Kuyumcu fiyatları işçilik ve makas nedeniyle bu değerden farklıdır; uygulamada bu açıkça belirtilir.

## Reel getiri

`Reel getiri = Güncel değer / (Maliyet × TÜFE_bugün / TÜFE_alım ayı) − 1`

## Geliştirme

```bash
cd backend && npm test
cd app && flutter analyze && flutter test
```

Varlıklar yalnızca cihazda (`shared_preferences`) saklanır; sunucuya kişisel veri gönderilmez.
