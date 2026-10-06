import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/models.dart';

/// Varlıklar yalnızca cihazda saklanır (KVKK açısından en az veri ilkesi).
class HoldingsRepository {
  static const _key = 'holdings.v1';

  Future<List<Holding>> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return [];
    return [
      for (final item in jsonDecode(raw) as List) Holding.fromJson(item as Map<String, dynamic>),
    ];
  }

  Future<void> save(List<Holding> holdings) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, jsonEncode([for (final h in holdings) h.toJson()]));
  }
}
