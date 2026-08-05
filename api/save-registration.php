<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Or specify your domain
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Try to load .env file from root directory if it exists
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

// Get the env variables from Hostinger environment or .env file
$supabaseUrl = getenv('NEXT_PUBLIC_SUPABASE_URL') ?: '';
$supabaseServiceKey = getenv('SUPABASE_SERVICE_ROLE_KEY') ?: '';

if (!$supabaseUrl || !$supabaseServiceKey) {
    http_response_code(500);
    echo json_encode(["ok" => false, "message" => "Supabase configuration missing."]);
    exit;
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$email = trim($input['email'] ?? '');
$fullName = trim($input['fullName'] ?? '');
$whatsappNumber = trim($input['whatsappNumber'] ?? '');
$courseSlug = trim($input['courseSlug'] ?? 'algo-trading');
$source = trim($input['source'] ?? '');

if (empty($email) || empty($fullName) || empty($whatsappNumber)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "message" => "Missing required fields."]);
    exit;
}

// 1. Create or Get User in Supabase Auth via Admin API
$authPayload = json_encode([
    'email' => $email,
    'password' => bin2hex(random_bytes(16)), // Random password they don't need
    'user_metadata' => ['full_name' => $fullName],
    'email_confirm' => true
]);

$ch = curl_init("$supabaseUrl/auth/v1/admin/users");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $authPayload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: $supabaseServiceKey",
    "Authorization: Bearer $supabaseServiceKey",
    "Content-Type: application/json"
]);
$authResult = curl_exec($ch);
$authHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$authData = json_decode($authResult, true);
$userId = null;

$errMsg = $authData['msg'] ?? $authData['message'] ?? '';
$errCode = $authData['error_code'] ?? '';

if ($authHttpCode >= 200 && $authHttpCode < 300 && isset($authData['id'])) {
    $userId = $authData['id'];
} else if ($errCode === 'email_exists' || (strpos(strtolower($errMsg), 'already registered') !== false || strpos(strtolower($errMsg), 'already been registered') !== false || strpos(strtolower($errMsg), 'already exists') !== false)) {
    // User exists, we need to fetch their ID
    $ch2 = curl_init("$supabaseUrl/auth/v1/admin/users?per_page=1000");
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        "apikey: $supabaseServiceKey",
        "Authorization: Bearer $supabaseServiceKey",
        "Content-Type: application/json"
    ]);
    $usersListResult = curl_exec($ch2);
    curl_close($ch2);
    $usersList = json_decode($usersListResult, true);
    
    // Find the user by email
    if (is_array($usersList) && isset($usersList['users'])) {
        foreach ($usersList['users'] as $u) {
            if (strtolower($u['email']) === strtolower($email)) {
                $userId = $u['id'];
                break;
            }
        }
    }
}

if (!$userId) {
    http_response_code(500);
    $finalErrMsg = $authData['msg'] ?? $authData['message'] ?? json_encode($authData);
    echo json_encode(["ok" => false, "message" => "Could not register user. " . $finalErrMsg]);
    exit;
}

// 2. Insert into course_registrations via REST API
$regPayload = json_encode([
    'user_id' => $userId,
    'full_name' => $fullName,
    'email' => $email,
    'whatsapp_number' => $whatsappNumber,
    'course_slug' => $courseSlug,
    'source' => $source,
    'login_provider' => 'email_password'
]);

$ch3 = curl_init("$supabaseUrl/rest/v1/course_registrations?on_conflict=user_id,course_slug");
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_POST, true);
curl_setopt($ch3, CURLOPT_POSTFIELDS, $regPayload);
curl_setopt($ch3, CURLOPT_HTTPHEADER, [
    "apikey: $supabaseServiceKey",
    "Authorization: Bearer $supabaseServiceKey",
    "Content-Type: application/json",
    "Prefer: resolution=merge-duplicates" // Upsert
]);
$regResult = curl_exec($ch3);
$regHttpCode = curl_getinfo($ch3, CURLINFO_HTTP_CODE);
curl_close($ch3);

if ($regHttpCode >= 200 && $regHttpCode < 300) {
    echo json_encode(["ok" => true, "message" => "Registration successful!"]);
} else {
    http_response_code(500);
    echo json_encode(["ok" => false, "message" => "Could not save registration. Details: " . $regResult]);
}
