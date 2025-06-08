<?php
$dsn = "mysql:host=metro.proxy.rlwy.net;port=43641;dbname=railway;charset=utf8mb4";
$username = "root";
$password = "sVtDdRiIbKntJSbsZvcBOuacSgjlysjt";

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully!";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}