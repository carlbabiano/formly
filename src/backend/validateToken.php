<?php
require_once __DIR__ . '/../../vendor/autoload.php'; // Correct path to autoload.php
require_once 'cors.php'; // Include CORS headers

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Decode the input JSON
$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? '';

$response = ['valid' => false, 'message' => 'Token validation failed.']; // Default response

try {
    if (!empty($token)) {
        // Define the secret key
        $secretKey = 'your_secret_key'; // Replace with your actual secret key

        // Decode the token
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));

        // Token is valid
        $response['valid'] = true;
        $response['userId'] = $decoded->userId ?? null;

        if (!$response['userId']) {
            throw new Exception("Token is valid but missing userId.");
        }

        // Set a success message
        $response['message'] = 'Token is valid.';
    } else {
        // No token provided
        $response['message'] = 'Token is required.';
    }
} catch (Exception $e) {
    // Token validation failed
    $response['valid'] = false;
    $response['message'] = 'Token validation failed: ' . $e->getMessage();
}

// Return the response as JSON
echo json_encode($response);