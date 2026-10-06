import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:kiymet/logic/catalog.dart';
import 'package:kiymet/logic/inflation.dart';
import 'package:kiymet/main.dart';
import 'package:kiymet/models/models.dart';
import 'package:kiymet/services/market_data.dart';
import 'package:kiymet/state/app_state.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FakeMarketData implements MarketData {
  final _prices = StreamController<List<Price>>.broadcast();
  final _status = StreamController<StreamStatus>.broadcast();

  @override
  Stream<List<Price>> get prices => _prices.stream;
  @override
  Stream<StreamStatus> get status => _status.stream;
  @override
  Future<List<Instrument>> instruments() async => buildCatalog();
  @override
  Future<List<Price>> snapshot() async => [
        makePrice('METAL:CEYREK', 10500, prevClose: 10400, source: 'test'),
        makePrice('CRYPTO:BTC', 4000000, prevClose: 3900000, source: 'test'),
      ];
  @override
  Future<CpiSeries> inflation() async => CpiSeries.empty;
  @override
  void start() => _status.add(StreamStatus.live);
  @override
  void pause() {}
  @override
  void watch(Iterable<String> ids) {}
  @override
  void dispose() {
    _prices.close();
    _status.close();
  }
}

void main() {
  setUpAll(() => initializeDateFormatting('tr_TR'));

  testWidgets('varlık ekleme akışı ve portföy toplamı', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final state = AppState(data: FakeMarketData());
    await tester.pumpWidget(ChangeNotifierProvider.value(value: state, child: const KiymetApp()));
    await tester.runAsync(state.init);
    await tester.pumpAndSettle();

    expect(find.text('Tüm kıymetlerin tek yerde'), findsOneWidget);

    await tester.tap(find.text('Varlık ekle'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Çeyrek Altın'));
    await tester.pumpAndSettle();

    await tester.enterText(find.widgetWithText(TextFormField, 'Adet'), '2');
    // Bugünün fiyatı otomatik dolmuş olmalı
    expect(find.text('Güncel fiyat otomatik dolduruldu, değiştirebilirsiniz.'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextFormField, 'Birim alış fiyatı (₺)'), '9.500');
    await tester.pump();
    expect(find.text('Toplam tutar'), findsOneWidget);
    expect(find.text('₺19.000,00'), findsOneWidget);
    await tester.tap(find.text('Kaydet'));
    await tester.runAsync(() => Future.delayed(const Duration(milliseconds: 50)));
    await tester.pumpAndSettle();

    expect(state.holdings, hasLength(1));
    expect(state.summary.totalValue, 21000);
    expect(find.text('Çeyrek Altın'), findsOneWidget);

    // Piyasalar sekmesi
    await tester.tap(find.text('Piyasalar'));
    await tester.pumpAndSettle();
    expect(find.text('Çeyrek Altın'), findsWidgets);
  });
}
