import 'dart:convert';

import 'package:http/http.dart' as http;

import '../logic/inflation.dart';
import '../models/models.dart';

/// Kıymet veri servisinin adresi. Boşsa uygulama sunucusuz (doğrudan veri) modda çalışır.
/// Sunucuyla çalıştırmak için (Android emülatöründen bilgisayardaki sunucuya):
/// flutter run --dart-define=KIYMET_API=http://10.0.2.2:8080
const apiBaseUrl = String.fromEnvironment('KIYMET_API');

class ApiClient {
  ApiClient({http.Client? client, this.baseUrl = apiBaseUrl}) : _client = client ?? http.Client();

  final http.Client _client;
  final String baseUrl;

  Uri get webSocketUri {
    final base = Uri.parse(baseUrl);
    return base.replace(scheme: base.scheme == 'https' ? 'wss' : 'ws', path: '/ws');
  }

  Future<Map<String, dynamic>> _get(String path) async {
    final res = await _client.get(Uri.parse('$baseUrl$path')).timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) {
      throw http.ClientException('${res.statusCode} $path');
    }
    return jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
  }

  Future<List<Instrument>> instruments() async {
    final body = await _get('/instruments');
    return [
      for (final item in body['instruments'] as List)
        Instrument.fromJson(item as Map<String, dynamic>),
    ];
  }

  Future<List<Price>> prices() async {
    final body = await _get('/prices');
    return [for (final p in body['prices'] as List) Price.fromJson(p as Map<String, dynamic>)];
  }

  Future<CpiSeries> inflation() async => CpiSeries.fromJson(await _get('/inflation'));
}
