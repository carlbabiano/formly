<?php
try {
    // Create a new PDO instance for database connection
    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Log the error and terminate the script
    error_log("Database connection error: " . $e->getMessage());
    die("Database connection failed.");
}
?>