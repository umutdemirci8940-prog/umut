import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../logic/inflation.dart';

/// Türkiye aylık TÜFE endeksi (OECD, TÜİK verisi). Anahtar gerektirmez.
///
/// Sırasıyla: bellekteki kopya → cihazda kayıtlı son indirme → uygulamaya gömülü dosya.
/// Ardından (en fazla 12 saatte bir) OECD'den güncel veri çekilmeye çalışılır.
class CpiSource {
  CpiSource({http.Client? client, AssetBundle? bundle})
      : _client = client ?? http.Client(),
        _bundle = bundle ?? rootBundle;

  static const asset = 'assets/data/cpi_tr.json';
  static const _prefsKey = 'cpi.v1';
  static final url = Uri.parse(
    'https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0/'
    'TUR.M.N.CPI.IX._T.N._Z?startPeriod=2005-01&format=csvfile',
  );

  final http.Client _client;
  final AssetBundle _bundle;
  CpiSeries? _series;
  DateTime? _lastFetch;

  Future<CpiSeries> load() async {
    _series ??= await _loadLocal();
    final stale = _lastFetch == null || DateTime.now().difference(_lastFetch!) > const Duration(hours: 12);
    if (stale) {
      _lastFetch = DateTime.now();
      try {
        final fresh = await _fetch();
        if (fresh.length >= (_series?.length ?? 0) && fresh.length > 100) {
          _series = fresh;
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_prefsKey, jsonEncode(fresh.toJson()));
        }
      } catch (_) {
        // Çevrimdışı: kayıtlı/gömülü veriyle devam
      }
    }
    return _series!;
  }

  Future<CpiSeries> _loadLocal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_prefsKey);
      if (saved != null) return CpiSeries.fromJson(jsonDecode(saved) as Map<String, dynamic>);
    } catch (_) {}
    try {
      return CpiSeries.fromJson(jsonDecode(await _bundle.loadString(asset)) as Map<String, dynamic>);
    } catch (_) {
      return CpiSeries.empty;
    }
  }

  Future<CpiSeries> _fetch() async {
    final res = await _client.get(url, headers: {'User-Agent': 'Kiymet/1.0'}).timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) throw http.ClientException('${res.statusCode}', url);
    return parseOecdCsv(utf8.decode(res.bodyBytes));
  }
}

/// OECD SDMX "csvfile" yanıtından TIME_PERIOD / OBS_VALUE sütunlarını okur.
CpiSeries parseOecdCsv(String csv) {
  final lines = const LineSplitter().convert(csv.replaceFirst('﻿', ''));
  if (lines.isEmpty) return CpiSeries.empty;
  final header = _splitCsv(lines.first);
  final timeCol = header.indexOf('TIME_PERIOD');
  final valueCol = header.indexOf('OBS_VALUE');
  if (timeCol < 0 || valueCol < 0) return CpiSeries.empty;
  final map = <String, double>{};
  for (final line in lines.skip(1)) {
    final cells = _splitCsv(line);
    if (cells.length <= timeCol || cells.length <= valueCol) continue;
    final month = cells[timeCol];
    final value = double.tryParse(cells[valueCol]);
    if (month.length >= 7 && value != null) map[month.substring(0, 7)] = value;
  }
  return CpiSeries(map);
}

List<String> _splitCsv(String line) {
  final out = <String>[];
  final buf = StringBuffer();
  var quoted = false;
  for (var i = 0; i < line.length; i++) {
    final ch = line[i];
    if (ch == '"') {
      if (quoted && i + 1 < line.length && line[i + 1] == '"') {
        buf.write('"');
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch == ',' && !quoted) {
      out.add(buf.toString());
      buf.clear();
    } else {
      buf.write(ch);
    }
  }
  out.add(buf.toString());
  return out;
}
