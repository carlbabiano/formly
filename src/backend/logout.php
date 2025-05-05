<?php
require_once 'cors.php'; // Include the CORS configuration
require_once 'db.php'; // Include your database connection

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? '';

if ($token) {
    $stmt = $pdo->prepare("UPDATE users SET token = NULL WHERE token = :token");
    $stmt->execute(['token' => $token]);
}

echo json_encode(['success' => true]);