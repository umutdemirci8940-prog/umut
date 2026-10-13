#!/usr/bin/env python3
"""Mağaza metinlerini üretir ve karakter sınırlarını kontrol eder: python3 store/metadata/generate.py"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

DESC = """Kıymet; altın, döviz ve kripto birikimlerini tek ekranda toplar, canlı fiyatlarla bugünkü değerini ve enflasyona göre gerçek getirini gösterir.

TÜM KIYMETLERİN TEK YERDE
• Gram, çeyrek, yarım, tam, Cumhuriyet, Gremse altın; 22, 18 ve 14 ayar altın
• Gram gümüş
• Dolar, euro, sterlin, İsviçre frangı
• Bitcoin, Ethereum ve onlarca kripto para

GERÇEK GETİRİNİ GÖR
Paran büyüdü mü, yoksa enflasyona mı yenildi? Kıymet her varlığın alış tarihinden bugüne TÜFE'yi hesaba katarak reel getirisini gösterir: "Enflasyonu yendin" ya da "Enflasyonun gerisinde".

ALACAK VE BORÇ TAKİBİ
Kime ne kadar borç verdin, kimden ne aldın; TL, döviz ya da altın olarak kaydet. TL alacaklarında verdiğin günden bugüne enflasyonun ne kadar değer erittiğini, o gün o parayla kaç gram altın ya da kaç dolar alınabileceğini gör.

ALIŞ FİYATI OTOMATİK
Varlık eklerken tarihi seç; o günün kapanış fiyatı otomatik gelsin, toplam tutar hemen hesaplansın.

GİZLİLİĞİN SENDE
Üyelik yok, reklam yok. Varlıkların ve alacakların yalnızca senin telefonunda saklanır; hiçbir sunucuya gönderilmez.

Not: Fiyatlar bilgilendirme amaçlıdır; gecikmeli veya yaklaşık olabilir. Altın fiyatları ons fiyatı ve dolar kurundan hesaplanan teorik has değeridir, kuyumcu fiyatlarından farklı olabilir. Kıymet bir yatırım danışmanlığı hizmeti değildir; uygulamadaki bilgiler yatırım tavsiyesi değildir."""

NAME = "Kıymet: Altın, Döviz, Kripto"

APPSTORE = [
    ("Uygulama adı", 30, NAME),
    ("Alt başlık", 30, "Birikim ve enflasyon takibi"),
    ("Tanıtım metni", 170, "Altın, döviz ve kripto birikimlerin tek ekranda. Enflasyona göre gerçek getirini ve verdiğin borçların ne kadar eridiğini gör."),
    ("Anahtar kelimeler", 100, "altın,çeyrek,gram,döviz,dolar,euro,kur,gümüş,kripto,bitcoin,portföy,enflasyon,birikim,alacak,borç"),
    ("Açıklama", 4000, DESC),
    ("Bu sürümdeki yenilikler", 4000, "Kıymet'in ilk sürümü: altın, döviz ve kripto takibi, enflasyona göre reel getiri, alacak ve borç takibi."),
]
PLAY = [
    ("Uygulama adı", 30, NAME),
    ("Kısa açıklama", 80, "Altın, döviz, kripto ve alacaklarını takip et; enflasyona göre getirini gör"),
    ("Tam açıklama", 4000, DESC),
]

APPSTORE_EXTRA = """
## Diğer alanlar

| Alan | Değer |
|---|---|
| Birincil kategori | Finans (Finance) |
| İkincil kategori | Araçlar (Utilities) |
| Yaş sınırı | 4+ (tüm sorulara "Hayır/Yok") |
| Fiyat | Ücretsiz |
| Telif hakkı | 2026 <Adınız Soyadınız> |
| Gizlilik politikası URL'si | (yayınladığınız gizlilik sayfasının adresi) |
| Destek URL'si | (aynı sitedeki destek sayfası) |
| Uygulama gizliliği (App Privacy) | **Data Not Collected / Veri toplanmıyor** |
| Şifreleme (Export Compliance) | Info.plist'te `ITSAppUsesNonExemptEncryption = NO` (yalnızca HTTPS) |
| Ekran görüntüleri | `store/appstore/iphone-6.9-1…6.png` (1320×2868, iPhone 6.9") |
| Uygulama ikonu | Derlemenin içinde; ayrıca `brand/export/appstore-icon-1024.png` |

## İnceleme ekibine not (App Review Information → Notes)

```
Kıymet, kullanıcının kendi girdiği altın, döviz ve kripto varlıklarını ve kişisel
alacak/borç kayıtlarını takip eden bir kişisel finans uygulamasıdır. Üyelik/giriş
yoktur; tüm veriler yalnızca cihazda saklanır. Uygulama alım-satım, ödeme, borç
verme veya yatırım danışmanlığı hizmeti sunmaz. Fiyatlar bilgilendirme amacıyla
gösterilir.
Denemek için: Portföyüm > Varlık ekle > Çeyrek Altın > adet girin > Kaydet.
```
"""

PLAY_EXTRA = """
## Diğer alanlar

| Alan | Değer |
|---|---|
| Uygulama kategorisi | Finans |
| Etiketler | Kişisel finans |
| İçerik derecelendirmesi | Anketi doldurun (şiddet/kumar vb. hepsi "Hayır") → 3+ / Herkes |
| Hedef kitle | 18 yaş ve üzeri |
| Reklam içeriyor mu | Hayır |
| Veri güvenliği (Data safety) | Veri toplanmıyor, paylaşılmıyor; aktarım HTTPS ile şifreli |
| Finansal özellikler beyanı | "Kişisel finans: bütçe/portföy takibi"; kredi, ödeme, yatırım işlemi **yok** |
| Gizlilik politikası URL'si | (yayınladığınız gizlilik sayfasının adresi) |
| Uygulama simgesi | `brand/export/playstore-icon-512.png` (512×512) |
| Öne çıkan grafik | `store/googleplay/feature-graphic-1024x500.png` |
| Telefon ekran görüntüleri | `store/googleplay/phone-1…6.png` (1080×1920) |
"""


def write(fname, title, fields, extra):
    ok = True
    parts = [f"# {title}\n"]
    for label, limit, value in fields:
        n = len(value)
        flag = "✅" if n <= limit else "❌ SINIR AŞILDI"
        ok &= n <= limit
        print(f"{fname}: {label}: {n}/{limit} {flag}")
        parts.append(f"## {label} (en fazla {limit}): {n} karakter {flag}\n\n```\n{value}\n```\n")
    parts.append(extra)
    with open(os.path.join(HERE, fname), "w", encoding="utf-8") as f:
        f.write("\n".join(parts))
    return ok


ok = write("appstore-tr.md", "App Store Connect: Türkçe (tr)", APPSTORE, APPSTORE_EXTRA)
ok &= write("googleplay-tr.md", "Google Play Console: Türkçe (tr-TR)", PLAY, PLAY_EXTRA)
sys.exit(0 if ok else 1)
