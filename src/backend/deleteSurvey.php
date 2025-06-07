<?php
require_once 'cors.php'; // Ensure this points to your CORS configuration file
header("Content-Type: application/json");

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['surveyId'])) {
        echo json_encode(["success" => false, "message" => "Survey ID is required."]);
        exit;
    }

    $surveyId = intval($input['surveyId']);

    // Start a transaction to ensure data integrity
    $pdo->beginTransaction();

    try {
        // First, delete all questions associated with this survey
        $stmt = $pdo->prepare("DELETE FROM questions WHERE survey_id = :surveyId");
        $stmt->execute([':surveyId' => $surveyId]);
        
        $deletedQuestions = $stmt->rowCount();

        // Then, delete the survey itself
        $stmt = $pdo->prepare("DELETE FROM surveys WHERE id = :surveyId");
        $stmt->execute([':surveyId' => $surveyId]);

        // Check if the survey was actually deleted
        if ($stmt->rowCount() === 0) {
            throw new Exception("Survey not found or could not be deleted.");
        }

        // Commit the transaction
        $pdo->commit();

        echo json_encode([
            "success" => true, 
            "message" => "Survey deleted successfully.",
            "deletedQuestions" => $deletedQuestions
        ]);

    } catch (Exception $e) {
        // Rollback the transaction on error
        $pdo->rollback();
        throw $e;
    }

} catch (Exception $e) {
    // Handle errors
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>