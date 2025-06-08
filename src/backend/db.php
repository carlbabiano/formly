<?php
error_log("Registration request received");
error_log(print_r($_POST, true));
$host = getenv('MYSQL_HOST'); // metro.proxy.rlay.net
$dbname = getenv('MYSQL_DATABASE'); // railway
$charset = 'utf8mb4';
$port = getenv('MYSQL_PORT'); // 43641

$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";

$db_username = getenv('MYSQL_USER'); // root
$db_password = getenv('MYSQL_PASSWORD'); // your_password_here

try {
    $pdo = new PDO($dsn, $db_username, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}
?>