#!/usr/bin/env node
'use strict';
/** assets/kfc/manifest.json içinden banner için aday varlıkları (logo, ürün fotoğrafları, video, font) listeler. */
const fs = require('fs'); const path = require('path');
const m = require(path.join(__dirname, '..', 'assets', 'kfc', 'manifest.json'));
const ok = m.media.filter((r) => r.file);
const kb = (b) => (b / 1024).toFixed(0) + 'KB';
const name = (r) => path.basename(r.file);
const has = (r, re) => re.test(r.url + ' ' + (r.alt || '') + ' ' + (r.cls || '') + ' ' + name(r));
console.log('HOSTS', JSON.stringify(m.hostStatus), 'archive', m.archiveMode, m.homeTs, 'cdx', JSON.stringify(m.cdx && m.cdx.counts));
console.log('\nSAYFALAR'); for (const p of m.pages) console.log(' ', p.status, p.path, '|', (p.title || '').slice(0, 50), '| img', p.imgCount, p.error ? 'ERR ' + p.error.slice(0, 60) : '', p.screenshotTop || '');
const imgs = ok.filter((r) => r.kind === 'image' && r.w >= 40);
console.log('\nLOGO ADAYLARI'); for (const r of imgs.filter((r) => r.inHeader || has(r, /logo|brand/i))) console.log(' ', r.id, name(r), r.w + 'x' + r.h, kb(r.bytes), 'şeffaf', r.transparent, '|', r.url);
console.log('\nŞEFFAF PNG/WEBP (ürün kesitleri?)'); for (const r of imgs.filter((r) => r.transparent > 0.08).sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 60)) console.log(' ', r.id, name(r), r.w + 'x' + r.h, kb(r.bytes), (r.transparent * 100).toFixed(0) + '% şeffaf', '|', (r.alt || '').slice(0, 30), '|', r.url);
console.log('\nBÜYÜK FOTOĞRAFLAR (hero?)'); for (const r of imgs.filter((r) => r.w >= 900).sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 40)) console.log(' ', r.id, name(r), r.w + 'x' + r.h, kb(r.bytes), '|', (r.alt || '').slice(0, 30), '|', r.url);
console.log('\nANAHTAR KELİME EŞLEŞMELERİ'); for (const r of imgs.filter((r) => has(r, /kova|bucket|burger|zinger|wing|kanat|tavuk|chicken|wrap|box|kutu|menu|patates|fries|colonel|sanders|tender|nugget|twister/i)).slice(0, 80)) console.log(' ', r.id, name(r), r.w + 'x' + r.h, kb(r.bytes), 'şeffaf', r.transparent && r.transparent.toFixed(2), '|', (r.alt || '').slice(0, 30));
console.log('\nVİDEOLAR'); for (const v of m.videos) console.log(' ', v.id, v.file, v.w + 'x' + v.h, (v.duration || 0).toFixed(1) + 's', kb(v.bytes), v.codec, JSON.stringify(v.derived), (v.frames || []).join(' '));
console.log('\nVİDEO ADAYLARI (indirilemeyenler dahil)'); for (const r of m.media.filter((r) => r.kind === 'video' || /\.(mp4|webm|m3u8)/i.test(r.url))) console.log(' ', r.id, r.url, r.file ? 'OK ' + kb(r.bytes) : (r.error || r.skipped), r.source || '', r.archiveStatus || '');
console.log('\nFONTLAR'); for (const r of ok.filter((r) => r.kind === 'font')) console.log(' ', r.id, name(r), kb(r.bytes), r.family, r.weight, '|', r.url);
console.log('\nFONT-FACE', m.theme.fontFaces.map((f) => `${f.family} ${f.weight}`).join(', '));
console.log('RENKLER', m.theme.colors.slice(0, 16).map((c) => `${c.hex}(${c.count})`).join(' '));
console.log('\nKONTAK SAYFALARI', m.contactSheets, '\nHATALAR', m.errors.slice(0, 8));
console.log('\nÖZET', ok.length, 'dosya:', ok.filter((r) => r.kind === 'image').length, 'görsel,', ok.filter((r) => r.kind === 'video').length, 'video,', ok.filter((r) => r.kind === 'font').length, 'font;', m.media.filter((r) => r.error).length, 'hata,', ok.filter((r) => r.source === 'archive').length, 'arşivden');
