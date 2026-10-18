/* Gölgen ne diyor? — şehir + tarih için güneş hesabı ve kişisel rutin eşlemesi (kreatife satır içi gömülür). */
var GUNES = (function () {
  var RAD = Math.PI / 180;
  function dayOfYear(d) { return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5); }
  // NOAA yaklaşımı (±2 dk): deklinasyon, zaman denklemi, öğle yüksekliği, gün uzunluğu, doğuş/batış (Türkiye UTC+3)
  function calc(city, date) {
    var N = dayOfYear(date), phi = city.lat * RAD;
    var g = 2 * Math.PI / 365 * (N - 1);
    var decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    var eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    var noonAlt = 90 - Math.abs(city.lat - decl / RAD);
    var cosW = (Math.sin(-0.833 * RAD) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
    var w = Math.acos(Math.max(-1, Math.min(1, cosW))) / RAD;
    var noon = 720 - 4 * city.lon - eot + 180; // yerel dakika
    return { noonAlt: noonAlt, shadow: 1 / Math.tan(noonAlt * RAD), dayMin: 8 * w, rise: noon - 4 * w, set: noon + 4 * w, noon: noon };
  }
  function hm(min) { min = Math.round(min); return ('0' + Math.floor(min / 60)).slice(-2) + ':' + ('0' + (min % 60)).slice(-2); }
  function dur(min) { min = Math.round(Math.abs(min)); var h = Math.floor(min / 60), m = min % 60; return (h ? h + ' sa ' : '') + m + ' dk'; }
  function num(x) { return x.toFixed(1).replace('.', ','); }
  var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  function dateTR(d) { return d.getDate() + ' ' + AY[d.getMonth()]; }
  // Bulunma eki (ünlü uyumu): 18 Ekim'de, 30 Haziran'da, 1 Ağustos'ta
  var DA = ["'ta", "'ta", "'ta", "'da", "'ta", "'da", "'da", "'ta", "'de", "'de", "'da", "'ta"];
  function dateTRda(d) { return dateTR(d) + DA[d.getMonth()]; }
  // Haziran gündönümünden Aralık gündönümüne: t=0..1
  function yearSpan(now) {
    var y = now.getFullYear(), a = new Date(y, 5, 21), b = new Date(y, 11, 21);
    if (now < a) { a = new Date(y - 1, 5, 21); b = new Date(y - 1, 11, 21); }
    return { a: a, b: b, at: function (t) { return new Date(a.getTime() + (b - a) * t); }, tOf: function (d) { return Math.max(0, Math.min(1, (d - a) / (b - a))); } };
  }
  // Fotoğrafın ışığı: öğle güneşinin yüksekliğine göre (≈27° kış → ≈73° yaz)
  function light(alt) {
    var k = Math.max(0, Math.min(1, (alt - 25) / 48));
    return 'brightness(' + (0.5 + 0.58 * k).toFixed(3) + ') saturate(' + (0.45 + 0.7 * k).toFixed(3) + ') contrast(' + (0.92 + 0.12 * k).toFixed(3) + ') hue-rotate(' + ((1 - k) * 12).toFixed(1) + 'deg)';
  }
  // Cevaplar → en fazla 3 ürün (her zaman gün ışığı ürünüyle başlar)
  function recommend(answers, P) {
    var out = [answers.aile === 'cocuk' ? 'd3' : 'd3k2'];
    if (answers.aile === 'cocuk') out.push('omega3surup');
    out.push(answers.his === 'enerji' ? 'b12' : 'magnezyum');
    if (out.length < 3) out.push(answers.gun === 'masa' ? 'omega3' : 'krill');
    return out.slice(0, 3).map(function (k) { return P[k]; });
  }
  return { calc: calc, hm: hm, dur: dur, num: num, dateTR: dateTR, dateTRda: dateTRda, yearSpan: yearSpan, light: light, recommend: recommend };
})();
