<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    // Get the JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['surveyId']) || !isset($input['answers'])) {
        throw new Exception("Invalid input: Survey ID and answers are required.");
    }

    $surveyId = $input['surveyId'];
    $answers = $input['answers'];

    // Validate the survey ID
    $surveyCheckStmt = $pdo->prepare("SELECT COUNT(*) FROM surveys WHERE id = :surveyId");
    $surveyCheckStmt->execute([':surveyId' => $surveyId]);
    if ($surveyCheckStmt->fetchColumn() == 0) {
        throw new Exception("Invalid survey ID.");
    }

    // Insert each answer into the database
    $responseStmt = $pdo->prepare("
        INSERT INTO responses (survey_id, question_id, answer) 
        VALUES (:surveyId, :questionId, :answer)
    ");

    foreach ($answers as $questionId => $answer) {
        $responseStmt->execute([
            ':surveyId' => $surveyId,
            ':questionId' => $questionId,
            ':answer' => is_array($answer) ? json_encode($answer) : $answer, // Encode arrays as JSON
        ]);
    }

    echo json_encode(['success' => true, 'message' => 'Response submitted successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>