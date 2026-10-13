enum DebtDirection {
  lent('Alacak', 'Alacaklarım'),
  borrowed('Borç', 'Borçlarım');

  const DebtDirection(this.label, this.plural);
  final String label;
  final String plural;
}

/// Nakit Türk lirası için varlık kimliği.
const cashTryId = 'CASH:TRY';

/// Birine verilen (alacak) ya da birinden alınan (borç) para veya varlık.
class Debt {
  const Debt({
    required this.id,
    required this.person,
    required this.direction,
    required this.assetId,
    required this.amount,
    this.date,
    this.note,
  });

  final String id;
  final String person;
  final DebtDirection direction;

  /// [cashTryId] ya da katalogdaki bir varlık (ör. FX:USD, METAL:CEYREK).
  final String assetId;

  /// TL tutarı ya da varlık miktarı (adet, gram, dolar…).
  final double amount;

  /// Verildiği/alındığı tarih; hatırlanmıyorsa null.
  final DateTime? date;
  final String? note;

  bool get isCash => assetId == cashTryId;

  Map<String, dynamic> toJson() => {
        'id': id,
        'person': person,
        'direction': direction.name,
        'assetId': assetId,
        'amount': amount,
        if (date != null) 'date': date!.toIso8601String(),
        if (note != null) 'note': note,
      };

  factory Debt.fromJson(Map<String, dynamic> json) => Debt(
        id: json['id'] as String,
        person: json['person'] as String,
        direction: DebtDirection.values.byName(json['direction'] as String),
        assetId: json['assetId'] as String,
        amount: (json['amount'] as num).toDouble(),
        date: json['date'] == null ? null : DateTime.parse(json['date'] as String),
        note: json['note'] as String?,
      );
}
