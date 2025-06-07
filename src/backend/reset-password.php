<?php
require_once 'cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';

header("Content-Type: application/json");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_log("Password Reset Started");

try {
    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["temp_token"]) || !isset($data["password"])) {
    echo json_encode(["success" => false, "message" => "Temporary token and password are required."]);
    exit();
}

$tempToken = $data["temp_token"];
$password = password_hash($data["password"], PASSWORD_BCRYPT); // Hash the new password

error_log("Processing password reset with temp token: $tempToken");

try {
    // Begin transaction
    $pdo->beginTransaction();

    // Check if the temp token exists and is verified
    $stmt = $pdo->prepare("
        SELECT * FROM password_resets 
        WHERE temp_token = :temp_token AND verified = 1 AND used = 0
    ");
    $stmt->execute(["temp_token" => $tempToken]);
    $reset = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reset) {
        error_log("Invalid or expired temp token: $tempToken");
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Invalid or expired session. Please try again."]);
        exit();
    }

    error_log("Valid temp token found for user ID: " . $reset["user_id"]);

    // Update the user's password
    $stmt = $pdo->prepare("UPDATE users SET password = :password WHERE id = :user_id");
    $stmt->execute([
        "password" => $password,
        "user_id" => $reset["user_id"]
    ]);
    error_log("Password updated for user ID: " . $reset["user_id"]);

    // Mark the token as used
    $stmt = $pdo->prepare("UPDATE password_resets SET used = 1 WHERE id = :id");
    $stmt->execute(["id" => $reset["id"]]);
    error_log("Reset record marked as used: " . $reset["id"]);

    // Commit transaction
    $pdo->commit();
    error_log("Password reset transaction committed successfully");

    // Send a success response
    echo json_encode([
        "success" => true,
        "message" => "Password has been reset successfully."
    ]);
} catch (PDOException $e) {
    // Rollback transaction on error
    $pdo->rollBack();
    error_log("Database error in reset-password.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
