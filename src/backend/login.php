<?php
require_once 'cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';
use Firebase\JWT\JWT;

header("Content-Type: application/json");

// Secret key for signing the JWT
$secretKey = "your_secret_key"; // Replace with a secure key

try {
    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"]) || !isset($data["password"])) {
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    exit();
}

$email = $data["email"];
$password = $data["password"];

try {
    // Check if the email exists in the database
    $stmt = $pdo->prepare("SELECT id, email, password, first_name, last_name, provider FROM users WHERE email = :email");
    $stmt->execute(["email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    

    if ($user) {
        if ($user["provider"] === "google") {
            // If the email is registered via Google
            echo json_encode(["success" => false, "message" => "This email is already registered via Google. Please sign in using 'Sign in with Google'."]);
        } elseif (password_verify($password, $user["password"])) {
            // If the password matches, generate a JWT token
            $payload = [
                "iss" => "http://localhost", // Issuer
                "aud" => "http://localhost", // Audience
                "iat" => time(), // Issued at
                "exp" => time() + (60 * 60), // Expiration time (1 hour)
                "user_id" => $user["id"], // Include user ID
                "email" => $user["email"], // Include email
                "firstName" => $user["first_name"], // Include first name
                "lastName" => $user["last_name"], // Include last name
            ];

            $jwt = JWT::encode($payload, $secretKey, 'HS256');

            echo json_encode([
                "success" => true,
                "message" => "Login successful.",
                "token" => $jwt, // Include the token in the response
                "user" => [
                "id" => $user["id"], // Include user ID
                "email" => $user["email"], // Include email
                "firstName" => $user["first_name"], // Include first name
                "lastName" => $user["last_name"], // Include last name
            ]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}