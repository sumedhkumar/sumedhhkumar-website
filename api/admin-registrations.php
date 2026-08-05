<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://vyntegra.in');
header('Access-Control-Allow-Methods: GET, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load .env file if present
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

$supabaseUrl = getenv('NEXT_PUBLIC_SUPABASE_URL') ?: '';
$supabaseServiceKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: '';
$adminToken = getenv('ADMIN_EXPORT_TOKEN') ?: '';

// Auth check
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$bearerToken = '';
if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
    $bearerToken = trim($matches[1]);
}

if (!$adminToken || $bearerToken !== $adminToken) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'message' => 'Unauthorized.']);
    exit;
}

if (!$supabaseUrl || !$supabaseServiceKey) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Supabase configuration missing.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// ---- GET: List registrations ----
if ($method === 'GET') {
    $limit  = min(200, max(1, intval($_GET['limit']  ?? 50)));
    $offset = max(0, intval($_GET['offset'] ?? 0));
    $search       = trim($_GET['search']       ?? '');
    $accessStatus = trim($_GET['accessStatus'] ?? '');
    $paymentStatus= trim($_GET['paymentStatus']?? '');
    $loginProvider= trim($_GET['loginProvider']?? '');
    $courseSlug   = trim($_GET['courseSlug']   ?? '');

    // Build PostgREST query
    $params = [];
    if ($courseSlug) $params[] = 'course_slug=eq.' . urlencode($courseSlug);
    if ($accessStatus) $params[] = 'access_status=eq.' . urlencode($accessStatus);
    if ($paymentStatus) $params[] = 'payment_status=eq.' . urlencode($paymentStatus);
    if ($loginProvider) $params[] = 'login_provider=eq.' . urlencode($loginProvider);
    if ($search) {
        $s = urlencode('%' . $search . '%');
        $params[] = 'or=(full_name.ilike.' . $s . ',email.ilike.' . $s . ',whatsapp_number.ilike.' . $s . ')';
    }

    $query = implode('&', $params);
    $query .= ($query ? '&' : '') . 'order=registered_at.desc&limit=' . $limit . '&offset=' . $offset;

    $url = "$supabaseUrl/rest/v1/course_registrations?$query";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $supabaseServiceKey",
        "Authorization: Bearer $supabaseServiceKey",
        "Accept: application/json",
        "Prefer: count=exact",
    ]);
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $responseHeaders = curl_getinfo($ch, CURLINFO_HEADER_OUT);
    curl_close($ch);

    // Get count from Content-Range header
    // Re-run with header capture
    $ch2 = curl_init($url);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_HEADER, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        "apikey: $supabaseServiceKey",
        "Authorization: Bearer $supabaseServiceKey",
        "Accept: application/json",
        "Prefer: count=exact",
    ]);
    $fullResponse = curl_exec($ch2);
    $headerSize = curl_getinfo($ch2, CURLINFO_HEADER_SIZE);
    curl_close($ch2);

    $headers = substr($fullResponse, 0, $headerSize);
    $body = substr($fullResponse, $headerSize);

    // Parse Content-Range: 0-49/123
    $total = 0;
    if (preg_match('/Content-Range:\s*\d+-\d+\/(\d+)/i', $headers, $m)) {
        $total = intval($m[1]);
    }

    $rows = json_decode($body, true) ?? [];

    // Remap field names to camelCase
    $registrations = array_map(function($r) {
        return [
            'id'             => $r['id'],
            'fullName'       => $r['full_name'],
            'email'          => $r['email'],
            'whatsappNumber' => $r['whatsapp_number'],
            'courseSlug'     => $r['course_slug'],
            'accessStatus'   => $r['access_status'],
            'paymentStatus'  => $r['payment_status'],
            'loginProvider'  => $r['login_provider'],
            'source'         => $r['source'],
            'utmSource'      => $r['utm_source'],
            'utmMedium'      => $r['utm_medium'],
            'utmCampaign'    => $r['utm_campaign'],
            'lastLoginAt'    => $r['last_login_at'],
            'registeredAt'   => $r['registered_at'],
            'createdAt'      => $r['created_at'],
            'updatedAt'      => $r['updated_at'],
        ];
    }, $rows);

    echo json_encode([
        'ok'            => true,
        'registrations' => $registrations,
        'total'         => $total,
        'limit'         => $limit,
        'offset'        => $offset,
    ]);
    exit;
}

// ---- PATCH: Update a registration ----
if ($method === 'PATCH') {
    // Extract ID from query string: ?id=xxx
    $id = trim($_GET['id'] ?? '');
    if (!$id) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'Missing registration ID.']);
        exit;
    }

    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'Invalid JSON body.']);
        exit;
    }

    // Only allow specific fields
    $allowed = ['access_status', 'payment_status'];
    $patch = [];
    if (isset($input['accessStatus']))  $patch['access_status']  = $input['accessStatus'];
    if (isset($input['paymentStatus'])) $patch['payment_status'] = $input['paymentStatus'];

    if (empty($patch)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'No valid fields to update.']);
        exit;
    }

    $url = "$supabaseUrl/rest/v1/course_registrations?id=eq." . urlencode($id);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($patch));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $supabaseServiceKey",
        "Authorization: Bearer $supabaseServiceKey",
        "Content-Type: application/json",
        "Prefer: return=representation",
    ]);
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $rows = json_decode($result, true);
    if ($httpCode >= 200 && $httpCode < 300 && is_array($rows) && count($rows) > 0) {
        $r = $rows[0];
        echo json_encode([
            'ok' => true,
            'registration' => [
                'id'             => $r['id'],
                'fullName'       => $r['full_name'],
                'email'          => $r['email'],
                'whatsappNumber' => $r['whatsapp_number'],
                'courseSlug'     => $r['course_slug'],
                'accessStatus'   => $r['access_status'],
                'paymentStatus'  => $r['payment_status'],
                'loginProvider'  => $r['login_provider'],
                'source'         => $r['source'],
                'utmSource'      => $r['utm_source'],
                'utmMedium'      => $r['utm_medium'],
                'utmCampaign'    => $r['utm_campaign'],
                'lastLoginAt'    => $r['last_login_at'],
                'registeredAt'   => $r['registered_at'],
                'createdAt'      => $r['created_at'],
                'updatedAt'      => $r['updated_at'],
            ],
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'message' => 'Could not update registration. ' . $result]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'message' => 'Method not allowed.']);
