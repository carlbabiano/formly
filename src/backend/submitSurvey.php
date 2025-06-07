<?php
require_once 'cors.php'; // Include CORS handling
// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include 'db.php';

try {
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON data'
        ]);
        exit;
    }
    
    $surveyId = isset($input['surveyId']) ? intval($input['surveyId']) : null;
    $answers = isset($input['answers']) ? $input['answers'] : null;
    $userId = isset($input['userId']) ? intval($input['userId']) : null;
    $respondentEmail = isset($input['respondentEmail']) ? $input['respondentEmail'] : null;
    $completionTime = isset($input['completionTime']) ? intval($input['completionTime']) : null;
    
    if (!$surveyId || !$answers) {
        echo json_encode([
            'success' => false,
            'message' => 'Email and answers are required'
        ]);
        exit;
    }
    
    // Verify survey exists
    $surveyStmt = $pdo->prepare("SELECT id FROM surveys WHERE id = ?");
    $surveyStmt->execute([$surveyId]);
    if (!$surveyStmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Survey not found'
        ]);
        exit;
    }
    
    // Get client IP and user agent
    $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    // Insert response
    $stmt = $pdo->prepare("
        INSERT INTO survey_responses 
        (survey_id, user_id, respondent_email, answers, ip_address, user_agent, completion_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $surveyId,
        $userId,
        $respondentEmail,
        json_encode($answers),
        $ipAddress,
        $userAgent,
        $completionTime
    ]);
    
    $responseId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Response submitted successfully',
        'responseId' => $responseId
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
