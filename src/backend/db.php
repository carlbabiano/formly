<?php
$host = "switchyard.proxy.rlwy.net"; // Host from the connection string
$dbname = "railway"; // Database name from the connection string
$port = 21699; // Port from the connection string
$charset = "utf8mb4";
$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";
$db_username = "root"; // Username from the connection string
$db_password = "IZbGxIwnIhPkAssiYjFhspEneFHbkcNF"; // Password from the connection string

try {
    $pdo = new PDO($dsn, $db_username, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
?>