'use strict';
/**
 * Pluxee "Geçiyor" – Media-first interaktif masthead (970x250)
 * ---------------------------------------------------------------
 * Splash Digital konsept çalışması.
 *
 * Kreatif tek bir HTML dosyasıdır; kopya, durak sırası, CTA ve atmosfer
 * yayın anında gelen SİNYALLERE göre kurulur:
 *   seg   : Splash 1. parti segment  (wc = beyaz yaka, hr = İK, emp = işveren/karar verici)
 *   h, m  : saat / dakika           (ad server makrosu; yoksa cihaz saati)
 *   geo   : ilçe anahtarı           (IP / GPS → ilçe; yoksa 'none' = Türkiye geneli)
 *   w     : hava                    (sun | rain)
 *   demo  : 1 → sinyal çubuğu (sunum modu)
 *
 * Bu dosyayı düzenleyip `node pluxee/build.js` çalıştırmanız yeterlidir.
 * Nokta sayıları DEMO amaçlıdır; canlıda Pluxee üye işyeri verisiyle beslenir.
 */
module.exports = {
  brand: {
    name: 'Pluxee',
    product: 'Yemek Kartı',
    agency: 'Splash Digital',
    campaign: 'Pluxee Geçiyor',
    // Tıklama hedefi. Reklam ağı clickTag sağlıyorsa o kullanılır.
    url: 'https://www.pluxee.com.tr/?utm_source=splash&utm_medium=masthead&utm_campaign=pluxee-geciyor',
    // Marka paleti (Pluxee lacivert + yeşil)
    navy: '#221C46',
    navy2: '#2B2458',
    navy3: '#15112F',
    green: '#00EB5E',
    lavender: '#B8A9FF',
  },

  // Süreler (ms). Bir tur ≈ enter + 5 × (move + dwell) + hold ≈ 13,5 sn; 2 tur ≈ 27 sn (< 30 sn).
  timing: {
    enter: 700,     // açılış: sahne belirir, kart yerine gelir
    move: 720,      // kartın bir duraktan diğerine gidişi
    dwell: 1250,    // durakta kalma (dokunma + damga)
    hold: 3200,     // final karesi
    loops: 2,       // otomatik tur sayısı; sonra final karesinde durur
    resume: 1500,   // fare ayrıldıktan sonra otomatik oynatmaya dönüş gecikmesi
  },

  // Splash segmentleri → hitap dili + CTA
  segments: {
    wc:  { label: 'Beyaz yaka',             cta: 'Yakınımda nerede geçiyor?' },
    hr:  { label: 'İK profesyoneli',        cta: 'Ekibim için teklif al' },
    emp: { label: 'İşveren / karar verici', cta: 'Şirketim için başvur' },
  },

  /**
   * Günün anları (kronolojik). Saat aralığı → an; her anın bir durağı vardır.
   * Kart, "şu an"ın durağından başlar ve günün kalanını dolaşır.
   */
  moments: [
    { key: 'breakfast', label: 'sabah',  from: 6,  to: 10, stop: 'firin' },
    { key: 'lunch',     label: 'öğle',   from: 11, to: 14, stop: 'restoran' },
    { key: 'coffee',    label: 'ikindi', from: 15, to: 17, stop: 'kafe' },
    { key: 'evening',   label: 'akşam',  from: 18, to: 22, stop: 'market' },
    { key: 'night',     label: 'gece',   from: 23, to: 5,  stop: 'online' },
  ],

  // Duraklar (vitrinler). Renkler pastel; lacivert zemin üzerinde okunur.
  stops: {
    firin:    { name: 'Fırın',    sign: 'FIRIN',    body: '#FFE0CC', awning: '#FF8C5A', signBg: '#FFF3EA', icon: 'simit' },
    restoran: { name: 'Restoran', sign: 'RESTORAN', body: '#E2DBFF', awning: '#7A63FF', signBg: '#F1EDFF', icon: 'cloche' },
    kafe:     { name: 'Kafe',     sign: 'KAFE',     body: '#D6F5E6', awning: '#12C77E', signBg: '#EAFBF2', icon: 'cup' },
    market:   { name: 'Market',   sign: 'MARKET',   body: '#FFF1BF', awning: '#FFC331', signBg: '#FFF9E3', icon: 'basket' },
    online:   { name: 'Online',   sign: 'ONLİNE',   body: '#D4EBFF', awning: '#3AA1FF', signBg: '#EAF5FF', icon: 'phone' },
  },

  // Damga sırası: kart kaçıncı durağa dokunuyorsa o kelime ("… geçiyor ✓")
  stampWords: ['burada', 'şurada', 'orada', 'orada da', 'her yerde'],

  /**
   * Konum sözlüğü (demo). loc = bulunma hâli (ek uyumu için elle yazıldı), count = nokta sayısı (DEMO).
   * Sözlükte olmayan bir ilçe gelirse `{geo} civarında` + "binlerce" kullanılır; geo=none → Türkiye geneli.
   */
  geos: {
    levent:   { name: 'Levent',   loc: "Levent'te",   city: 'İstanbul', count: 1248 },
    maslak:   { name: 'Maslak',   loc: "Maslak'ta",   city: 'İstanbul', count: 936 },
    kadikoy:  { name: 'Kadıköy',  loc: "Kadıköy'de",  city: 'İstanbul', count: 2140 },
    atasehir: { name: 'Ataşehir', loc: "Ataşehir'de", city: 'İstanbul', count: 1412 },
    cankaya:  { name: 'Çankaya',  loc: "Çankaya'da",  city: 'Ankara',   count: 1705 },
    alsancak: { name: 'Alsancak', loc: "Alsancak'ta", city: 'İzmir',    count: 812 },
    nilufer:  { name: 'Nilüfer',  loc: "Nilüfer'de",  city: 'Bursa',    count: 640 },
  },
  geoUnknown: { loc: '{geo} civarında', countText: 'binlerce' },
  geoNone:    { name: 'Türkiye', loc: 'Türkiye genelinde', countText: 'binlerce' },

  weather: {
    sun:  { label: 'Güneşli' },
    rain: { label: 'Yağmurlu' },
  },

  /**
   * Kopya matrisi: segment × an. Yer tutucular: {geo} ilçe adı, {loc} bulunma hâli, {n} nokta sayısı.
   * top  : yeşil üst satır (an + yer)
   * sub  : alt başlık (en fazla ~80 karakter, 2 satır)
   * Ana başlık her zaman "Pluxee geçiyor." → finalde "Her yerde geçiyor."
   */
  copy: {
    wc: {
      breakfast: { top: 'Günaydın {geo}',          sub: 'Simitçiden fırına, kahvaltıda da geçiyor. {loc} {n} noktada.' },
      lunch:     { top: 'Öğle arası · {geo}',      sub: 'Restoranda, kafede, markette geçiyor. {loc} {n} noktada.' },
      coffee:    { top: 'İkindi molası · {geo}',   sub: 'Kahve molasında da geçiyor. {loc} {n} noktada.' },
      evening:   { top: 'Mesai bitti · {geo}',     sub: 'Akşam market alışverişinde de geçiyor. {loc} {n} noktada.' },
      night:     { top: 'Gece · {geo}',            sub: 'Online siparişte de geçiyor. Yemek kapına gelsin.' },
      rain:      { top: 'Yağmur var · {geo}',      sub: 'Dışarı çıkma, online siparişte de geçiyor. Kapına gelsin.' },
      final:     { top: 'Burada, şurada, orada',   sub: '{loc} {n} noktada. Tek kart, günün her anı.' },
    },
    hr: {
      breakfast: { top: 'Ekibiniz güne başlıyor',  sub: 'Kahvaltıda da geçiyor. Ekibiniz nerede olursa olsun.' },
      lunch:     { top: 'Ekibinizde öğle arası',   sub: 'Restoranda, kafede, markette geçiyor. Tek kart, her ihtiyaç.' },
      coffee:    { top: 'İkindi molası',           sub: 'Kahve molasında da geçiyor. Yan hak, günün her anında.' },
      evening:   { top: 'Mesai bitti',             sub: 'Market alışverişinde de geçiyor. Ekibiniz için gerçek fayda.' },
      night:     { top: 'Uzaktan çalışan ekipler', sub: 'Online siparişte de geçiyor. Ofiste ya da evde.' },
      rain:      { top: 'Yağmurlu gün',            sub: 'Ekibiniz dışarı çıkmasın. Online siparişte de geçiyor.' },
      final:     { top: 'Burada, şurada, orada',   sub: 'Ekibiniz nerede olursa olsun. {loc} {n} noktada.' },
    },
    emp: {
      breakfast: { top: 'Günün ilk yan hakkı',       sub: 'Sabah fırınından akşam marketine, her yerde geçiyor.' },
      lunch:     { top: 'Öğle yemeği bütçeniz',      sub: 'Türkiye genelinde geçiyor. Vergi avantajıyla.' },
      coffee:    { top: 'Yan hak bütçeniz',          sub: "Boşa gitmesin. Kafede, markette, online'da geçiyor." },
      evening:   { top: 'Mesai bitti',               sub: 'Çalışanınızın market alışverişinde de geçiyor.' },
      night:     { top: 'Her lokasyon, her vardiya', sub: 'Online siparişte de geçiyor. 7/24, Türkiye genelinde.' },
      rain:      { top: 'Yağmurlu gün',              sub: 'Çalışanınız dışarı çıkmasın. Online siparişte de geçiyor.' },
      final:     { top: 'Burada, şurada, orada',     sub: "Türkiye'nin her yerinde geçiyor. {loc} {n} noktada." },
    },
  },

  // Varsayılan sinyaller (parametre gelmezse). Saat için cihaz saati kullanılır.
  defaults: { seg: 'wc', geo: 'levent', weather: 'sun' },
};
