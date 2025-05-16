<?php
require_once 'cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';

header('Content-Type: application/json');

$id = $_GET['id'] ?? null;

// Log the received survey ID
error_log("Survey ID received: " . ($id ?? "None"));

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

    // Fetch the survey details along with the creator's email
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
            // Decode the options field from JSON
            if (!empty($question['options'])) {
                $question['options'] = json_decode($question['options'], true);
            } else {
                $question['options'] = []; // Default to an empty array if no options are provided
            }

            // Decode rows and columns for grid-based questions
            if (in_array($question['question_type'], ['multi-grid', 'checkbox-grid'])) {
                $question['rows'] = json_decode($question['rows'] ?? '[]', true);
                $question['columns'] = json_decode($question['columns'] ?? '[]', true);
                $question['answers'] = json_decode($question['answers'] ?? '{}', true);
            } else {
                $question['rows'] = [];
                $question['columns'] = [];
                $question['answers'] = null;
            }

            // Handle linear-scaling questions
            if ($question['question_type'] === 'linear-scaling') {
                $question['minValue'] = isset($question['min_value']) ? $question['min_value'] : 1;
                $question['maxValue'] = isset($question['max_value']) ? $question['max_value'] : 5;
            }

            if ($question['question_type'] === 'rating') {
                $question['ratingScale'] = isset($question['rating_scale']) ? $question['rating_scale'] : null;
                $question['ratingShape'] = isset($question['rating_shape']) ? $question['rating_shape'] : null;
            }

            // Rename `question_text` to `title`
            $question['title'] = $question['question_text'];
            unset($question['question_text']); // Remove the original field if not needed

            // Add default values for missing fields
            $question['required'] = $question['required'] ?? false;
        }

        // Add the questions to the survey response
        $survey['questions'] = $questions;

        // Log the survey response for debugging
        error_log("Survey Response: " . json_encode($survey));

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
    error_log("Database error: " . $e->getMessage()); // Log database errors
}