<?php
$host = getenv('MYSQLHOST');
$dbname = getenv('MYSQLDATABASE');
$charset = "utf8mb4";
$port = getenv('MYSQLPORT');
$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";
$db_username = getenv('MYSQLUSER');
$db_password = getenv('MYSQL_PASSWORD');

try {
    $pdo = new PDO($dsn, $db_username, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
?>