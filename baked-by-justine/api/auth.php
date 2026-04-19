<?php
// ============================================================
// api/auth.php
// Handles: register, login, logout, session check
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/db.php';

session_start();

$action = $_GET['action'] ?? '';
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

// ── CREATE TABLE IF NOT EXISTS ──────────────────────────────
function ensureUsersTable($db) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id           INT AUTO_INCREMENT PRIMARY KEY,
            first_name   VARCHAR(80)  NOT NULL,
            last_name    VARCHAR(80)  NOT NULL,
            email        VARCHAR(255) NOT NULL UNIQUE,
            password     VARCHAR(255) NOT NULL,
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

try {
    $db = getDB();
    ensureUsersTable($db);

    switch ($action) {

        // ── REGISTER ─────────────────────────────────────────
        case 'register':
            $firstName = trim($input['first_name'] ?? '');
            $lastName  = trim($input['last_name']  ?? '');
            $email     = strtolower(trim($input['email']    ?? ''));
            $password  = $input['password'] ?? '';

            if (!$firstName || !$lastName || !$email || !$password) {
                respond(['success' => false, 'error' => 'All fields are required.'], 400);
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                respond(['success' => false, 'error' => 'Please enter a valid email address.'], 400);
            }
            if (strlen($password) < 8) {
                respond(['success' => false, 'error' => 'Password must be at least 8 characters.'], 400);
            }

            // Check duplicate
            $check = $db->prepare('SELECT id FROM users WHERE email = :email');
            $check->execute([':email' => $email]);
            if ($check->fetch()) {
                respond(['success' => false, 'error' => 'An account with that email already exists.'], 409);
            }

            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $db->prepare('INSERT INTO users (first_name, last_name, email, password) VALUES (:fn, :ln, :email, :pw)');
            $stmt->execute([':fn' => $firstName, ':ln' => $lastName, ':email' => $email, ':pw' => $hash]);

            $userId = $db->lastInsertId();
            $_SESSION['user_id']    = $userId;
            $_SESSION['user_name']  = $firstName;
            $_SESSION['user_email'] = $email;

            respond([
                'success' => true,
                'message' => 'Account created successfully!',
                'user'    => ['id' => $userId, 'first_name' => $firstName, 'last_name' => $lastName, 'email' => $email]
            ]);

        // ── LOGIN ─────────────────────────────────────────────
        case 'login':
            $email    = strtolower(trim($input['email']    ?? ''));
            $password = $input['password'] ?? '';

            if (!$email || !$password) {
                respond(['success' => false, 'error' => 'Email and password are required.'], 400);
            }

            $stmt = $db->prepare('SELECT * FROM users WHERE email = :email');
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user['password'])) {
                respond(['success' => false, 'error' => 'Incorrect email or password.'], 401);
            }

            $_SESSION['user_id']    = $user['id'];
            $_SESSION['user_name']  = $user['first_name'];
            $_SESSION['user_email'] = $user['email'];

            respond([
                'success' => true,
                'message' => 'Welcome back, ' . $user['first_name'] . '!',
                'user'    => ['id' => $user['id'], 'first_name' => $user['first_name'], 'last_name' => $user['last_name'], 'email' => $user['email']]
            ]);

        // ── LOGOUT ────────────────────────────────────────────
        case 'logout':
            session_destroy();
            respond(['success' => true, 'message' => 'Logged out successfully.']);

        // ── SESSION CHECK ─────────────────────────────────────
        case 'session':
            if (!empty($_SESSION['user_id'])) {
                respond([
                    'success'   => true,
                    'logged_in' => true,
                    'user'      => [
                        'id'         => $_SESSION['user_id'],
                        'first_name' => $_SESSION['user_name'],
                        'email'      => $_SESSION['user_email']
                    ]
                ]);
            } else {
                respond(['success' => true, 'logged_in' => false]);
            }

        default:
            respond(['success' => false, 'error' => 'Unknown action.'], 400);
    }

} catch (Exception $e) {
    respond(['success' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}
?>
