<?php
require_once 'cors.php'; // Ensure this points to your CORS configuration file
require_once 'db.php'; // Include the centralized database connection
header("Content-Type: application/json");

// Get the user ID from the request (e.g., from a query parameter or token)
$userId = isset($_GET['userId']) ? intval($_GET['userId']) : null;

if (!$userId) {
    echo json_encode(["success" => false, "message" => "User ID is required."]);
    exit;
}

try {
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