<?php
require_once 'cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header('Content-Type: application/json');

try {
    // Log the raw input payload for debugging
    error_log("Raw Input Payload: " . file_get_contents('php://input'));

    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    // Log the decoded input payload for debugging
    error_log("Decoded Input Payload: " . json_encode($input));

    $token = $input['token'] ?? '';
    if (empty($token)) {
        throw new Exception("Token is required.");
    }

    $secretKey = 'your_secret_key';
    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    $creatorId = $decoded->userId ?? null;

    if (!$creatorId) {
        throw new Exception("Invalid token: Missing creator ID.");
    }

    if (empty($input['title']) || !isset($input['questions']) || !is_array($input['questions'])) {
        throw new Exception("Invalid input: Missing or invalid title or questions.");
    }

    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Insert the survey
    $stmt = $pdo->prepare("INSERT INTO surveys (title, description, creator_id) VALUES (:title, :description, :creatorId)");
    $stmt->execute([
        ':title' => $input['title'],
        ':description' => $input['description'] ?? '',
        ':creatorId' => $creatorId,
    ]);
    $surveyId = $pdo->lastInsertId();

    // Insert the questions
    $questionStmt = $pdo->prepare("
        INSERT INTO questions (survey_id, question_type, question_text, options, `rows`, `columns`, `answers`, required, min_value, max_value, min_label, max_label, rating_scale, rating_shape) 
        VALUES (:surveyId, :questionType, :questionText, :options, :rows, :columns, :answers, :required, :minValue, :maxValue, :minLabel, :maxLabel, :ratingScale, :ratingShape)
    ");

    foreach ($input['questions'] as $question) {
        // Validate rows and columns for grid-based questions
        if (in_array($question['type'], ['multi-grid', 'checkbox-grid'])) {
            $question['rows'] = $question['rows'] ?? [];
            $question['columns'] = $question['columns'] ?? [];
            if (empty($question['rows']) || empty($question['columns'])) {
                throw new Exception("Rows and columns are required for grid-based questions.");
            }
        }

        // Validate multiple-choice, checkbox, dropdown, and ranking questions
        if (in_array($question['type'], ['multiple-choice', 'checkbox', 'dropdown', 'ranking'])) {
            if (empty($question['options']) || !is_array($question['options'])) {
                throw new Exception("Options are required for {$question['type']} questions.");
            }

            // Assign default names to empty options
            foreach ($question['options'] as $index => $option) {
                if (empty($option)) {
                    $question['options'][$index] = "Option " . ($index + 1);
                }
            }
        }

        // Validate linear scaling questions
        if ($question['type'] === 'linear-scaling') {
            $question['minValue'] = $question['minValue'] ?? 1;
            $question['maxValue'] = $question['maxValue'] ?? 10;
            $question['minLabel'] = $question['minLabel'] ?? 'Min';
            $question['maxLabel'] = $question['maxLabel'] ?? 'Max';
        }

        // Validate rating scale questions
        if ($question['type'] === 'rating') {
            $question['ratingScale'] = $question['ratingScale'] ?? 5;
            $question['ratingShape'] = $question['ratingShape'] ?? 'star';
        }

        // Assign default names to empty rows and columns for grid-based questions
        if (in_array($question['type'], ['multi-grid', 'checkbox-grid'])) {
            foreach ($question['rows'] as $index => $row) {
                if (empty($row)) {
                    $question['rows'][$index] = "Row " . ($index + 1);
                }
            }
            foreach ($question['columns'] as $index => $column) {
                if (empty($column)) {
                    $question['columns'][$index] = "Column " . ($index + 1);
                }
            }
        }

        // Log the processed question for debugging
        error_log("Processed question: " . json_encode($question));

        try {
            $questionStmt->execute([
                ':surveyId' => $surveyId,
                ':questionType' => $question['type'],
                ':questionText' => $question['title'],
                ':options' => json_encode($question['options'] ?? []), // Encode options as JSON
                ':rows' => json_encode($question['rows'] ?? []),
                ':columns' => json_encode($question['columns'] ?? []),
                ':answers' => json_encode($question['answers'] ?? []),
                ':required' => $question['required'] ?? false,
                ':minValue' => $question['minValue'] ?? null,
                ':maxValue' => $question['maxValue'] ?? null,
                ':minLabel' => $question['minLabel'] ?? null,
                ':maxLabel' => $question['maxLabel'] ?? null,
                ':ratingScale' => $question['ratingScale'] ?? null,
                ':ratingShape' => $question['ratingShape'] ?? null,
            ]);
        } catch (PDOException $e) {
            error_log("Error executing SQL for question: " . $e->getMessage());
            throw new Exception("Failed to insert question: " . $e->getMessage());
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Survey published successfully.',
        'surveyId' => $surveyId,
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
    error_log("Error: " . $e->getMessage());
}