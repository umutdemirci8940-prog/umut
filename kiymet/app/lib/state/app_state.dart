import 'dart:async';

import 'package:flutter/foundation.dart';

import '../logic/inflation.dart';
import '../logic/portfolio.dart';
import '../models/models.dart';
import '../services/api_client.dart';
import '../services/backend_market_data.dart';
import '../services/direct_market_data.dart';
import '../services/holdings_repository.dart';
import '../services/market_data.dart';
import '../services/price_history.dart';

/// KIYMET_API verilmişse Kıymet veri servisine, verilmemişse doğrudan herkese açık kaynaklara bağlanır.
MarketData defaultMarketData() =>
    apiBaseUrl.isEmpty ? DirectMarketData() : BackendMarketData(ApiClient());

class AppState extends ChangeNotifier {
  AppState({MarketData? data, HoldingsRepository? repository, PriceHistory? history})
      : _data = data ?? defaultMarketData(),
        _repo = repository ?? HoldingsRepository(),
        history = history ?? PriceHistory();

  final MarketData _data;
  final HoldingsRepository _repo;

  /// Alış tarihindeki fiyatı otomatik doldurmak için.
  final PriceHistory history;
  final List<StreamSubscription> _subs = [];

  List<Instrument> _instruments = [];
  final Map<String, Instrument> _instrumentById = {};
  final Map<String, Price> _prices = {};
  List<Holding> _holdings = [];
  CpiSeries _cpi = CpiSeries.empty;
  StreamStatus _status = StreamStatus.connecting;
  PortfolioSummary? _summary;
  bool _loading = true;
  String? _error;

  List<Instrument> get instruments => _instruments;
  Map<String, Price> get prices => _prices;
  List<Holding> get holdings => List.unmodifiable(_holdings);
  CpiSeries get cpi => _cpi;
  StreamStatus get status => _status;
  bool get loading => _loading;
  String? get error => _error;

  PortfolioSummary get summary => _summary ??= PortfolioSummary.compute(_holdings, _prices, _cpi);

  Instrument instrument(String id) => _instrumentById[id] ?? Instrument.placeholder(id);

  List<Instrument> instrumentsOf(AssetType type) =>
      _instruments.where((i) => i.type == type).toList();

  Future<void> init() async {
    _holdings = await _repo.load();
    _subs
      ..add(_data.prices.listen(_applyPrices))
      ..add(_data.status.listen((s) {
        _status = s;
        notifyListeners();
      }));
    _data
      ..start()
      ..watch(_holdings.map((h) => h.instrumentId));
    await refresh();
  }

  /// Katalog, enflasyon ve son fiyatları sunucudan yeniden çeker.
  Future<void> refresh() async {
    try {
      final results = await Future.wait([_data.instruments(), _data.inflation(), _data.snapshot()]);
      _instruments = results[0] as List<Instrument>;
      _instrumentById
        ..clear()
        ..addEntries(_instruments.map((i) => MapEntry(i.id, i)));
      _cpi = results[1] as CpiSeries;
      _error = null;
      _applyPrices(results[2] as List<Price>);
    } catch (e) {
      _error = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
      debugPrint('refresh hatası: $e');
    } finally {
      _loading = false;
      _invalidate();
    }
  }

  void _applyPrices(List<Price> list) {
    for (final p in list) {
      _prices[p.id] = p;
      // Katalogda olmayan (ör. yeni listelenen coin) varlıkları da göster.
      if (!_instrumentById.containsKey(p.id) && _instrumentById.isNotEmpty) {
        final i = Instrument.placeholder(p.id);
        _instrumentById[p.id] = i;
        _instruments = [..._instruments, i];
      }
    }
    _invalidate();
  }

  void _invalidate() {
    _summary = null;
    notifyListeners();
  }

  Future<void> addHolding(Holding holding) async {
    _holdings = [..._holdings, holding];
    _data.watch(_holdings.map((h) => h.instrumentId));
    _invalidate();
    await _repo.save(_holdings);
  }

  Future<void> removeHolding(String id) async {
    _holdings = _holdings.where((h) => h.id != id).toList();
    _invalidate();
    await _repo.save(_holdings);
  }

  void onAppPaused() => _data.pause();
  void onAppResumed() {
    _data.start();
    refresh();
  }

  @override
  void dispose() {
    for (final s in _subs) {
      s.cancel();
    }
    _data.dispose();
    super.dispose();
  }
}
