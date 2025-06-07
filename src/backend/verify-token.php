<?php
require_once 'cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';

header("Content-Type: application/json");

try {
    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["token"])) {
    echo json_encode(["success" => false, "message" => "Token is required."]);
    exit();
}

$token = $data["token"];
$tokenHash = hash('sha256', $token); // Hash the token for comparison

try {
    // Check if the token exists and is not expired
    $stmt = $pdo->prepare("
        SELECT pr.*, u.email 
        FROM password_resets pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.token = :token AND pr.expires_at > NOW() AND pr.used = 0
    ");
    $stmt->execute(["token" => $tokenHash]); // Compare with the hashed token
    $reset = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reset) {
        echo json_encode(["success" => false, "message" => "Invalid or expired token."]);
        exit();
    }

    // Token is valid
    echo json_encode([
        "success" => true,
        "message" => "Token is valid.",
        "email" => $reset["email"] // Optionally return the email associated with the token
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
