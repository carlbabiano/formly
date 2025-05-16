<?php
require_once 'db.php';
require_once 'cors.php'; // Include CORS settings if needed

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method. Please use POST.");
    }

    // Get the JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    $surveyId = $input['surveyId'] ?? null;

    if (!$surveyId) {
        throw new Exception("Survey ID is required.");
    }

    // Validate the survey ID
    $surveyCheckStmt = $pdo->prepare("SELECT COUNT(*) FROM surveys WHERE id = :surveyId");
    $surveyCheckStmt->execute([':surveyId' => $surveyId]);
    if ($surveyCheckStmt->fetchColumn() == 0) {
        throw new Exception("Invalid survey ID.");
    }

    // Increment the response count in the surveys table
    $incrementResponseCountStmt = $pdo->prepare("
        UPDATE surveys
        SET response_count = response_count + 1
        WHERE id = :surveyId
    ");
    $incrementResponseCountStmt->execute([':surveyId' => $surveyId]);

    // Check if the update was successful
    if ($incrementResponseCountStmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Response count updated successfully.']);
    } else {
        throw new Exception("Failed to update response count for survey ID: $surveyId");
    }
} catch (Exception $e) {
    error_log("Error in submitSurvey.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>