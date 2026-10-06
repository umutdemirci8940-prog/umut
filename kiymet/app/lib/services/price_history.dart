import 'dart:convert';

import 'package:http/http.dart' as http;

import '../logic/metals.dart';
import 'direct_market_data.dart' show parseTcmbXml;

/// Geçmiş bir günün kapanış fiyatı (TRY).
class HistoricalPrice {
  const HistoricalPrice({required this.price, required this.date, required this.source});
  final double price;

  /// Verinin ait olduğu gün (hafta sonu/tatilde önceki iş günü olabilir).
  final DateTime date;
  final String source;
}

/// Alış tarihindeki fiyatı bulur. Kaynaklar canlı fiyatlarla tutarlı seçilmiştir:
/// - Döviz: TCMB günlük kur arşivi
/// - Kripto: Binance günlük kapanış (TRY paritesi, yoksa USDT paritesi × USDT/TRY)
/// - Altın: Binance PAXG/USDT (yoksa Yahoo GC=F) × USD/TRY, gümüş: Yahoo SI=F × USD/TRY
/// - BIST: Yahoo Finance (TEST SÜRÜMÜ: ticari yayın için lisanslı kaynakla değiştirilmeli)
class PriceHistory {
  PriceHistory({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  final Map<String, Future<HistoricalPrice?>> _cache = {};

  static const _headers = {'User-Agent': 'Mozilla/5.0 (Kiymet)', 'Accept': '*/*'};

  /// Bulunamazsa null döner (ör. varlık o tarihte işlem görmüyordu).
  Future<HistoricalPrice?> priceOn(String instrumentId, DateTime date) {
    final day = DateTime.utc(date.year, date.month, date.day);
    final key = '$instrumentId@${day.toIso8601String()}';
    return _cache[key] ??= _resolve(instrumentId, day).catchError((_) => null).then((v) {
      if (v == null) _cache.remove(key); // başarısız sonucu önbellekte tutma
      return v;
    });
  }

  Future<HistoricalPrice?> _resolve(String id, DateTime day) async {
    final parts = id.split(':');
    if (parts.length != 2) return null;
    final code = parts[1];
    return switch (parts[0]) {
      'FX' => _fx(code, day),
      'CRYPTO' => _crypto(code, day),
      'METAL' => _metal(code, day),
      'STOCK' => _yahooTry('$code.IS', day, 'Yahoo Finance'),
      _ => null,
    };
  }

  Future<dynamic> _getJson(Uri uri) async {
    final res = await _client.get(uri, headers: _headers).timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) return null;
    return jsonDecode(utf8.decode(res.bodyBytes));
  }

  // --- TCMB: hafta sonu/tatil için 7 güne kadar geriye gider ---
  Future<HistoricalPrice?> _fx(String code, DateTime day) async {
    for (var back = 0; back < 7; back++) {
      final d = day.subtract(Duration(days: back));
      final yyyymm = '${d.year}${_pad2(d.month)}';
      final ddmmyyyy = '${_pad2(d.day)}${_pad2(d.month)}${d.year}';
      final res = await _client
          .get(Uri.parse('https://www.tcmb.gov.tr/kurlar/$yyyymm/$ddmmyyyy.xml'), headers: _headers)
          .timeout(const Duration(seconds: 10));
      if (res.statusCode != 200) continue;
      final rate = parseTcmbXml(utf8.decode(res.bodyBytes))[code];
      if (rate != null) return HistoricalPrice(price: rate, date: d, source: 'TCMB');
    }
    return null;
  }

  // --- Binance günlük mum kapanışı ---
  Future<double?> _binanceClose(String symbol, DateTime day) async {
    final body = await _getJson(Uri.https('api.binance.com', '/api/v3/klines', {
      'symbol': symbol,
      'interval': '1d',
      'startTime': '${day.millisecondsSinceEpoch}',
      'limit': '1',
    }));
    if (body is! List || body.isEmpty) return null;
    final candle = body.first as List;
    // Varlık o gün listelenmemişse Binance sonraki ilk mumu döndürür: tarihi doğrula.
    if ((candle[0] as num).toInt() != day.millisecondsSinceEpoch) return null;
    return double.tryParse(candle[4].toString());
  }

  /// O günün USD/TRY değeri: canlı hesaplamayla tutarlı olsun diye USDT/TRY, yoksa Yahoo TRY=X.
  Future<double?> _usdTry(DateTime day) async =>
      await _binanceClose('USDTTRY', day) ?? (await _yahooClose('TRY=X', day))?.$1;

  Future<HistoricalPrice?> _crypto(String code, DateTime day) async {
    if (code == 'USDT') {
      final v = await _usdTry(day);
      return v == null ? null : HistoricalPrice(price: v, date: day, source: 'Binance');
    }
    final direct = await _binanceClose('${code}TRY', day);
    if (direct != null) return HistoricalPrice(price: direct, date: day, source: 'Binance');
    final usdt = await _binanceClose('${code}USDT', day);
    final usdTry = await _usdTry(day);
    if (usdt == null || usdTry == null) return null;
    return HistoricalPrice(price: usdt * usdTry, date: day, source: 'Binance');
  }

  Future<HistoricalPrice?> _metal(String code, DateTime day) async {
    final product = metalProducts.where((m) => m.code == code).firstOrNull;
    if (product == null) return null;
    double? ounce;
    var date = day;
    if (product.silver) {
      final r = await _yahooClose('SI=F', day);
      (ounce, date) = (r?.$1, r?.$2 ?? day);
    } else {
      ounce = await _binanceClose('PAXGUSDT', day);
      if (ounce == null) {
        final r = await _yahooClose('GC=F', day);
        (ounce, date) = (r?.$1, r?.$2 ?? day);
      }
    }
    final usdTry = await _usdTry(date) ?? await _usdTry(day);
    final value = productValueTry(product, ounce, usdTry);
    return value == null ? null : HistoricalPrice(price: value, date: date, source: 'Has değer');
  }

  Future<HistoricalPrice?> _yahooTry(String symbol, DateTime day, String source) async {
    final r = await _yahooClose(symbol, day);
    return r == null ? null : HistoricalPrice(price: r.$1, date: r.$2, source: source);
  }

  /// Verilen gün veya öncesindeki son işlem gününün kapanışı.
  Future<(double, DateTime)?> _yahooClose(String symbol, DateTime day) async {
    final from = day.subtract(const Duration(days: 7));
    final to = day.add(const Duration(days: 1));
    final body = await _getJson(Uri.https('query1.finance.yahoo.com', '/v8/finance/chart/$symbol', {
      'period1': '${from.millisecondsSinceEpoch ~/ 1000}',
      'period2': '${to.millisecondsSinceEpoch ~/ 1000}',
      'interval': '1d',
    }));
    return parseYahooCloseOnOrBefore(body, day);
  }
}

String _pad2(int n) => n.toString().padLeft(2, '0');

/// Yahoo chart yanıtından [day] gününe (dahil) kadarki son kapanışı seçer.
(double, DateTime)? parseYahooCloseOnOrBefore(dynamic body, DateTime day) {
  if (body is! Map) return null;
  final chart = body['chart'];
  final results = chart is Map ? chart['result'] : null;
  final result = results is List && results.isNotEmpty ? results.first : null;
  if (result is! Map) return null;
  final stamps = result['timestamp'] is List ? result['timestamp'] as List : const [];
  final indicators = result['indicators'];
  final quotes = indicators is Map ? indicators['quote'] : null;
  final quote = quotes is List && quotes.isNotEmpty ? quotes.first : null;
  final closes = quote is Map && quote['close'] is List ? quote['close'] as List : const [];
  final end = day.add(const Duration(days: 1));
  (double, DateTime)? best;
  for (var i = 0; i < stamps.length && i < closes.length; i++) {
    final t = DateTime.fromMillisecondsSinceEpoch((stamps[i] as num).toInt() * 1000, isUtc: true);
    final c = closes[i];
    if (c is! num || !t.isBefore(end)) continue;
    best = (c.toDouble(), DateTime.utc(t.year, t.month, t.day));
  }
  return best;
}
