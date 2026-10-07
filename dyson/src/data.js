// Masthead içeriği: metinler, bağlantılar, renkler, özellik kartları.
// Bağlantılar bilerek parametresizdir (UTM / takip parametresi eklenmez).
export const DATA = {
  stages: {
    hair: {
      url: 'https://www.dyson.com.tr/products/hair-care',
      product: 'Dyson Supersonic Nural™',
      swatches: [
        { name: 'Nikel / Bakır', body: '#b8b6b2', accent: '#b9764e' },
        { name: 'Demir / Fuşya', body: '#55575d', accent: '#c4367a' },
        { name: 'Seramik Pembe / Gül Altını', body: '#e3c3b8', accent: '#c79a7c' },
        { name: 'Prusya Mavisi / Bakır', body: '#22395a', accent: '#b9764e' },
        { name: 'Erik / Bakır', body: '#5a2335', accent: '#c07a55' },
      ],
      heats: [
        { key: 'cold', label: 'Soğuk', temp: 28, color: '#7cc7ff', level: 0 },
        { key: 'low', label: 'Düşük', temp: 60, color: '#ffd27a', level: 1 },
        { key: 'mid', label: 'Orta', temp: 80, color: '#ffa04d', level: 2 },
        { key: 'high', label: 'Yüksek', temp: 100, color: '#ff6a2b', level: 3 },
      ],
      attachments: [
        { key: 'none', label: 'Başlıksız' },
        { key: 'concentrator', label: 'Yoğunlaştırıcı' },
        { key: 'smoothing', label: 'Pürüzsüzleştirici' },
        { key: 'diffuser', label: 'Difüzör' },
      ],
      features: {
        multiplier: { title: 'Air Multiplier™ teknolojisi', text: 'Hava akışını yaklaşık üç katına çıkararak yüksek hızlı, kontrollü bir hava jeti oluşturur.' },
        heat: { title: 'Akıllı ısı kontrolü', text: 'Hava sıcaklığı saniyede 40 kereden fazla ölçülür; aşırı ısı hasarına karşı saçın doğal parlaklığı korunur.' },
        nural: { title: 'Nural™ saç derisi koruma', text: 'Mesafe sensörü cihaz başınıza yaklaştığında ısıyı otomatik olarak düşürür.' },
        motor: { title: 'Dyson Hyperdymium™ motor', text: 'Dakikada 110.000 devire kadar dönen dijital motor sapın içinde; daha dengeli bir tutuş sağlar.' },
        magnetic: { title: 'Manyetik başlıklar', text: 'Başlıklar mıknatısla anında takılır; cihaz takılan başlığı tanır ve son ayarlarınızı hatırlar.' },
      },
    },
    floor: {
      url: 'https://www.dyson.com.tr/products/cord-free',
      product: 'Dyson V12 Detect™ Slim',
      swatches: [
        { name: 'Sarı / Nikel', body: '#b9bab6', accent: '#e3ae17', accent2: '#7b4fa8' },
        { name: 'Prusya Mavisi / Bakır', body: '#2a3d5c', accent: '#b9764e', accent2: '#c08a5e' },
        { name: 'Nikel / Mor', body: '#b9bab6', accent: '#8c5bc0', accent2: '#e3ae17' },
      ],
      powers: [
        { key: 'eco', label: 'Eko', radius: 0.85, info: '60 dakikaya kadar' },
        { key: 'auto', label: 'Otomatik', radius: 1, info: 'Emiş gücü otomatik ayarlanır' },
        { key: 'boost', label: 'Boost', radius: 1.3, info: 'En yüksek emiş gücü' },
      ],
      bins: [
        { label: '>180µm', min: 0.48 },
        { label: '60–180µm', min: 0.32 },
        { label: '20–60µm', min: 0.2 },
        { label: '10–20µm', min: 0 },
      ],
      features: {
        laser: { title: 'Lazer toz algılama', text: 'Eğik açılı yeşil lazer, sert zeminlerde gözle görülmeyen tozu ortaya çıkarır.' },
        piezo: { title: 'Piezo sensör', text: 'Toz partiküllerini saniyede 15.000 kez sayar ve boyutlarına göre ölçer; emiş gücünü otomatik ayarlar.' },
        lcd: { title: 'LCD ekran', text: 'Ne kadar ve hangi boyutta toz topladığınızı gerçek zamanlı gösterir.' },
        motor: { title: 'Dyson Hyperdymium™ motor', text: 'Dakikada 125.000 devire kadar dönen motor; hafif gövdede güçlü emiş.' },
        battery: { title: '60 dakikaya kadar çalışma', text: 'Tıkla-tak bataryayla kablosuz özgürlük; yedek bataryayla süreyi ikiye katlayın.' },
        hepa: { title: 'Tam sızdırmaz HEPA filtreleme', text: '0,3 mikron kadar küçük partiküllerin %99,99\'unu hapseder; daha temiz hava geri verilir.' },
      },
    },
  },
};
