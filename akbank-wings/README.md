# Wings – Q4 lansman, 970×250 interaktif masthead

`970x250/index.html`: tek dosya, satır içi CSS + JS, görsel dosyası yok (kart ve ikonlar vektör). Boyutu yaklaşık 20 KB; fontlar Google Fonts'tan geliyor.

| Açılış | Otomatik döngü (Fine Dining) | Üzerine gelme (Mil) |
|---|---|---|
| ![](screens/01-acilis.jpg) | ![](screens/03-gastronomi.jpg) | ![](screens/05-hover-sanat.jpg) |

## Kurgu
1. **0–2 sn:** Altın uçuş rotası çizilir. Kart sağdan dönerek gelir, *Wings* yazısı ve başlık kelime kelime belirir.
2. **2 sn sonrası:** Sağda 4 ayrıcalık paneli açılır (Seyahat · Gastronomi · Mil · Sanat). Her panel 3,4 sn açık kalır ve alttaki altın çubuk ilerlemeyi gösterir.
3. **30 sn:** Döngü durur ve banner ilk panelde kalır (Google Ads / DV360'ın 30 sn kuralına uygun).

## Etkileşim
- **İmleç:** Kart imlece göre 3B eğilir. Metalik parlama ve arka plan ışığı imleci izler.
- **Panel üzerine gelme:** Panel genişler, döngü duraklar. Kapalı bir panele tıklamak paneli açar, çıkış tetiklemez.
- **Dokunmatik:** Sağa/sola kaydırarak panel değiştirilir. **Klavye:** ← → ile panel değişir, Enter çıkış yapar.
- **Çıkış:** Önce `Enabler.exit` (Studio) denenir, sonra `clickTag` (Google Ads / CM360). İkisi de yoksa `CONFIG.landing` UTM'li olarak açılır ve `utm_content` alanına o an açık olan panel yazılır.
- **Ölçüm:** `track()` ile `hover`, `panel_<ad>` ve `exit` olayları gönderilir (Enabler varsa sayaç olarak).
- `prefers-reduced-motion` seçiliyse animasyonlar kısaltılır.

## Düzenleme
Bütün metinler, rakamlar, kart seviyesi (`tier`), hedef URL ve süreler dosyadaki `CONFIG` nesnesinde.
**Not:** akbank.com bu ortamdan erişilemedi. Ayrıcalık rakamları (transferde %75'e varan, restoranda %15'e varan, 1,5 kat mil, son dakika bilet) Wings'in kamuya açık mevcut ayrıcalıklarından alındı ve **yer tutucu** olarak kullanıldı. Lansman ürününün kesin metinleri ve hukuk onayı ile güncellenmelidir. Kart üzerindeki kanat işareti soyut bir yer tutucudur, yayından önce resmi Wings logosuyla değiştirilmelidir.

## Akbank logosu
Logo, `https://www.akbank.com/SiteAssets/img/logo.svg` adresindeki resmi dosyadır. `tools/embed-logo.js` bu dosyayı masthead'deki `LOGO:START` / `LOGO:END` işaretlerinin arasına satır içi SVG olarak gömer. Böylece banner tek dosya olarak kalır. Koyu zeminde okunsun diye koyu/siyah dolgular fildişine çevrilir, kırmızı alanlar olduğu gibi korunur.

Bulut oturumu akbank.com'a erişemediği için indirme işi GitHub Actions'ta yapılır (`.github/workflows/akbank-wings-logo.yml`). İş akışı gömme betiği değiştiğinde kendiliğinden çalışır, *Actions → "Wings masthead – Akbank logosunu çek ve göm" → Run workflow* ile elle de başlatılabilir. Logo gömülene kadar banner'da yazı ile "Akbank" görünür.

Yerelde (normal internet erişimiyle): `node akbank-wings/tools/embed-logo.js`

Ekran görüntülerini yenilemek için: `NODE_PATH=$(npm root -g) node akbank-wings/tools/capture.js`

Hedefleme önerileri: [HEDEFLEME.md](HEDEFLEME.md)
