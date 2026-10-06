import '../logic/inflation.dart';
import '../models/models.dart';

enum StreamStatus { connecting, live, offline }

/// Fiyat kaynağı. İki uygulaması var:
/// - [BackendMarketData]: Kıymet veri servisine WebSocket ile bağlanır (yayın için önerilen).
/// - [DirectMarketData]: Sunucu olmadan, herkese açık kaynakları cihazdan çeker (test/geliştirme).
abstract class MarketData {
  Stream<List<Price>> get prices;
  Stream<StreamStatus> get status;

  Future<List<Instrument>> instruments();
  Future<List<Price>> snapshot();
  Future<CpiSeries> inflation();

  void start();

  /// Uygulama arka plana geçince pil/veri tasarrufu için durdurulur.
  void pause();

  /// Portföydeki varlıkların fiyatlarının da takip edilmesini sağlar.
  void watch(Iterable<String> ids);
  void dispose();
}

Price makePrice(String id, double price, {double? prevClose, required String source, bool delayed = false}) {
  final prev = (prevClose != null && prevClose > 0) ? prevClose : null;
  return Price(
    id: id,
    price: price,
    prevClose: prev,
    changePct: prev == null ? null : (price - prev) / prev * 100,
    source: source,
    delayed: delayed,
    updatedAt: DateTime.now(),
  );
}
