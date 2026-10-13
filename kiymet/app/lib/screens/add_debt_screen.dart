import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../logic/portfolio.dart';
import '../models/debt.dart';
import '../state/app_state.dart';
import '../widgets/format.dart';

class AddDebtScreen extends StatefulWidget {
  const AddDebtScreen({super.key});

  @override
  State<AddDebtScreen> createState() => _AddDebtScreenState();
}

class _AddDebtScreenState extends State<AddDebtScreen> {
  final _form = GlobalKey<FormState>();
  final _person = TextEditingController();
  final _amount = TextEditingController();
  final _note = TextEditingController();
  DebtDirection _direction = DebtDirection.lent;
  String _assetId = cashTryId;
  bool _knowsDate = true;
  DateTime _date = DateTime.now();

  @override
  void initState() {
    super.initState();
    _amount.addListener(_refresh);
  }

  void _refresh() => setState(() {});

  @override
  void dispose() {
    _amount.removeListener(_refresh);
    _person.dispose();
    _amount.dispose();
    _note.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2005),
      lastDate: DateTime.now(),
      locale: const Locale('tr', 'TR'),
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    final note = _note.text.trim();
    await context.read<AppState>().addDebt(Debt(
          id: DateTime.now().microsecondsSinceEpoch.toString(),
          person: _person.text.trim(),
          direction: _direction,
          assetId: _assetId,
          amount: parseAmount(_amount.text)!,
          date: _knowsDate ? _date : null,
          note: note.isEmpty ? null : note,
        ));
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final assets = app.debtAssets;
    final asset = app.debtAsset(_assetId);
    final isCash = _assetId == cashTryId;
    final amount = parseAmount(_amount.text);
    final price = app.prices[_assetId]?.price;
    final lent = _direction == DebtDirection.lent;

    return Scaffold(
      appBar: AppBar(title: Text(lent ? 'Alacak ekle' : 'Borç ekle')),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            SegmentedButton<DebtDirection>(
              segments: const [
                ButtonSegment(value: DebtDirection.lent, label: Text('Ben verdim'), icon: Icon(Icons.call_made)),
                ButtonSegment(value: DebtDirection.borrowed, label: Text('Ben aldım'), icon: Icon(Icons.call_received)),
              ],
              selected: {_direction},
              onSelectionChanged: (s) => setState(() => _direction = s.first),
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _person,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(
                labelText: lent ? 'Kime verdin?' : 'Kimden aldın?',
                prefixIcon: const Icon(Icons.person_outline),
                border: const OutlineInputBorder(),
              ),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'İsim girin' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _assetId,
              isExpanded: true,
              decoration: const InputDecoration(labelText: 'Cinsi', border: OutlineInputBorder()),
              items: [
                for (final a in assets)
                  DropdownMenuItem(value: a.id, child: Text(a.id == cashTryId ? 'Türk Lirası (₺)' : '${a.name} (${a.unit})')),
              ],
              onChanged: (v) => setState(() => _assetId = v ?? cashTryId),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _amount,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]'))],
              decoration: InputDecoration(
                labelText: isCash ? 'Tutar (₺)' : 'Miktar (${asset.unit})',
                helperText: !isCash && amount != null && price != null
                    ? 'Bugünkü değeri: ${formatTl(amount * price)}'
                    : null,
                border: const OutlineInputBorder(),
              ),
              validator: (v) {
                final n = parseAmount(v ?? '');
                if (n == null) return 'Geçerli bir sayı girin';
                if (n <= 0) return 'Sıfırdan büyük olmalı';
                return null;
              },
            ),
            const SizedBox(height: 8),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Tarihini hatırlıyorum'),
              subtitle: Text(isCash
                  ? 'Tarih girersen enflasyon karşısındaki değer kaybı hesaplanır.'
                  : 'Tarih girersen o günkü değeriyle karşılaştırılır.'),
              value: _knowsDate,
              onChanged: (v) => setState(() => _knowsDate = v),
            ),
            if (_knowsDate)
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.event),
                title: Text(lent ? 'Verdiğin tarih' : 'Aldığın tarih'),
                subtitle: Text(DateFormat('d MMMM y', 'tr_TR').format(_date)),
                trailing: const Icon(Icons.chevron_right),
                onTap: _pickDate,
              ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _note,
              decoration: const InputDecoration(
                labelText: 'Not (isteğe bağlı)',
                hintText: 'ör. Araba peşinatı için',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _save,
              icon: const Icon(Icons.check),
              label: const Text('Kaydet'),
              style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
            ),
          ],
        ),
      ),
    );
  }
}
