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

if (!isset($data["email"]) || !isset($data["firstName"])) {
    echo json_encode(["success" => false, "message" => "Required fields are missing."]);
    exit();
}

$email = $data["email"];
$firstName = $data["firstName"];
$lastName = isset($data["lastName"]) ? $data["lastName"] : null; // Optional

try {
    // Check if the email already exists in the database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->execute(["email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($user['provider'] === 'manual') {
            // If the email is already registered manually, return an error
            echo json_encode(["success" => false, "message" => "Email already registered manually."]);
            exit();
        } elseif ($user['provider'] === 'google') {
            // If the email is already registered via Google, allow the user to continue
            $payload = [
                "iss" => "http://localhost", // Issuer
                "aud" => "http://localhost", // Audience
                "iat" => time(), // Issued at
                "exp" => time() + (60 * 60), // Expiration time (1 hour)
                "user_id" => $user["id"],
                "email" => $user["email"],
                "firstName" => $user["first_name"], // Include first name
                "lastName" => $user["last_name"],   // Include last name
            ];
            $jwt = JWT::encode($payload, $secretKey, 'HS256');

            echo json_encode([
                "success" => true,
                "message" => "Welcome back!",
                "token" => $jwt, // Include the token in the response
                "user" => [
                    "id" => $user["id"], // Include user ID
                    "email" => $user["email"], // Include email
                    "firstName" => $user["first_name"], // Include first name
                    "lastName" => $user["last_name"], // Include last name
                ]
            ]);
            exit();
        }
    }

    // Insert the new user into the database
    $stmt = $pdo->prepare("INSERT INTO users (email, first_name, last_name, provider, is_google_linked) VALUES (:email, :firstName, :lastName, 'google', TRUE)");
    $stmt->execute([
        "email" => $email,
        "firstName" => $firstName,
        "lastName" => $lastName,
    ]);

    // Generate a JWT token for the new user
    $userId = $pdo->lastInsertId(); // Get the ID of the newly inserted user
    $payload = [
        "iss" => "http://localhost", // Issuer
        "aud" => "http://localhost", // Audience
        "iat" => time(), // Issued at
        "exp" => time() + (60 * 60), // Expiration time (1 hour)
        "user_id" => $userId,
        "email" => $email,
        "firstName" => $firstName, // Include first name
        "lastName" => $lastName,   // Include last name
    ];
    $jwt = JWT::encode($payload, $secretKey, 'HS256');

    echo json_encode([
        "success" => true,
        "message" => "User registered successfully.",
        "token" => $jwt, // Include the token in the response
        "user" => [
            "id" => $userId, // Include user ID
            "email" => $email, // Include email
            "firstName" => $firstName, // Include first name
            "lastName" => $lastName, // Include last name
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}