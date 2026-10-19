# Garanti BBVA Bonus – Black Friday İnteraktif Masthead (970 × 250)

Ana mesaj: **"Black Friday / Kasım alışverişlerinde en çok kazandıran kart Bonus"**

Dosya: `index.html` (tek dosya, satır içi CSS + JS, görsel dosyası yok, ~23 KB)

| Açılış | Sepet doluyor | Final |
|---|---|---|
| ![](screens/1-acilis.png) | ![](screens/2-sepet.png) | ![](screens/3-final.png) |

## Kurgu
1. **Açılış (0–2 sn):** Bonus logosu, "BLACK FRIDAY" başlığı (ışık geçişi), ana mesaj, Bonus kartı sağdan girer, kategori kartları sırayla yükselir.
2. **"Kasım sepetini doldur" oyunu:** Kampanya kapsamındaki 5 kategori (Giyim, seçili e-ticaret uygulamaları, elektrik-elektronik, beyaz eşya, küçük ev aletleri). Kullanıcı kategoriye dokununca ikon karta uçar, kart parlar, "+ Bonus" rozeti çıkar, kazanç çubuğu dolar ve kategoriye özel mesaj gösterilir.
3. **Final:** 5 kategori dolunca "Kasım'da en çok kazandıran kart Bonus" karesi, konfeti ve nabız efektli CTA ("Kampanyaları Keşfet"). "Tekrar oyna" ile baştan başlar.

## Etkileşim
- Kullanıcı etkileşmezse kategoriler otomatik dolar (~1,7 sn arayla); yarıda bırakırsa 5 sn sonra otomatik devam eder. Animasyon 30 sn içinde finalde durur (Google Ads kuralı).
- Fare hareketiyle kartta 3B eğim; banner üzerine gelince CTA yeşile döner.
- Kategori düğmeleri ve "Tekrar oyna" tıklama çıkışını tetiklemez; geri kalan her alan tıklanabilir.
- Tıklama: `window.clickTag` (Google Ads / DCM) veya `Enabler.exit` (Studio / DV360). Varsayılan hedef `https://www.bonus.com.tr/kampanyalar` – yayın öncesi kampanya URL'si ile değiştirin.
- Klavye erişimi (Tab, Enter), `aria` etiketleri, `prefers-reduced-motion` desteği.

## Yayın öncesi yapılacaklar
- `bonus` / `Garanti BBVA` yazıları metin yer tutucudur; **resmi logo dosyaları** ve marka kılavuzundaki yeşil tonu (`:root` → `--green`) ile değiştirilmeli.
- Kampanyada oran/tutar verilmediği için bonus miktarı yazılmadı; net kazanım oranları gelince `CATS[].msg` metinlerine eklenebilir.
- Yasal ibare ("Kampanya koşulları bonus.com.tr'de.") hukuk onayına göre güncellenmeli.
- Font: Google Fonts *Montserrat* (Google Ads/DV360'ta izinli); erişilemezse sistem fontuna düşer.
