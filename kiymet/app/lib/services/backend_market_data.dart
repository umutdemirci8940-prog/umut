import '../logic/inflation.dart';
import '../models/models.dart';
import 'api_client.dart';
import 'market_data.dart';
import 'price_stream.dart';

class BackendMarketData implements MarketData {
  BackendMarketData(this._api) : _stream = PriceStream(_api.webSocketUri);

  final ApiClient _api;
  final PriceStream _stream;

  @override
  Stream<List<Price>> get prices => _stream.prices;
  @override
  Stream<StreamStatus> get status => _stream.status;

  @override
  Future<List<Instrument>> instruments() => _api.instruments();
  @override
  Future<List<Price>> snapshot() => _api.prices();
  @override
  Future<CpiSeries> inflation() => _api.inflation();

  @override
  void start() => _stream.start();
  @override
  void pause() => _stream.pause();
  @override
  void watch(Iterable<String> ids) => _stream.watch(ids);
  @override
  void dispose() => _stream.dispose();
}
