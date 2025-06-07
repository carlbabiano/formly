<?php
require_once 'db.php';
require_once 'cors.php';
require_once __DIR__ . '/../../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header('Content-Type: application/json');

try {
    // Get the Authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? null;

    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        throw new Exception("Authorization token is missing or invalid.");
    }

    $token = $matches[1];

    // Decode the JWT to extract the creatorId
    $secretKey = "your_secret_key"; // Replace with your actual secret key
    $decodedToken = JWT::decode($token, new Key($secretKey, 'HS256'));
    $creatorId = $decodedToken->user_id ?? null; // Extract the user ID (creatorId)

    if (!$creatorId) {
        throw new Exception("Creator ID is missing in the token.");
    }

    // Log the creatorId for debugging
    error_log("Creator ID: " . $creatorId);

    // Decode the input payload
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    // Log the decoded input payload for debugging
    error_log("Decoded Input Payload: " . json_encode($input));

    if (empty($input['title']) || !isset($input['questions']) || !is_array($input['questions'])) {
        throw new Exception("Invalid input: Missing or invalid title or questions.");
    }

    $pdo = new PDO("mysql:host=localhost;dbname=formlydb", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if this is an update (survey ID provided) or new survey
    $surveyId = $input['id'] ?? null;
    $isUpdate = false;

    if ($surveyId) {
        // Check if survey exists and belongs to the current user
        $checkStmt = $pdo->prepare("SELECT id FROM surveys WHERE id = :id AND creator_id = :creatorId");
        $checkStmt->execute([':id' => $surveyId, ':creatorId' => $creatorId]);
        
        if ($checkStmt->fetch()) {
            $isUpdate = true;
            error_log("Updating existing survey ID: " . $surveyId);
        } else {
            error_log("Survey not found or user doesn't have permission. Creating new survey.");
            $surveyId = null;
        }
    }

    if ($isUpdate) {
        // Update existing survey
        $stmt = $pdo->prepare("UPDATE surveys SET title = :title, description = :description, last_modified = NOW() WHERE id = :id AND creator_id = :creatorId");
        $stmt->execute([
            ':title' => $input['title'],
            ':description' => $input['description'] ?? '',
            ':id' => $surveyId,
            ':creatorId' => $creatorId,
        ]);

        // Delete existing questions for this survey
        $deleteQuestionsStmt = $pdo->prepare("DELETE FROM questions WHERE survey_id = :surveyId");
        $deleteQuestionsStmt->execute([':surveyId' => $surveyId]);
        
        error_log("Updated survey and deleted old questions for survey ID: " . $surveyId);
    } else {
        // Insert new survey
        $stmt = $pdo->prepare("INSERT INTO surveys (title, description, creator_id, created_at, last_modified) VALUES (:title, :description, :creatorId, NOW(), NOW())");
        $stmt->execute([
            ':title' => $input['title'],
            ':description' => $input['description'] ?? '',
            ':creatorId' => $creatorId,
        ]);
        $surveyId = $pdo->lastInsertId();
        error_log("Created new survey with ID: " . $surveyId);
    }

    // Insert the questions (same logic for both update and new)
    $questionStmt = $pdo->prepare("
        INSERT INTO questions (survey_id, question_type, question_text, options, `rows`, `columns`, `answers`, required, min_value, max_value, min_label, max_label, rating_scale, rating_shape) 
        VALUES (:surveyId, :questionType, :questionText, :options, :rows, :columns, :answers, :required, :minValue, :maxValue, :minLabel, :maxLabel, :ratingScale, :ratingShape)
    ");

    foreach ($input['questions'] as &$question) {
        if (empty($question['title'])) {
            $question['title'] = "Untitled Question"; // Assign a default title
        }

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

    $message = $isUpdate ? 'Survey updated successfully.' : 'Survey published successfully.';

    echo json_encode([
        'success' => true,
        'message' => $message,
        'isUpdate' => $isUpdate,
        'survey' => [
            'id' => $surveyId,
            'title' => $input['title'],
            'description' => $input['description'] ?? '',
            'questions' => $input['questions'], // Include the questions in the response
        ],
    ]);
} catch (Exception $e) {
    http_response_code(400);

    // Log the error for debugging
    error_log("Error: " . $e->getMessage());

    // Return a JSON error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}
?>
