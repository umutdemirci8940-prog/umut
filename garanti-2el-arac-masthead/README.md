# Garanti BBVA 2. El Araç – Oasis Media Interactive Masthead (970×250)

Kreatif ekip revizyonu:

- **Metinler (KV'den):** 1. sahne başlığı "Garanti BBVA Mobil’den 2. el aracınızı / satın alın, yola garantili çıkın! / Çünkü birlikte yaparız.", buton "Detaylı Bilgi". Marka adı tam olarak "Garanti BBVA" geçiyor.
- **Renkler:** Kurumsal paletle değiştirildi; kod içindeki `:root` değişkenleri:
  - `--kv-blue #15519c` KV başlık mavisi – 1. sahne başlığı
  - `--blue #004481` BBVA mavisi (logodaki BBVA yazısı) – sosyal ikonlar
  - `--navy #072146` lacivert – metinler, "Detaylı Bilgi" butonu
  - `--green #009242` Garanti yeşili (Garanti BBVA Mobil ikonu) – "Detaylı Bilgi" butonu, vurgu, 2. sahne zemini
  - Önceki teal `#13a3a5` ve `#1952A0` tonları kaldırıldı.
- **Font:** Inter yerine kurumsal **Benton Sans BBVA** (Book 400 / Medium 500 / Bold 700), Latin + Türkçe karakter alt kümesi, woff2 (`assets/`).

Teslim paketi: `../release/garanti-2el-arac-masthead.zip` (index.html + assets).

## Adform takibi

- **Tıklama:** Her iki sahnenin butonu ("Detaylı Bilgi") ve banner yüzeyi Adform tıklama adresine gider:
  `https://track.adform.net/C/?bn=90843320;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_50}`
  (`index.html` başındaki `ADFORM_CLICK` değişkeni).
- **Gösterim:** Sayfa açılınca 1x1 Adform sayacı bir kez yüklenir; `ord=[timestamp]` yerine her gösterimde benzersiz önbellek kırıcı yazılır (`ADFORM_IMPRESSION`).
- `${GDPR}` ve `${GDPR_CONSENT_50}` makroları olduğu gibi bırakıldı; yayın tarafındaki reklam sunucusu doldurur.
