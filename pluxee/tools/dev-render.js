#!/usr/bin/env node
'use strict';
/**
 * Tek bir konsepti geliştirme amaçlı derler.
 * Kullanım: node pluxee/tools/dev-render.js src/concepts/<konsept>.js <çıktı.html> [--standin] [--no-photos]
 */
const fs = require('fs');
const path = require('path');
const data = require('../src/data');
const { loadAssets } = require('../src/assets');
const [file, out] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!file || !out) { console.error('kullanım: dev-render.js <konsept.js> <çıktı.html> [--standin] [--no-photos]'); process.exit(1); }
const concept = require(path.resolve(file));
const assets = loadAssets({ standin: process.argv.includes('--standin'), quiet: true });
if (process.argv.includes('--no-photos')) assets.photos = {};
const html = concept.render(data, assets);
fs.writeFileSync(out, html);
console.log(`${concept.id}: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB → ${out} (fotoğraf: ${Object.keys(assets.photos).join(', ') || 'yok'})`);
