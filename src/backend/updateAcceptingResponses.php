<?php
require_once 'cors.php';
header("Content-Type: application/json");

try {
    // Get the JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['surveyId']) || !isset($input['acceptingResponses'])) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }
    
    $surveyId = intval($input['surveyId']);
    $acceptingResponses = $input['acceptingResponses'] ? 1 : 0;
    
    // Connect to the database
    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Update the accepting_responses status for the specific survey
    $stmt = $pdo->prepare("UPDATE surveys SET accepting_responses = :accepting_responses WHERE id = :survey_id");
    $stmt->execute([
        ':accepting_responses' => $acceptingResponses,
        ':survey_id' => $surveyId
    ]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Accepting responses status updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Survey not found or no changes made"]);
    }
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>