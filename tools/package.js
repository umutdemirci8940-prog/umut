#!/usr/bin/env node
'use strict';
/**
 * Teslim paketi üretir: release/ilacsizyasam-banner-seti.zip
 *  - index.html          : sunum sayfası (zip kökünden açıldığında çalışır)
 *  - dist/<boyut>/       : bannerlar (her biri kendi index.html'i ile bağımsız çalışır)
 *  - dist/zip/           : reklam ağlarına yüklenecek tekil zipler
 *  - preview/screens/    : ekran görüntüleri
 *  - README.md
 * Kullanım: node tools/package.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const stage = path.join(root, 'release', 'stage');
const out = path.join(root, 'release', 'ilacsizyasam-banner-seti.zip');
fs.rmSync(path.join(root, 'release'), { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

const copy = (src, dst) => fs.cpSync(path.join(root, src), path.join(stage, dst), { recursive: true });
copy('dist', 'dist');
copy('preview/screens', 'preview/screens');
copy('README.md', 'README.md');

// Sunum sayfası: ../dist → dist
let html = fs.readFileSync(path.join(root, 'preview', 'index.html'), 'utf8').replace(/\.\.\/dist\//g, 'dist/');
fs.writeFileSync(path.join(stage, 'index.html'), html);

execSync(`cd "${stage}" && zip -q -r -X "${out}" . -x ".*"`);
fs.rmSync(stage, { recursive: true, force: true });
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`✔ ${path.relative(root, out)}  (${kb} KB)`);
