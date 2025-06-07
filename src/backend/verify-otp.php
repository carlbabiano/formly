<?php
require_once 'cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';

header("Content-Type: application/json");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_log("OTP Verification Started");

try {
    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"]) || !isset($data["otp"])) {
    echo json_encode(["success" => false, "message" => "Email and OTP are required."]);
    exit();
}

$email = $data["email"];
$otp = $data["otp"];

// Log the received data for debugging
error_log("Verifying OTP: Email = $email, OTP = $otp");

try {
    // Get the user ID from the email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute(["email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        error_log("User not found for email: $email");
        echo json_encode(["success" => false, "message" => "Invalid email or OTP."]);
        exit();
    }

    error_log("User found with ID: " . $user["id"]);

    // Get the most recent unused OTP for this user
    $stmt = $pdo->prepare("
        SELECT * FROM password_resets 
        WHERE user_id = :user_id AND used = 0
        ORDER BY created_at DESC LIMIT 1
    ");
    $stmt->execute(["user_id" => $user["id"]]);
    $reset = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reset) {
        error_log("No unused reset record found for user ID: " . $user["id"]);
        echo json_encode(["success" => false, "message" => "Invalid or expired OTP."]);
        exit();
    }

    error_log("Reset record found with ID: " . $reset["id"]);
    
    // Check if the OTP has expired
    $currentTime = new DateTime();
    $expiryTime = new DateTime($reset["expires_at"]);
    
    if ($currentTime > $expiryTime) {
        error_log("OTP expired. Current time: " . $currentTime->format('Y-m-d H:i:s') . ", Expiry time: " . $expiryTime->format('Y-m-d H:i:s'));
        echo json_encode(["success" => false, "message" => "OTP has expired. Please request a new one."]);
        exit();
    }

    // IMPORTANT: For simplicity, we'll directly compare the OTP with the stored value
    // This is a temporary fix - in production, you should use proper hashing
    if ($otp !== $reset["token"]) {
        error_log("OTP mismatch. Provided: $otp, Stored: " . $reset["token"]);
        echo json_encode(["success" => false, "message" => "Invalid OTP."]);
        exit();
    }

    // OTP is valid, create a temporary reset token for the next step
    $tempToken = bin2hex(random_bytes(16));
    
    // Update the reset record with the temp token and mark as verified
    $stmt = $pdo->prepare("UPDATE password_resets SET temp_token = :temp_token, verified = 1 WHERE id = :id");
    $stmt->execute([
        "temp_token" => $tempToken,
        "id" => $reset["id"]
    ]);

    error_log("OTP verified successfully. Temp token created: $tempToken");

    // Return success with the temp token
    echo json_encode([
        "success" => true,
        "message" => "OTP verified successfully.",
        "temp_token" => $tempToken
    ]);
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
