import 'package:flutter/material.dart';

void showAboutKiymet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    showDragHandle: true,
    builder: (context) => const Padding(
      padding: EdgeInsets.fromLTRB(24, 0, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Image(
                image: AssetImage('assets/icon/mark.png'),
                width: 48,
                height: 48,
              ),
              SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Kıymet',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  Text('Tüm kıymetlerin tek yerde.'),
                ],
              ),
            ],
          ),
          SizedBox(height: 16),
          Text(
            '• Varlıkların yalnızca bu cihazda saklanır, hiçbir sunucuya gönderilmez.\n'
            '• Fiyatlar bilgilendirme amaçlıdır; gecikmeli veya yaklaşık olabilir.\n'
            '• Altın fiyatları teorik has değeridir, kuyumcu fiyatlarından farklı olabilir.\n'
            '• Kıymet bir yatırım danışmanlığı hizmeti değildir. Burada yer alan bilgiler yatırım tavsiyesi değildir.',
          ),
          SizedBox(height: 16),
          Text(
            'Veri kaynakları: BtcTurk, TCMB, Binance, gold-api.com, Yahoo Finance, OECD, BIS.',
            style: TextStyle(fontSize: 12),
          ),
        ],
      ),
    ),
  );
}
