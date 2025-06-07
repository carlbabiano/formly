<?php
require_once 'cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';

header('Content-Type: application/json');

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode([
        'success' => false,
        'message' => 'Survey ID is required.',
    ]);
    exit();
}

try {
    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Fetch the survey details along with the creator's email - ADDED accepting_responses
    $stmt = $pdo->prepare("
        SELECT s.*, u.email AS creator_email
        FROM surveys s
        JOIN users u ON s.creator_id = u.id
        WHERE s.id = :id
    ");
    $stmt->execute([':id' => $id]);
    $survey = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($survey) {
        // Fetch questions associated with the survey
        $questionStmt = $pdo->prepare("SELECT * FROM questions WHERE survey_id = :surveyId");
        $questionStmt->execute([':surveyId' => $id]);
        $questions = $questionStmt->fetchAll(PDO::FETCH_ASSOC);

        // Process each question
        foreach ($questions as &$question) {
            // Decode JSON fields
            $question['options'] = json_decode($question['options'] ?? '[]', true);
            $question['rows'] = json_decode($question['rows'] ?? '[]', true);
            $question['columns'] = json_decode($question['columns'] ?? '[]', true);
            $question['answers'] = json_decode($question['answers'] ?? '{}', true);
            
            // Ensure all fields are present
            $question['question_type'] = $question['question_type'] ?? '';
            $question['question_text'] = $question['question_text'] ?? '';
            $question['required'] = $question['required'] ?? false;
            $question['min_value'] = $question['min_value'] ?? null;
            $question['max_value'] = $question['max_value'] ?? null;
            $question['min_label'] = $question['min_label'] ?? null;
            $question['max_label'] = $question['max_label'] ?? null;
            $question['rating_scale'] = $question['rating_scale'] ?? null;
            $question['rating_shape'] = $question['rating_shape'] ?? null;
            
            // Log the processed question for debugging
            error_log("Processed question from DB: " . json_encode($question));
        }

        // Add the questions to the survey response
        $survey['questions'] = $questions;

        echo json_encode([
            'success' => true,
            'survey' => $survey,
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Survey not found.',
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
    ]);
}
