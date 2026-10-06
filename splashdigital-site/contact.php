<?php
/**
 * Splash Digital – iletişim formu
 * Hosting'in PHP mail() fonksiyonunu kullanır (cPanel / Plesk hostinglerde varsayılan olarak açıktır).
 * Alıcı adreslerini aşağıdan değiştirebilirsiniz.
 *
 * ÖNEMLİ (Google Workspace kullanıldığı için): Hosting sunucusundan giden formların Gmail'de spam'e
 * düşmemesi için alan adının SPF (TXT) kaydına hosting sunucusunu ekleyin. Örnek:
 *   v=spf1 include:_spf.google.com include:<hosting-firmasinin-spf-adresi> ~all
 * Hosting firmanız SPF adresini/IP'sini destek ekibinden söyleyebilir.
 */
declare(strict_types=1);

$TO       = 'sales@splashdigital.com.tr';
$CC       = 'umut@splashdigital.com.tr';
$FROM     = 'no-reply@splashdigital.com.tr'; // Kendi alan adınızdan bir adres olmalı (spam'e düşmemesi için)
$SUBJECT  = 'Web sitesi iletişim formu';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(bool $ok, string $message = '', int $code = 200): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Geçersiz istek.', 405);
}

// Spam koruması: gizli alan doluysa bot kabul edilir
if (!empty($_POST['website'])) {
    respond(true);
}

// Basit hız sınırı (aynı IP'den 60 sn'de bir)
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$lock = sys_get_temp_dir() . '/splash_form_' . md5($ip);
if (is_file($lock) && (time() - (int) @filemtime($lock)) < 60) {
    respond(false, 'Lütfen bir dakika sonra tekrar deneyin.', 429);
}

function clean(string $key, int $max = 500): string {
    $v = trim((string) ($_POST[$key] ?? ''));
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr($v, 0, $max);
}

$name    = clean('name', 100);
$company = clean('company', 100);
$email   = clean('email', 150);
$phone   = clean('phone', 30);
$message = clean('message', 3000);
$kvkk    = !empty($_POST['kvkk']);
$services = array_map(static fn($s) => mb_substr(str_replace(["\r", "\n"], '', (string) $s), 0, 60),
    array_slice((array) ($_POST['services'] ?? []), 0, 10));

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Lütfen ad, geçerli bir e-posta ve mesaj girin.', 422);
}
if (!$kvkk) {
    respond(false, 'Lütfen KVKK onay kutusunu işaretleyin.', 422);
}

$body  = "Web sitesinden yeni mesaj\n";
$body .= str_repeat('-', 40) . "\n";
$body .= "Ad Soyad : {$name}\n";
$body .= "Firma    : " . ($company ?: '-') . "\n";
$body .= "E-posta  : {$email}\n";
$body .= "Telefon  : " . ($phone ?: '-') . "\n";
$body .= "Hizmetler: " . ($services ? implode(', ', $services) : '-') . "\n";
$body .= str_repeat('-', 40) . "\n\n";
$body .= $message . "\n\n";
$body .= "--\nIP: {$ip}\nTarih: " . date('d.m.Y H:i') . "\n";

$safeName = preg_replace('/[^\p{L}\p{N} .\-]/u', '', $name);
$headers  = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: Splash Digital Web <' . $FROM . '>',
    'Reply-To: ' . '=?UTF-8?B?' . base64_encode($safeName) . '?= <' . $email . '>',
    'X-Mailer: PHP/' . PHP_VERSION,
];
if ($CC) {
    $headers[] = 'Cc: ' . $CC;
}

$subject = '=?UTF-8?B?' . base64_encode($SUBJECT . ' – ' . $safeName) . '?=';
$sent = @mail($TO, $subject, $body, implode("\r\n", $headers), '-f' . $FROM);

if ($sent) {
    @touch($lock);
    respond(true, 'Mesajınız gönderildi.');
}
respond(false, 'Mesaj şu anda gönderilemedi. Lütfen sales@splashdigital.com.tr adresine yazın veya +90 535 605 53 92 numarasını arayın.', 500);
