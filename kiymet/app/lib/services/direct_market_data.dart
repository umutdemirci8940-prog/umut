import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../logic/catalog.dart';
import '../logic/inflation.dart';
import '../logic/metals.dart';
import '../models/models.dart';
import 'market_data.dart';

/// Sunucu olmadan, herkese açık kaynaklardan cihazda fiyat toplar.
///
/// TEST SÜRÜMÜ İÇİNDİR. Mağazada yayınlamadan önce lisanslı kaynaklarla çalışan
/// Kıymet veri servisine (BackendMarketData) geçilmelidir:
/// - Kripto: BtcTurk herkese açık ticker
/// - Ons altın: Binance PAXG/USDT (altına endeksli token, yaklaşık), yedek: gold-api.com
/// - Ons gümüş: gold-api.com
/// - Döviz: TCMB gösterge kurları (günlük)
/// - BIST: Yahoo Finance (resmî olmayan uç nokta, 15 dk+ gecikmeli; ticari kullanıma uygun değil)
class DirectMarketData implements MarketData {
  DirectMarketData({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  final _prices = StreamController<List<Price>>.broadcast();
  final _status = StreamController<StreamStatus>.broadcast();
  final Map<String, Price> _last = {};
  final Set<String> _cryptoSeen = {};
  final Set<String> _extraStocks = {};
  final List<Timer> _timers = [];
  bool _active = false;
  DateTime? _lastSuccess;

  // Altın hesabı için ham değerler
  double? _usdTry, _usdTryPrev, _xau, _xauPrev, _xag, _xagPrev;

  static const _headers = {'User-Agent': 'Mozilla/5.0 (Kiymet)', 'Accept': '*/*'};

  @override
  Stream<List<Price>> get prices => _prices.stream;
  @override
  Stream<StreamStatus> get status => _status.stream;

  @override
  Future<List<Instrument>> instruments() async =>
      buildCatalog(extraCrypto: _cryptoSeen, extraStocks: _extraStocks);

  @override
  Future<List<Price>> snapshot() async => _last.values.toList();

  /// Enflasyon verisi (TCMB EVDS) API anahtarı gerektirdiği için yalnızca sunucu modunda gelir.
  @override
  Future<CpiSeries> inflation() async => CpiSeries.empty;

  @override
  void start() {
    if (_active) return;
    _active = true;
    _status.add(StreamStatus.connecting);
    _every(const Duration(seconds: 5), _pollCrypto);
    _every(const Duration(seconds: 30), _pollMetals);
    _every(const Duration(minutes: 30), _pollFx);
    _every(const Duration(seconds: 60), _pollStocks);
    _every(const Duration(seconds: 10), _updateStatus, immediate: false);
  }

  void _every(Duration d, Future<void> Function() task, {bool immediate = true}) {
    Future<void> run() async {
      if (!_active) return;
      try {
        await task();
      } catch (_) {
        // Tek bir kaynağın hatası diğerlerini etkilemesin; durum göstergesi ayrıca güncellenir.
      }
    }

    if (immediate) run();
    _timers.add(Timer.periodic(d, (_) => run()));
  }

  @override
  void pause() {
    _active = false;
    for (final t in _timers) {
      t.cancel();
    }
    _timers.clear();
  }

  @override
  void watch(Iterable<String> ids) {
    var added = false;
    for (final id in ids) {
      final parts = id.split(':');
      if (parts.length == 2 && parts[0] == 'STOCK' && isValidStockCode(parts[1]) && !bistStocks.containsKey(parts[1])) {
        added = _extraStocks.add(parts[1]) || added;
      }
    }
    if (added && _active) _pollStocks();
  }

  @override
  void dispose() {
    pause();
    _prices.close();
    _status.close();
    _client.close();
  }

  Future<dynamic> _getJson(String url) async {
    final res = await _client.get(Uri.parse(url), headers: _headers).timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) throw http.ClientException('${res.statusCode}', Uri.parse(url));
    return jsonDecode(utf8.decode(res.bodyBytes));
  }

  void _emit(List<Price> list) {
    if (list.isEmpty || !_active) return;
    for (final p in list) {
      _last[p.id] = p;
    }
    _lastSuccess = DateTime.now();
    _prices.add(list);
  }

  Future<void> _updateStatus() async {
    final ok = _lastSuccess != null && DateTime.now().difference(_lastSuccess!) < const Duration(seconds: 90);
    _status.add(ok ? StreamStatus.live : StreamStatus.offline);
  }

  // --- Kripto: BtcTurk ---
  Future<void> _pollCrypto() async {
    final body = await _getJson('https://api.btcturk.com/api/v2/ticker') as Map<String, dynamic>;
    final out = <Price>[];
    for (final t in (body['data'] as List? ?? const [])) {
      final m = t as Map<String, dynamic>;
      if (m['denominatorSymbol'] != 'TRY') continue;
      final code = m['numeratorSymbol'] as String;
      final last = _num(m['last']);
      if (last == null) continue;
      final open = _num(m['open']);
      _cryptoSeen.add(code);
      out.add(makePrice('CRYPTO:$code', last, prevClose: open, source: 'BtcTurk'));
      if (code == 'USDT') {
        _usdTry = last;
        _usdTryPrev = open;
      }
    }
    _emit(out);
    _emitMetals();
  }

  // --- Ons altın / gümüş ---
  Future<void> _pollMetals() async {
    await Future.wait([_pollGold(), _pollSilver()]);
    _emitMetals();
  }

  Future<void> _pollGold() async {
    try {
      final t = await _getJson('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT') as Map<String, dynamic>;
      _xau = _num(t['lastPrice']);
      _xauPrev = _num(t['openPrice']);
    } catch (_) {
      final t = await _getJson('https://api.gold-api.com/price/XAU') as Map<String, dynamic>;
      _xau = _num(t['price']);
    }
  }

  Future<void> _pollSilver() async {
    final t = await _getJson('https://api.gold-api.com/price/XAG') as Map<String, dynamic>;
    final price = _num(t['price']);
    if (price == null) return;
    // Kaynak önceki kapanış vermiyor: günün ilk görülen fiyatını referans al.
    _xagPrev ??= price;
    _xag = price;
  }

  void _emitMetals() {
    final out = <Price>[];
    for (final p in metalProducts) {
      final ounce = p.silver ? _xag : _xau;
      final ouncePrev = p.silver ? _xagPrev : _xauPrev;
      final value = productValueTry(p, ounce, _usdTry);
      if (value == null) continue;
      out.add(makePrice(
        p.id,
        value,
        prevClose: productValueTry(p, ouncePrev, _usdTryPrev),
        source: 'Has değer (ons × USD/TRY)',
      ));
    }
    _emit(out);
  }

  // --- Döviz: TCMB ---
  Future<void> _pollFx() async {
    final res = await _client
        .get(Uri.parse('https://www.tcmb.gov.tr/kurlar/today.xml'), headers: _headers)
        .timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) return;
    final rates = parseTcmbXml(utf8.decode(res.bodyBytes));
    _emit([
      for (final code in currencies.keys)
        if (rates[code] != null) makePrice('FX:$code', rates[code]!, source: 'TCMB gösterge kuru', delayed: true),
    ]);
  }

  // --- BIST: Yahoo Finance (yalnızca test) ---
  Future<void> _pollStocks() async {
    final codes = {...bistStocks.keys, ..._extraStocks};
    final results = await Future.wait(codes.map((code) async {
      try {
        final body = await _getJson(
            'https://query1.finance.yahoo.com/v8/finance/chart/$code.IS?interval=1d&range=1d') as Map<String, dynamic>;
        final meta = (body['chart']?['result'] as List?)?.first?['meta'] as Map<String, dynamic>?;
        final price = _num(meta?['regularMarketPrice']);
        if (price == null) return null;
        final prev = _num(meta?['previousClose']) ?? _num(meta?['chartPreviousClose']);
        return makePrice('STOCK:$code', price, prevClose: prev, source: 'Yahoo Finance', delayed: true);
      } catch (_) {
        return null;
      }
    }));
    _emit(results.whereType<Price>().toList());
  }
}

double? _num(dynamic v) {
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v);
  return null;
}

/// TCMB today.xml -> { 'USD': 41.61, ... } (döviz satış, birim başına)
Map<String, double> parseTcmbXml(String xml) {
  final out = <String, double>{};
  final re = RegExp(r'<Currency[^>]*Kod="([A-Z]{3})"[^>]*>([\s\S]*?)</Currency>');
  for (final m in re.allMatches(xml)) {
    final body = m.group(2)!;
    final unit = double.tryParse(RegExp(r'<Unit>([^<]*)</Unit>').firstMatch(body)?.group(1) ?? '') ?? 1;
    final selling = double.tryParse(RegExp(r'<ForexSelling>([^<]*)</ForexSelling>').firstMatch(body)?.group(1) ?? '');
    if (selling != null && selling > 0) out[m.group(1)!] = selling / unit;
  }
  return out;
}
