import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../logic/catalog.dart';
import '../logic/inflation.dart';
import '../models/models.dart';
import 'cpi_source.dart';
import 'market_data.dart';

/// Kıymet fiyat yayını (GitHub Pages'te statik JSON). Mağaza sürümünün tek veri kaynağıdır:
/// yayıncı yalnızca ücretsiz ve kullanım koşulları uygun kaynakları (TCMB, TCMB EVDS, OECD, BIS
/// ve yazılı onaydan sonra CoinPaprika) kullanır. Uygulama, yayında bulunan varlıkları gösterir.
const feedBaseUrl = String.fromEnvironment('KIYMET_FEED');

class FeedMarketData implements MarketData {
  FeedMarketData({http.Client? client, CpiSource? cpi, this.baseUrl = feedBaseUrl})
      : _client = client ?? http.Client(),
        _cpi = cpi ?? CpiSource();

  final String baseUrl;
  final http.Client _client;
  final CpiSource _cpi;
  final _prices = StreamController<List<Price>>.broadcast();
  final _status = StreamController<StreamStatus>.broadcast();
  Timer? _timer;
  bool _active = false;
  Map<String, dynamic>? _feed;
  DateTime? _lastSuccess;

  /// Yayının kaynak ibaresi (ör. "Kaynaklar: TCMB, TCMB EVDS, OECD, BIS").
  String get attribution => _feed?['attribution'] as String? ?? 'Kaynaklar: TCMB, TCMB EVDS, OECD, BIS';

  @override
  Stream<List<Price>> get prices => _prices.stream;
  @override
  Stream<StreamStatus> get status => _status.stream;

  Future<Map<String, dynamic>> _load({bool force = false}) async {
    if (_feed != null && !force) return _feed!;
    // CDN önbelleğini dakikada bir aşmak için sorgu parametresi
    final bucket = DateTime.now().millisecondsSinceEpoch ~/ 60000;
    final res = await _client
        .get(Uri.parse('$baseUrl/prices.json?t=$bucket'))
        .timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) throw http.ClientException('${res.statusCode}', Uri.parse(baseUrl));
    _feed = jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
    _lastSuccess = DateTime.now();
    return _feed!;
  }

  List<Price> _parsePrices(Map<String, dynamic> feed) => [
        for (final p in (feed['prices'] as List? ?? const [])) Price.fromJson(p as Map<String, dynamic>),
      ];

  @override
  Future<List<Instrument>> instruments() async {
    final ids = _parsePrices(await _load()).map((p) => p.id).toSet();
    return buildCatalog(extraCrypto: ids.where((i) => i.startsWith('CRYPTO:')).map((i) => i.substring(7)))
        .where((i) => ids.contains(i.id))
        .toList();
  }

  @override
  Future<List<Price>> snapshot() async => _parsePrices(await _load());

  /// Yayındaki TÜFE ile cihazdaki/gömülü seriden daha güncel olanı.
  @override
  Future<CpiSeries> inflation() async {
    final local = await _cpi.load();
    final remote = _feed?['cpi'];
    if (remote is Map<String, dynamic>) {
      final series = CpiSeries.fromJson(remote);
      if (isNewer(series, local)) return series;
    }
    return local;
  }

  @override
  void start() {
    if (_active) return;
    _active = true;
    _status.add(StreamStatus.connecting);
    _poll();
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _poll());
  }

  Future<void> _poll() async {
    try {
      final feed = await _load(force: true);
      if (!_active) return;
      _prices.add(_parsePrices(feed));
    } catch (_) {
      // çevrimdışı: son bilinen fiyatlarla devam
    }
    if (!_active) return;
    final ok = _lastSuccess != null && DateTime.now().difference(_lastSuccess!) < const Duration(minutes: 3);
    _status.add(ok ? StreamStatus.live : StreamStatus.offline);
  }

  @override
  void pause() {
    _active = false;
    _timer?.cancel();
  }

  @override
  void watch(Iterable<String> ids) {}

  @override
  void dispose() {
    pause();
    _prices.close();
    _status.close();
    _client.close();
  }
}
