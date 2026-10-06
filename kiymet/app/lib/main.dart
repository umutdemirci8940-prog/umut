import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';

import 'screens/home_shell.dart';
import 'state/app_state.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('tr_TR');
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppState()..init(),
      child: const KiymetApp(),
    ),
  );
}

class KiymetApp extends StatefulWidget {
  const KiymetApp({super.key});

  @override
  State<KiymetApp> createState() => _KiymetAppState();
}

class _KiymetAppState extends State<KiymetApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final app = context.read<AppState>();
    if (state == AppLifecycleState.paused) app.onAppPaused();
    if (state == AppLifecycleState.resumed) app.onAppResumed();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kıymet',
      debugShowCheckedModeBanner: false,
      // Android 12+ "esneme" efekti boş ekranda yazıları uzamış gibi gösteriyordu.
      // Aşağı çekip yenileme bundan etkilenmez.
      scrollBehavior: const MaterialScrollBehavior().copyWith(overscroll: false),
      theme: buildTheme(Brightness.light),
      darkTheme: buildTheme(Brightness.dark),
      locale: const Locale('tr', 'TR'),
      supportedLocales: const [Locale('tr', 'TR')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      home: const HomeShell(),
    );
  }
}
