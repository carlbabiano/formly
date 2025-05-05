<?php
header("Content-Type: application/json");

try {
    $input = json_decode(file_get_contents("php://input"), true);

    if (empty($input['userId']) || empty($input['title']) || !isset($input['questions'])) {
        throw new Exception("Missing required fields: userId, title, or questions.");
    }

    $pdo = new PDO("mysql:host=localhost;dbname=surveysystem", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (isset($input['id'])) {
        // Update existing draft
        $stmt = $pdo->prepare("UPDATE surveys SET title = :title, description = :description, questions = :questions, updated_at = NOW() WHERE id = :id AND user_id = :userId");
        $stmt->execute([
            ':id' => $input['id'],
            ':userId' => $input['userId'],
            ':title' => $input['title'],
            ':description' => $input['description'],
            ':questions' => json_encode($input['questions']),
            
        ]);
    } else {
        // Insert new draft
        $stmt = $pdo->prepare("INSERT INTO surveys (user_id, title, description, questions, is_draft) VALUES (:userId, :title, :description, :questions,  1)");
        $stmt->execute([
            ':userId' => $input['userId'],
            ':title' => $input['title'],
            ':description' => $input['description'],
            ':questions' => json_encode($input['questions']),
            
        ]);
    }

    echo json_encode(['success' => true, 'message' => 'Draft saved successfully.']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}