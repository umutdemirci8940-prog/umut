# Garanti BBVA 2. El Araç – 300×250 (Medium Rectangle)

970×250 masthead'in (`../garanti-2el-arac-masthead/`) 300×250 uyarlaması. Aynı kurgu: iki sahne arasında sürüklenebilir ayırıcı, açılışta el imleciyle ipucu, uçta 5 sn kalınca ortaya dönüş, ← → ile klavye kontrolü.

- **Sahne 1 (KV):** "Garanti BBVA Mobil’den / 2. el aracınızı satın alın, / yola garantili çıkın! / Çünkü birlikte yaparız." + "Detaylı Bilgi" butonu. Sosyal medya ikonları bu boyutta yer olmadığı için çıkarıldı.
- **Sahne 2 (yeşil):** başlık, alt metin, 3 özellik kartı, Garanti BBVA Mobil ikonu, "Detaylı Bilgi" butonu ve yasal metin.
- Renkler ve font 970×250 ile aynı (`#15519c`, `#004481`, `#072146`, `#009242`; Benton Sans BBVA woff2).

Teslim paketi: `../release/garanti-2el-arac-300x250.zip`.

## Adform takibi

- **Tıklama:** Her iki sahnenin butonu ("Detaylı Bilgi") ve banner yüzeyi Adform tıklama adresine gider:
  `https://track.adform.net/C/?bn=90843320;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_50}`
  (`index.html` başındaki `ADFORM_CLICK` değişkeni).
- **Gösterim:** Sayfa açılınca 1x1 Adform sayacı bir kez yüklenir; `ord=[timestamp]` yerine her gösterimde benzersiz önbellek kırıcı yazılır (`ADFORM_IMPRESSION`).
- `${GDPR}` ve `${GDPR_CONSENT_50}` makroları olduğu gibi bırakıldı; yayın tarafındaki reklam sunucusu doldurur.
