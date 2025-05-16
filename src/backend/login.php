<?php
require_once 'cors.php';
require_once 'db.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use Firebase\JWT\JWT;

header('Content-Type: application/json');

$secretKey = 'your_secret_key';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

$response = ['success' => false, 'message' => '', 'token' => '', 'userId' => '', 'username' => ''];

if ($email && $password) {
    try {
        error_log("Email provided: $email");
        error_log("Password provided: $password");

        $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if ($user) {
            error_log("User found: " . json_encode($user));

            if (password_verify($password, $user['password'])) {
                error_log("Password verified for user ID: " . $user['id']);

                $payload = [
                    'iss' => 'http://localhost',
                    'aud' => 'http://localhost',
                    'iat' => time(),
                    'userId' => $user['id'],
                ];
                error_log("JWT Payload: " . json_encode($payload));

                $jwt = JWT::encode($payload, $secretKey, 'HS256');

                $updateStmt = $pdo->prepare("UPDATE users SET token = :token WHERE id = :id");
                if (!$updateStmt->execute(['token' => $jwt, 'id' => $user['id']])) {
                    error_log("Failed to update token in database: " . json_encode($updateStmt->errorInfo()));
                }

                $response['success'] = true;
                $response['token'] = $jwt;
                $response['userId'] = $user['id'];
                $response['username'] = $user['username'];
                $response['email'] = $email;
            } else {
                error_log("Password mismatch for email: $email");
                $response['message'] = 'Invalid email or password.';
            }
        } else {
            error_log("Email not found: $email");
            $response['message'] = 'Invalid email or password.';
        }
    } catch (Exception $e) {
        error_log("Error during login: " . $e->getMessage());
        $response['message'] = 'An error occurred. Please try again later.';
    }
} else {
    error_log("Missing email or password. Email: $email, Password: $password");
    $response['message'] = 'Email and password are required.';
}

error_log("Response: " . json_encode($response));
echo json_encode($response);