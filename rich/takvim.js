/* Kasım Takvimi — bugünün kapısı, geri sayım ve açılan kapılar (kreatife satır içi gömülür). */
var TAKVIM = (function () {
  var GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  // Bugün: önizleme için window.AD_DAY ya da ?day=; Kasım'da gerçek gün; öncesinde 1, sonrasında 30
  function today(year) {
    var o = window.AD_DAY || +((location.search.match(/[?&]day=(\d+)/) || [])[1] || 0);
    if (o) return Math.max(1, Math.min(30, o));
    var n = new Date();
    if (n.getFullYear() === year && n.getMonth() === 10) return n.getDate();
    return n < new Date(year, 10, 1) ? 1 : 30;
  }
  function weekday(year, d) { return GUN[new Date(year, 10, d).getDay()]; }
  // Yarınki kapıya kalan süre (gece yarısı)
  function countdown() {
    var n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), s = Math.max(0, Math.floor((m - n) / 1000));
    var p = function (x) { return ('0' + x).slice(-2); };
    return p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(s % 60);
  }
  // Açılan kapılar izleyicinin cihazında saklanır (yoksa sessizce yok sayılır)
  var KEY = 'iy_kasim_takvim';
  function opened() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function markOpened(d) { try { var a = opened(); if (a.indexOf(d) < 0) { a.push(d); localStorage.setItem(KEY, JSON.stringify(a)); } } catch (e) {} }
  return { today: today, weekday: weekday, countdown: countdown, opened: opened, markOpened: markOpened };
})();
