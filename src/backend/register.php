<?php
error_log("Registration request received");
require_once 'cors.php';
require_once 'db.php';
require_once __DIR__ . '/../../vendor/autoload.php';
use Firebase\JWT\JWT;

header("Content-Type: application/json");

$secretKey = "your_secret_key"; // Use environment variable in production

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"]) || !isset($data["password"]) || !isset($data["firstName"])) {
    echo json_encode(["success" => false, "message" => "Required fields are missing."]);
    exit();
}

$email = $data["email"];
$password = password_hash($data["password"], PASSWORD_BCRYPT);
$firstName = $data["firstName"];
$lastName = isset($data["lastName"]) ? $data["lastName"] : null;

try {
    // Check if email exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->execute(["email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(["success" => false, "message" => "This email is already registered."]);
        exit();
    }

    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, provider) VALUES (:email, :password, :firstName, :lastName, 'manual')");
    $stmt->execute([
        "email" => $email,
        "password" => $password,
        "firstName" => $firstName,
        "lastName" => $lastName,
    ]);

    // Get the inserted user ID
    $userId = $pdo->lastInsertId();

    // Generate JWT token
    $baseUrl = getenv('VITE_BACKEND_URL') ?: 'http://localhost';
    $payload = [
        "iss" => $baseUrl,
        "aud" => $baseUrl,
        "iat" => time(),
        "exp" => time() + (60 * 60),
        "user_id" => $userId,
        "email" => $email,
        "firstName" => $firstName,
        "lastName" => $lastName,
    ];
    $jwt = JWT::encode($payload, $secretKey, 'HS256');

    echo json_encode([
        "success" => true,
        "message" => "User registered successfully.",
        "token" => $jwt,
        "user" => [
            "id" => $userId,
            "email" => $email,
            "firstName" => $firstName,
            "lastName" => $lastName,
        ]
    ]);
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Registration failed. Please try again."]);
}
?>