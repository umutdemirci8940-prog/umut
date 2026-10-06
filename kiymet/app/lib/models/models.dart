enum AssetType {
  metal('Altın & Gümüş'),
  currency('Döviz'),
  crypto('Kripto'),
  stock('Hisse');

  const AssetType(this.label);
  final String label;

  static AssetType parse(String value) => switch (value) {
        'metal' => AssetType.metal,
        'currency' => AssetType.currency,
        'crypto' => AssetType.crypto,
        'stock' => AssetType.stock,
        _ => throw FormatException('Bilinmeyen varlık türü: $value'),
      };

  static AssetType ofId(String instrumentId) => switch (instrumentId.split(':').first) {
        'METAL' => AssetType.metal,
        'FX' => AssetType.currency,
        'CRYPTO' => AssetType.crypto,
        _ => AssetType.stock,
      };
}

/// Takip edilebilir bir varlık (ör. METAL:CEYREK, CRYPTO:BTC, STOCK:THYAO).
class Instrument {
  const Instrument({
    required this.id,
    required this.type,
    required this.code,
    required this.name,
    required this.unit,
    this.featured = false,
  });

  final String id;
  final AssetType type;
  final String code;
  final String name;
  final String unit;
  final bool featured;

  factory Instrument.fromJson(Map<String, dynamic> json) => Instrument(
        id: json['id'] as String,
        type: AssetType.parse(json['type'] as String),
        code: json['code'] as String,
        name: json['name'] as String,
        unit: json['unit'] as String,
        featured: json['featured'] as bool? ?? false,
      );

  /// Katalog henüz yüklenmemişken kayıtlı varlığı göstermek için.
  factory Instrument.placeholder(String id) {
    final code = id.split(':').last;
    return Instrument(id: id, type: AssetType.ofId(id), code: code, name: code, unit: '');
  }
}

/// TRY cinsinden son fiyat.
class Price {
  const Price({
    required this.id,
    required this.price,
    this.prevClose,
    this.changePct,
    this.source = '',
    this.delayed = false,
    required this.updatedAt,
  });

  final String id;
  final double price;
  final double? prevClose;
  final double? changePct;
  final String source;
  final bool delayed;
  final DateTime updatedAt;

  factory Price.fromJson(Map<String, dynamic> json) => Price(
        id: json['id'] as String,
        price: (json['price'] as num).toDouble(),
        prevClose: (json['prevClose'] as num?)?.toDouble(),
        changePct: (json['changePct'] as num?)?.toDouble(),
        source: json['source'] as String? ?? '',
        delayed: json['delayed'] as bool? ?? false,
        updatedAt: DateTime.fromMillisecondsSinceEpoch((json['ts'] as num).toInt()),
      );
}

/// Kullanıcının sahip olduğu bir varlık alımı.
class Holding {
  const Holding({
    required this.id,
    required this.instrumentId,
    required this.quantity,
    required this.unitCost,
    required this.purchaseDate,
    this.note,
  });

  final String id;
  final String instrumentId;
  final double quantity;

  /// Birim alış fiyatı (TRY).
  final double unitCost;
  final DateTime purchaseDate;
  final String? note;

  double get cost => quantity * unitCost;
  AssetType get type => AssetType.ofId(instrumentId);

  Map<String, dynamic> toJson() => {
        'id': id,
        'instrumentId': instrumentId,
        'quantity': quantity,
        'unitCost': unitCost,
        'purchaseDate': purchaseDate.toIso8601String(),
        if (note != null) 'note': note,
      };

  factory Holding.fromJson(Map<String, dynamic> json) => Holding(
        id: json['id'] as String,
        instrumentId: json['instrumentId'] as String,
        quantity: (json['quantity'] as num).toDouble(),
        unitCost: (json['unitCost'] as num).toDouble(),
        purchaseDate: DateTime.parse(json['purchaseDate'] as String),
        note: json['note'] as String?,
      );
}
