# Gerçek marka varlıkları

Buraya `logo.svg` (ya da .png/.webp) ve `card.png` (ya da .jpg/.webp) koyun; `node pluxee/build.js` bunları kreatiflere gömer.
Otomatik çekmek için: GitHub Actions → "Pluxee – siteden logo ve kart görselini çek, derle" ya da `node pluxee/tools/fetch-pluxee-assets.js`.
Koyu renkli logo için `manifest.json`: `{"logo": {"file": "logo.svg", "white": true}}`.
