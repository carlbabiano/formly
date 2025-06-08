<?php
require_once __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

error_log("Registration request received");
error_log(print_r($_POST, true));

$host = getenv('DB_HOST');
$dbname = getenv('DB_DATABASE');
$charset = 'utf8mb4';
$port = getenv('DB_PORT');
$db_username = getenv('DB_USERNAME');
$db_password = getenv('DB_PASSWORD');

$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";

try {
    $pdo = new PDO($dsn, $db_username, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    error_log("Database connection successful.");
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}