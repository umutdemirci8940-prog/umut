// Mağaza ekran görüntülerini üretir (gerçek uygulama arayüzü, örnek verilerle).
// Çalıştırma: flutter test test_store/store_screenshots_test.dart
// Çıktı: build/store_screens/*.png (1290×2796, iPhone 6.9")
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/painting.dart' show debugDisableShadows;
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:kiymet/logic/catalog.dart';
import 'package:kiymet/logic/inflation.dart';
import 'package:kiymet/logic/metals.dart';
import 'package:kiymet/main.dart';
import 'package:kiymet/models/debt.dart';
import 'package:kiymet/models/models.dart';
import 'package:kiymet/services/market_data.dart';
import 'package:kiymet/services/price_history.dart';
import 'package:kiymet/state/app_state.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

const out = 'build/store_screens';
const logicalSize = Size(430, 932); // iPhone 16 Pro Max
const dpr = 3.0;

// Örnek (temsili) piyasa değerleri
const usdTry = 42.15, eurTry = 49.30, gbpTry = 56.40, chfTry = 52.70;
const xau = 3985.0, xag = 48.6;

List<Price> demoPrices() {
  final out = <Price>[];
  for (final m in metalProducts) {
    final v = productValueTry(m, m.silver ? xag : xau, usdTry)!;
    out.add(makePrice(m.id, v, prevClose: v / (m.silver ? 0.988 : 1.0062), source: 'demo'));
  }
  out.addAll([
    makePrice('FX:USD', usdTry, prevClose: 42.08, source: 'demo'),
    makePrice('FX:EUR', eurTry, prevClose: 49.41, source: 'demo'),
    makePrice('FX:GBP', gbpTry, prevClose: 56.31, source: 'demo'),
    makePrice('FX:CHF', chfTry, prevClose: 52.55, source: 'demo'),
  ]);
  const crypto = {
    'BTC': (4920000.0, 4815000.0), 'ETH': (178400.0, 181900.0), 'USDT': (42.2, 42.13),
    'SOL': (9350.0, 9010.0), 'XRP': (118.4, 115.9), 'AVAX': (1290.0, 1312.0),
    'DOGE': (10.85, 10.41), 'ADA': (34.6, 34.1), 'BNB': (46900.0, 46200.0), 'LINK': (905.0, 921.0),
  };
  crypto.forEach((k, v) => out.add(makePrice('CRYPTO:$k', v.$1, prevClose: v.$2, source: 'demo')));
  const stocks = {
    'THYAO': (318.25, 312.0), 'ASELS': (176.9, 173.4), 'GARAN': (142.6, 143.9), 'BIMAS': (578.0, 571.5),
    'AKBNK': (71.35, 70.1), 'KCHOL': (198.4, 199.9), 'TUPRS': (172.3, 169.8), 'SISE': (41.06, 40.78),
  };
  stocks.forEach((k, v) => out.add(makePrice('STOCK:$k', v.$1, prevClose: v.$2, source: 'demo')));
  return out;
}

class DemoMarketData implements MarketData {
  DemoMarketData(this.cpi);
  final CpiSeries cpi;
  final _p = StreamController<List<Price>>.broadcast();
  final _s = StreamController<StreamStatus>.broadcast();
  @override
  Stream<List<Price>> get prices => _p.stream;
  @override
  Stream<StreamStatus> get status => _s.stream;
  @override
  Future<List<Instrument>> instruments() async => buildCatalog();
  @override
  Future<List<Price>> snapshot() async => demoPrices();
  @override
  Future<CpiSeries> inflation() async => cpi;
  @override
  void start() => _s.add(StreamStatus.live);
  @override
  void pause() {}
  @override
  void watch(Iterable<String> ids) {}
  @override
  void dispose() {}
}

/// Detay ekranındaki "o gün" karşılaştırması için temsili geçmiş fiyatlar.
PriceHistory demoHistory() => PriceHistory(
      client: MockClient((req) async {
        final url = req.url.toString();
        if (url.contains('klines')) {
          final start = req.url.queryParameters['startTime']!;
          final symbol = req.url.queryParameters['symbol'];
          final close = symbol == 'PAXGUSDT' ? 2035.0 : 30.25;
          return http.Response(jsonEncode([
            [int.parse(start), '0', '0', '0', '$close', '0']
          ]), 200);
        }
        if (url.contains('tcmb')) {
          return http.Response(
              '<Currency Kod="USD"><Unit>1</Unit><ForexSelling>30.2120</ForexSelling></Currency>', 200);
        }
        return http.Response('', 404);
      }),
    );

Holding h(String id, double qty, double cost, DateTime d) =>
    Holding(id: id + d.toIso8601String(), instrumentId: id, quantity: qty, unitCost: cost, purchaseDate: d);

Future<void> loadFonts() async {
  Future<void> load(String family, List<String> paths) async {
    final loader = FontLoader(family);
    for (final p in paths) {
      loader.addFont(Future.value(ByteData.sublistView(File(p).readAsBytesSync())));
    }
    await loader.load();
  }

  await load('Inter', [
    for (final w in ['Regular', 'Medium', 'SemiBold', 'Bold']) 'assets/fonts/Inter-$w.otf',
  ]);
  final sdk = Platform.environment['FLUTTER_ROOT']!;
  final icons = '$sdk/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf';
  await load('MaterialIcons', [icons]);
}

void main() {
  final shotKey = GlobalKey();

  Future<void> shot(WidgetTester tester, String name) async {
    await tester.pumpAndSettle();
    final boundary = shotKey.currentContext!.findRenderObject()! as RenderRepaintBoundary;
    await tester.runAsync(() async {
      final ui.Image image = await boundary.toImage(pixelRatio: dpr);
      final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
      File('$out/$name.png')
        ..createSync(recursive: true)
        ..writeAsBytesSync(bytes!.buffer.asUint8List());
    });
  }

  testWidgets('mağaza ekran görüntüleri', (tester) async {
    await tester.runAsync(loadFonts);
    // Dokunmatik cihaz gibi davran: klavye odak çerçevesi çizilmesin
    FocusManager.instance.highlightStrategy = FocusHighlightStrategy.alwaysTouch;
    // flutter_test gölgeleri siyah çizgi olarak çizer; gerçek gölgeleri aç
    debugDisableShadows = false;
    await initializeDateFormatting('tr_TR');
    tester.view.physicalSize = logicalSize * dpr;
    tester.view.devicePixelRatio = dpr;
    tester.view.padding = const FakeViewPadding(top: 59 * dpr, bottom: 34 * dpr);
    addTearDown(tester.view.reset);

    final cpi = CpiSeries.fromJson(jsonDecode(File('assets/data/cpi_tr.json').readAsStringSync()));
    final now = DateTime.now();
    SharedPreferences.setMockInitialValues({
      'holdings.v1': jsonEncode([
        h('METAL:CEYREK', 12, 3350, DateTime(2024, 2, 12)).toJson(),
        h('METAL:GRAM_ALTIN', 40, 2450, DateTime(2024, 6, 3)).toJson(),
        h('FX:USD', 1500, 34.0, DateTime(2024, 8, 20)).toJson(),
        h('METAL:GRAM_GUMUS', 600, 33.5, DateTime(2024, 6, 10)).toJson(),
        h('CRYPTO:ETH', 0.8, 105000, DateTime(2025, 3, 10)).toJson(),
        h('CRYPTO:BTC', 0.045, 3500000, DateTime(2025, 1, 15)).toJson(),
        h('METAL:AYAR22', 25, 2900, DateTime(2025, 2, 1)).toJson(),
      ]),
      'debts.v1': jsonEncode([
        Debt(id: '1', person: 'Ahmet Yılmaz', direction: DebtDirection.lent, assetId: cashTryId,
                amount: 75000, date: DateTime(2024, 1, 15), note: 'Araba peşinatı için')
            .toJson(),
        Debt(id: '2', person: 'Elif', direction: DebtDirection.lent, assetId: 'METAL:CEYREK', amount: 3,
                date: DateTime(2025, 5, 20))
            .toJson(),
        Debt(id: '3', person: 'Can', direction: DebtDirection.lent, assetId: cashTryId, amount: 12500,
                date: DateTime(2025, 9, 1))
            .toJson(),
        Debt(id: '4', person: 'Kardeşim', direction: DebtDirection.borrowed, assetId: 'FX:EUR', amount: 800,
                date: DateTime(2025, 11, 3))
            .toJson(),
      ]),
    });

    final state = AppState(data: DemoMarketData(cpi), history: demoHistory());
    await tester.pumpWidget(RepaintBoundary(
      key: shotKey,
      child: ChangeNotifierProvider.value(value: state, child: const KiymetApp()),
    ));
    await tester.runAsync(state.init);

    // 1) Portföy
    await shot(tester, '01_portfoy');

    // 2) Piyasalar – altın
    await tester.tap(find.text('Piyasalar'));
    await shot(tester, '02_piyasalar_altin');

    // 3) Piyasalar – kripto
    await tester.tap(find.text('Kripto').first);
    await shot(tester, '03_piyasalar_kripto');

    // 4) Varlık ekle – çeyrek altın formu
    await tester.tap(find.text('Portföyüm'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Varlık ekle'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Çeyrek Altın'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextFormField, 'Adet'), '5');
    FocusManager.instance.primaryFocus?.unfocus();
    await shot(tester, '04_varlik_ekle');
    for (var i = 0; i < 2; i++) {
      await tester.tap(find.byType(BackButton).last);
      await tester.pumpAndSettle();
    }

    // 5) Alacak & Borç
    await tester.tap(find.text('Alacak & Borç'));
    await shot(tester, '05_alacak_borc');

    // 6) Alacak detayı – enflasyon kaybı ve altın/dolar karşılaştırması
    await tester.tap(find.text('Ahmet Yılmaz'));
    await tester.pumpAndSettle();
    await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 200)));
    await shot(tester, '06_alacak_detay');

    expect(now, isNotNull);
    debugDisableShadows = true; // test sonu değişmez kontrolü için geri al
  });
}
