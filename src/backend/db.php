<?php
$host = "mysql.railway.internal"; // Hostname from Railway
$dbname = "railway"; // Database name from Railway
$charset = "utf8mb4";
$port = 3306; // Port number from Railway
$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";
$db_username = "root"; // Username from Railway
$db_password = "sVtDdRiIbKntJSbsZvcBOuacSgjlysjt"; // Replace with the actual password from Railway

try {
    $pdo = new PDO($dsn, $db_username, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
?>