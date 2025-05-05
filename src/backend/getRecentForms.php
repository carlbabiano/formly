<?php
require_once 'cors.php';
header("Content-Type: application/json");

// Database connection
$host = "localhost";
$dbname = "surveysystem";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Get the userId from the query string
$userId = $_GET['userId'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(["error" => "Missing userId"]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT form_id AS id, title, last_opened FROM recent_forms WHERE user_id = :userId ORDER BY last_opened DESC LIMIT 5");
    $stmt->execute(["userId" => $userId]);
    $recentForms = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($recentForms);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch recent forms: " . $e->getMessage()]);
}
?>