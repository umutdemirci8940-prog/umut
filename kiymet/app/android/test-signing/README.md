# Test imza anahtarı

`kiymet-test.jks` YALNIZCA test APK'ları içindir. Her derlemenin aynı anahtarla imzalanmasını
sağlar; böylece yeni test sürümü eskisinin üzerine kurulabilir.

Parolası herkese açıktır (`kiymet-test`). **Google Play'e yüklenecek sürüm için bu anahtar
kullanılmamalıdır.** Mağaza sürümü için ayrı bir yükleme anahtarı oluşturulup GitHub Secrets'ta
saklanacak ve `KIYMET_KEYSTORE*` ortam değişkenleriyle verilecektir.
