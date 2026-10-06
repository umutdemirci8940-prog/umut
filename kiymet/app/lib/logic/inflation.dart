/// Aylık TÜFE endeksi (TCMB EVDS). Reel getiri hesabında kullanılır.
class CpiSeries {
  CpiSeries(Map<String, double> byMonth)
      : _byMonth = Map.unmodifiable(byMonth),
        _months = (byMonth.keys.toList()..sort());

  factory CpiSeries.fromJson(Map<String, dynamic> json) {
    final map = <String, double>{};
    for (final item in (json['series'] as List? ?? const [])) {
      final m = item as Map<String, dynamic>;
      map[m['month'] as String] = (m['index'] as num).toDouble();
    }
    return CpiSeries(map);
  }

  static final empty = CpiSeries(const {});

  final Map<String, double> _byMonth;
  final List<String> _months;

  bool get isEmpty => _months.isEmpty;
  String? get latestMonth => _months.isEmpty ? null : _months.last;
  double? get latestIndex => isEmpty ? null : _byMonth[_months.last];

  static String monthKey(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}';

  /// Tarihin ait olduğu ayın endeksi. Ay henüz açıklanmadıysa en son endeks,
  /// seriden önceyse null döner.
  double? indexAt(DateTime date) {
    if (isEmpty) return null;
    final key = monthKey(date);
    final exact = _byMonth[key];
    if (exact != null) return exact;
    if (key.compareTo(_months.last) > 0) return _byMonth[_months.last];
    return null;
  }

  /// Alım tarihinden bugüne fiyatlar genel düzeyinin kaç kat arttığı.
  double? inflationFactorSince(DateTime date) {
    final then = indexAt(date);
    final now = latestIndex;
    if (then == null || now == null || then <= 0) return null;
    return now / then;
  }
}
