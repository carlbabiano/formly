<?php
require_once 'cors.php'; // Ensure this points to your CORS configuration file
header("Content-Type: application/json");

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the user ID from the request (e.g., from a query parameter or token)
    $userId = isset($_GET['userId']) ? intval($_GET['userId']) : null;

    if (!$userId) {
        echo json_encode(["success" => false, "message" => "User ID is required."]);
        exit;
    }

    // Fetch surveys created by the user - ADDED accepting_responses field
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            title,
            created_at AS createdAt,
            last_modified AS lastModified,
            response_count AS responseCount,
            accepting_responses
        FROM surveys 
        WHERE creator_id = :userId
        ORDER BY created_at DESC
    ");
    $stmt->execute([':userId' => $userId]);
    $surveys = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Debugging: Log the surveys fetched
    error_log("Surveys fetched for userId $userId: " . json_encode($surveys));

    // Return the surveys as JSON
    echo json_encode(["success" => true, "surveys" => $surveys]);
} catch (Exception $e) {
    // Handle errors
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
