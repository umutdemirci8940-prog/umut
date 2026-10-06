import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

import '../models/models.dart';
import 'market_data.dart';

/// Sunucudan canlı fiyatları alan, kopunca artan aralıklarla yeniden bağlanan WebSocket istemcisi.
class PriceStream {
  PriceStream(this.uri);

  final Uri uri;
  final _prices = StreamController<List<Price>>.broadcast();
  final _status = StreamController<StreamStatus>.broadcast();

  WebSocketChannel? _channel;
  StreamSubscription? _sub;
  Timer? _retry;
  int _attempt = 0;
  bool _active = false;
  Set<String> _watch = {};

  Stream<List<Price>> get prices => _prices.stream;
  Stream<StreamStatus> get status => _status.stream;

  void start() {
    if (_active) return;
    _active = true;
    _connect();
  }

  /// Uygulama arka plana geçince pil/veri tasarrufu için bağlantıyı kapatır.
  void pause() {
    _active = false;
    _retry?.cancel();
    _sub?.cancel();
    _channel?.sink.close();
    _channel = null;
  }

  /// Portföydeki varlıkları sunucuya bildirir (katalog dışı hisseler de izlensin diye).
  void watch(Iterable<String> ids) {
    _watch = ids.toSet();
    _sendWatch();
  }

  void _sendWatch() {
    if (_channel == null || _watch.isEmpty) return;
    _channel!.sink.add(jsonEncode({'type': 'watch', 'ids': _watch.toList()}));
  }

  Future<void> _connect() async {
    if (!_active) return;
    _status.add(StreamStatus.connecting);
    try {
      final channel = WebSocketChannel.connect(uri);
      await channel.ready;
      if (!_active) {
        channel.sink.close();
        return;
      }
      _channel = channel;
      _attempt = 0;
      _status.add(StreamStatus.live);
      _sendWatch();
      _sub = channel.stream.listen(
        _onMessage,
        onDone: _scheduleReconnect,
        onError: (_) => _scheduleReconnect(),
        cancelOnError: true,
      );
    } catch (_) {
      _scheduleReconnect();
    }
  }

  void _onMessage(dynamic data) {
    final msg = jsonDecode(data as String) as Map<String, dynamic>;
    final list = msg['prices'] as List?;
    if (list == null) return;
    _prices.add([for (final p in list) Price.fromJson(p as Map<String, dynamic>)]);
  }

  void _scheduleReconnect() {
    _channel = null;
    if (!_active) return;
    _status.add(StreamStatus.offline);
    _attempt++;
    final seconds = [1, 2, 5, 10, 30][(_attempt - 1).clamp(0, 4)];
    _retry?.cancel();
    _retry = Timer(Duration(seconds: seconds), _connect);
  }

  void dispose() {
    pause();
    _prices.close();
    _status.close();
  }
}
