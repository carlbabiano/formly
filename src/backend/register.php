<?php
require_once 'cors.php';
require_once 'db.php'; // Include the centralized database connection
require_once __DIR__ . '/../../vendor/autoload.php';
use Firebase\JWT\JWT;

header("Content-Type: application/json");

// Secret key for signing the JWT
$secretKey = "your_secret_key"; // Replace with a secure key



// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"]) || !isset($data["password"]) || !isset($data["firstName"])) {
    echo json_encode(["success" => false, "message" => "Required fields are missing."]);
    exit();
}

$email = $data["email"];
$password = password_hash($data["password"], PASSWORD_BCRYPT); // Hash the password
$firstName = $data["firstName"];
$lastName = isset($data["lastName"]) ? $data["lastName"] : null; // Optional

try {
    // Check if the email already exists in the database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->execute(["email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(["success" => false, "message" => "This email is already registered."]);
        exit();
    }

    // Insert the new user into the database
    $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, provider) VALUES (:email, :password, :firstName, :lastName, 'manual')");
    $stmt->execute([
        "email" => $email,
        "password" => $password,
        "firstName" => $firstName,
        "lastName" => $lastName,
    ]);

    // Generate a JWT token
    $userId = $pdo->lastInsertId(); // Get the ID of the newly inserted user
    $payload = [
        "iss" => "http://localhost",
        "aud" => "http://localhost",
        "iat" => time(),
        "exp" => time() + (60 * 60),
        "user_id" => $userId,
        "email" => $email,
        "firstName" => $firstName,
        "lastName" => $lastName,
    ];
    $jwt = JWT::encode($payload, $secretKey, 'HS256');

    // Send a success response
    echo json_encode([
        "success" => true,
        "message" => "User registered successfully.",
        "token" => $jwt, // Include the JWT token
        "user" => [
            "id" => $userId, // Include the user ID
            "email" => $email, // Include the email
            "firstName" => $firstName, // Include the first name
            "lastName" => $lastName, // Include the last name
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}