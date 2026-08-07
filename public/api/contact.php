<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://vyntegra.in');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Load .env file from public_html root
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            putenv(trim($name) . '=' . trim($value));
        }
    }
}

$supabaseUrl      = getenv('NEXT_PUBLIC_SUPABASE_URL') ?: '';
$supabaseKey      = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: '';
$smtpHost         = getenv('SMTP_HOST') ?: 'smtp.hostinger.com';
$smtpPort         = (int)(getenv('SMTP_PORT') ?: 465);
$smtpUser         = getenv('SMTP_USER') ?: '';
$smtpPass         = getenv('SMTP_PASS') ?: '';
$adminEmail       = getenv('ADMIN_MAIL_TO') ?: 'support@vyntegra.in';
$supportEmail     = getenv('CONTACT_MAIL') ?: 'support@vyntegra.in';
$adminBccRaw      = getenv('ADMIN_BCC_EMAILS') ?: 'mahajanshardul1@gmail.com,sumedh.bhalerao07@gmail.com';
$adminBccEmails   = array_filter(array_map('trim', explode(',', $adminBccRaw)));

// ─── Parse input ────────────────────────────────────────────────────────────
$inputJSON = file_get_contents('php://input');
$input     = json_decode($inputJSON, true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Invalid request.']);
    exit;
}

function sanitize($value) {
    if (!is_string($value)) return '';
    return trim(preg_replace('/[\x00-\x1F\x7F]/', ' ', strip_tags($value)));
}

// Honeypot
if (!empty($input['website'])) {
    echo json_encode(['ok' => false, 'message' => 'Something went wrong. Please try again.']);
    exit;
}

$fullName        = sanitize($input['fullName'] ?? '');
$emailAddress    = sanitize($input['emailAddress'] ?? '');
$phoneOrWhatsapp = sanitize($input['phoneOrWhatsapp'] ?? '');
$subject         = sanitize($input['subject'] ?? '');
$message         = sanitize($input['message'] ?? '');
$enquiryType     = sanitize($input['enquiryType'] ?? '');

// ─── Validate ────────────────────────────────────────────────────────────────
$errors = [];
if (empty($fullName))                      $errors['fullName'] = 'Enter your full name.';
if (!filter_var($emailAddress, FILTER_VALIDATE_EMAIL)) $errors['emailAddress'] = 'Enter a valid email address.';
if (strlen($message) < 10)                $errors['message']  = 'Write your enquiry message.';
if (strlen($message) > 3000)              $errors['message']  = 'Keep your message within 3000 characters.';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Please check the form fields.', 'errors' => $errors]);
    exit;
}

$timestamp           = gmdate('Y-m-d\TH:i:s\Z');
$submissionId        = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));

// IST display
$istOffset      = 5.5 * 3600;
$istTs          = strtotime($timestamp) + $istOffset;
$istDisplay     = date('j F Y, h:i:s A', $istTs) . ' IST';

// ─── Save to Supabase form_submissions ───────────────────────────────────────
if ($supabaseUrl && $supabaseKey) {
    $payload = json_encode([
        'id'                    => $submissionId,
        'submission_type'       => 'contact',
        'submitted_at'          => $timestamp,
        'submitted_at_ist_display' => $istDisplay,
        'full_name'             => $fullName,
        'email_address'         => $emailAddress,
        'phone_or_whatsapp'     => $phoneOrWhatsapp,
        'subject'               => $subject,
        'message'               => $message,
        'email_status'          => 'pending',
        'raw_payload'           => [
            'fullName'        => $fullName,
            'emailAddress'    => $emailAddress,
            'phoneOrWhatsapp' => $phoneOrWhatsapp,
            'subject'         => $subject,
            'message'         => $message,
            'enquiryType'     => $enquiryType,
        ],
    ]);

    $ch = curl_init("$supabaseUrl/rest/v1/form_submissions");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            "apikey: $supabaseKey",
            "Authorization: Bearer $supabaseKey",
            "Content-Type: application/json",
            "Prefer: return=minimal",
        ],
    ]);
    $dbResult   = curl_exec($ch);
    $dbHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($dbHttpCode < 200 || $dbHttpCode >= 300) {
        error_log("contact.php DB insert failed ($dbHttpCode): $dbResult");
    }
}

// ─── HTML email builder ───────────────────────────────────────────────────────
function htmlEsc($v) { return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function htmlNl($v)  { return nl2br(htmlEsc($v)); }

function buildEmailHtml($title, $intro, $details = [], $blocks = []) {
    $detailRows = '';
    foreach ($details as $d) {
        $detailRows .= '<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #E7E1D5;color:#5F6470;font-size:13px;font-weight:700;width:38%;">' . htmlEsc($d['label']) . '</td>
          <td style="padding:10px 12px;border-bottom:1px solid #E7E1D5;color:#171A1F;font-size:14px;">' . htmlNl($d['value']) . '</td>
        </tr>';
    }
    $detailTable = $detailRows
        ? '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #E7E1D5;border-radius:8px;overflow:hidden;background:#FFFCF7;">' . $detailRows . '</table>'
        : '';

    $blockHtml = '';
    foreach ($blocks as $b) {
        $blockHtml .= '<section style="margin-top:18px;">';
        if (!empty($b['heading'])) $blockHtml .= '<h2 style="margin:0 0 8px;color:#171A1F;font-size:16px;line-height:1.35;">' . htmlEsc($b['heading']) . '</h2>';
        $blockHtml .= '<p style="margin:0;color:#343942;font-size:14px;line-height:1.65;">' . htmlNl($b['body']) . '</p></section>';
    }

    return '<!doctype html><html><body style="margin:0;padding:0;background:#F4F1EA;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">' . htmlEsc($intro) . '</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#F4F1EA;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#FFFFFF;border:1px solid #E4DDCF;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#171A1F;padding:22px 24px;">
            <p style="margin:0 0 6px;color:#D8CBA6;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Vyntegra</p>
            <h1 style="margin:0;color:#FFFFFF;font-size:22px;line-height:1.3;">' . htmlEsc($title) . '</h1>
          </td></tr>
          <tr><td style="padding:24px;">
            <p style="margin:0 0 18px;color:#343942;font-size:15px;line-height:1.65;">' . htmlEsc($intro) . '</p>
            ' . $detailTable . $blockHtml . '
            <p style="margin:24px 0 0;color:#343942;font-size:14px;line-height:1.6;">Regards,<br><strong>Vyntegra</strong></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>';
}

// ─── SMTP send via PHPMailer-style stream ────────────────────────────────────
function smtpSend($host, $port, $user, $pass, $from, $fromName, $to, $subject, $textBody, $htmlBody, $replyTo = '', $bcc = []) {
    $boundary  = '----=_Part_' . md5(uniqid('', true));
    $toHeader  = is_array($to) ? implode(', ', $to) : $to;
    $bccHeader = !empty($bcc) ? implode(', ', $bcc) : '';

    $headers  = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$from>\r\n";
    $headers .= "To: $toHeader\r\n";
    if ($bccHeader) $headers .= "Bcc: $bccHeader\r\n";
    if ($replyTo)   $headers .= "Reply-To: $replyTo\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
    $headers .= "X-Mailer: VyntegraMailer/1.0\r\n";

    $body  = "--$boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= chunk_split(base64_encode($textBody)) . "\r\n";
    $body .= "--$boundary\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= chunk_split(base64_encode($htmlBody)) . "\r\n";
    $body .= "--$boundary--\r\n";

    // Use PHP mail() as relay for simplicity on Hostinger Premium
    // Hostinger PHP has SMTP configured via php.ini
    // We use stream socket for direct SMTP
    $errno  = 0;
    $errstr = '';
    $ssl    = ($port === 465) ? 'ssl://' : '';
    $sock   = @fsockopen($ssl . $host, $port, $errno, $errstr, 15);
    if (!$sock) {
        // Fallback: try php mail()
        $allTo = is_array($to) ? implode(', ', $to) : $to;
        $simpleHeaders  = "From: $fromName <$from>\r\n";
        $simpleHeaders .= "Reply-To: $replyTo\r\n";
        $simpleHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
        $simpleHeaders .= "MIME-Version: 1.0\r\n";
        if ($bccHeader) $simpleHeaders .= "Bcc: $bccHeader\r\n";
        $sent = mail($allTo, $subject, $htmlBody, $simpleHeaders);
        return $sent ? '' : "mail() failed";
    }

    $read = fgets($sock, 512);
    if (substr($read, 0, 3) !== '220') { fclose($sock); return "SMTP greeting failed: $read"; }

    function smtpCmd($sock, $cmd, $expect) {
        fwrite($sock, $cmd . "\r\n");
        $resp = fgets($sock, 512);
        if (substr($resp, 0, 3) !== (string)$expect) return $resp;
        return '';
    }

    $err = smtpCmd($sock, "EHLO " . gethostname(), 250);
    if ($err) { fclose($sock); return "EHLO: $err"; }

    // Read multi-line EHLO response
    while (true) {
        $line = fgets($sock, 512);
        if (!$line || $line[3] === ' ') break;
    }

    // AUTH LOGIN
    fwrite($sock, "AUTH LOGIN\r\n");
    $resp = fgets($sock, 512);
    fwrite($sock, base64_encode($user) . "\r\n");
    $resp = fgets($sock, 512);
    fwrite($sock, base64_encode($pass) . "\r\n");
    $resp = fgets($sock, 512);
    if (substr($resp, 0, 3) !== '235') { fclose($sock); return "AUTH failed: $resp"; }

    // MAIL FROM
    fwrite($sock, "MAIL FROM: <$from>\r\n");
    $resp = fgets($sock, 512);
    if (substr($resp, 0, 3) !== '250') { fclose($sock); return "MAIL FROM: $resp"; }

    // RCPT TO (all recipients)
    $allRecipients = is_array($to) ? $to : [$to];
    if (!empty($bcc)) $allRecipients = array_merge($allRecipients, $bcc);
    foreach ($allRecipients as $rcpt) {
        $rcpt = trim($rcpt);
        if (!$rcpt) continue;
        fwrite($sock, "RCPT TO: <$rcpt>\r\n");
        $resp = fgets($sock, 512);
        if (substr($resp, 0, 3) !== '250') { fclose($sock); return "RCPT TO <$rcpt>: $resp"; }
    }

    // DATA
    fwrite($sock, "DATA\r\n");
    $resp = fgets($sock, 512);
    if (substr($resp, 0, 3) !== '354') { fclose($sock); return "DATA: $resp"; }

    fwrite($sock, $headers . "\r\n" . $body . "\r\n.\r\n");
    $resp = fgets($sock, 512);
    if (substr($resp, 0, 3) !== '250') { fclose($sock); return "DATA body: $resp"; }

    fwrite($sock, "QUIT\r\n");
    fclose($sock);
    return '';
}

// ─── Send emails ─────────────────────────────────────────────────────────────
if (!$smtpUser || !$smtpPass) {
    // DB was saved, but email not configured — still return ok
    echo json_encode(['ok' => true, 'message' => 'Your enquiry has been submitted. Vyntegra will get back to you soon.']);
    exit;
}

$fromName = 'Vyntegra';

$adminDetails = [
    ['label' => 'Full Name', 'value' => $fullName],
    ['label' => 'Email',     'value' => $emailAddress],
];
if ($phoneOrWhatsapp) $adminDetails[] = ['label' => 'Phone / WhatsApp', 'value' => $phoneOrWhatsapp];
if ($subject)         $adminDetails[] = ['label' => 'Subject',          'value' => $subject];
$adminDetails[] = ['label' => 'Submitted At', 'value' => $istDisplay];

// Admin email
$adminText  = implode("\n\n", array_merge(
    ["A new enquiry has been submitted.", "Full Name: $fullName", "Email: $emailAddress"],
    $phoneOrWhatsapp ? ["Phone / WhatsApp: $phoneOrWhatsapp"] : [],
    $subject ? ["Subject: $subject"] : [],
    ["Message:", $message, "Submitted At: $istDisplay"]
));
$adminHtml  = buildEmailHtml(
    'New Vyntegra enquiry submitted',
    'A new enquiry has been submitted.',
    $adminDetails,
    [['heading' => 'Message', 'body' => $message]]
);

$smtpErr1 = smtpSend($smtpHost, $smtpPort, $smtpUser, $smtpPass,
    $smtpUser, $fromName, $adminEmail,
    'New Vyntegra enquiry submitted',
    $adminText, $adminHtml, $supportEmail, $adminBccEmails);

if ($smtpErr1) error_log("contact.php admin email error: $smtpErr1");

// Customer confirmation email
$custText = implode("\n\n", array_merge(
    ["Hi $fullName,", "We have received your enquiry."],
    $subject ? ["Subject: $subject"] : [],
    ["Your submitted message:", $message, "Our team will review your message and get back to you within 24 hours.", "Regards,", "Vyntegra"]
));
$custDetails = [];
if ($subject) $custDetails[] = ['label' => 'Subject', 'value' => $subject];
$custDetails[] = ['label' => 'Submitted At', 'value' => $istDisplay];

$custHtml = buildEmailHtml(
    'Vyntegra enquiry received',
    "Hi $fullName, we have received your enquiry.",
    $custDetails,
    [
        ['heading' => 'Your submitted message', 'body' => $message],
        ['body' => 'Our team will review your message and get back to you within 24 hours.'],
    ]
);

$smtpErr2 = smtpSend($smtpHost, $smtpPort, $smtpUser, $smtpPass,
    $smtpUser, $fromName, $emailAddress,
    'Vyntegra enquiry received',
    $custText, $custHtml, $supportEmail);

if ($smtpErr2) error_log("contact.php customer email error: $smtpErr2");

// Update email_status in Supabase
if ($supabaseUrl && $supabaseKey) {
    $emailStatus  = (!$smtpErr1 && !$smtpErr2) ? 'sent' : 'failed';
    $emailError   = trim("$smtpErr1 $smtpErr2");
    $updatePayload = json_encode(['email_status' => $emailStatus] + ($emailError ? ['email_error' => $emailError] : []));

    $ch = curl_init("$supabaseUrl/rest/v1/form_submissions?id=eq." . urlencode($submissionId));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER   => true,
        CURLOPT_CUSTOMREQUEST    => 'PATCH',
        CURLOPT_POSTFIELDS       => $updatePayload,
        CURLOPT_HTTPHEADER       => [
            "apikey: $supabaseKey",
            "Authorization: Bearer $supabaseKey",
            "Content-Type: application/json",
            "Prefer: return=minimal",
        ],
    ]);
    curl_exec($ch);
    curl_close($ch);
}

echo json_encode(['ok' => true, 'message' => 'Your enquiry has been submitted. Vyntegra will get back to you soon.']);
