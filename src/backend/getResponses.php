<?php
// Turn off error display - very important for JSON APIs
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once 'cors.php'; // Ensure this points to your CORS configuration file
// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Function to log errors instead of displaying them
function logError($message) {
    error_log($message);
}

try {
    // Include config file
    if (!file_exists('db.php')) {
        throw new Exception('db file not found');
    }
    include 'db.php';
    
    // Get survey ID from query parameter
    $surveyId = isset($_GET['surveyId']) ? intval($_GET['surveyId']) : null;
    
    if (!$surveyId) {
        echo json_encode([
            'success' => false,
            'message' => 'Survey ID is required'
        ]);
        exit;
    }

    // First, verify the survey exists
    $surveyCheckStmt = $pdo->prepare("SELECT id, title FROM surveys WHERE id = ?");
    $surveyCheckStmt->execute([$surveyId]);
    $survey = $surveyCheckStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$survey) {
        echo json_encode([
            'success' => false,
            'message' => 'Survey not found'
        ]);
        exit;
    }

    // Check if survey_responses table exists
    $tableCheckStmt = $pdo->query("SHOW TABLES LIKE 'survey_responses'");
    $tableExists = $tableCheckStmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo json_encode([
            'success' => false,
            'message' => 'Responses table does not exist yet',
            'responses' => [],
            'statistics' => [
                'total_responses' => 0,
                'first_response' => null,
                'last_response' => null,
                'avg_completion_time' => null
            ],
            'survey' => [
                'id' => $survey['id'],
                'title' => $survey['title']
            ]
        ]);
        exit;
    }

    // Get all responses for the survey
    $stmt = $pdo->prepare("
        SELECT 
            r.id,
            r.survey_id,
            r.user_id,
            r.respondent_email,
            r.answers,
            r.submitted_at,
            r.ip_address,
            r.user_agent,
            r.completion_time,
            u.email as user_email,
            u.first_name,
            u.last_name
        FROM survey_responses r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.survey_id = ?
        ORDER BY r.submitted_at DESC
    ");
    
    $stmt->execute([$surveyId]);
    $responses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process the responses to ensure answers are properly decoded
    $processedResponses = [];
    foreach ($responses as $response) {
        $processedResponse = $response;
        
        // Decode JSON answers if they're stored as string
        if (is_string($response['answers'])) {
            $processedResponse['answers'] = json_decode($response['answers'], true);
        }
        
        // Add respondent info
        $processedResponse['respondent_name'] = null;
        if ($response['user_id'] && isset($response['first_name'])) {
            $processedResponse['respondent_name'] = trim(($response['first_name'] ?? '') . ' ' . ($response['last_name'] ?? ''));
        }
        
        $processedResponse['respondent_identifier'] = $processedResponse['respondent_name'] 
            ? $processedResponse['respondent_name'] 
            : ($response['respondent_email'] ? $response['respondent_email'] : 'Anonymous');
            
        $processedResponses[] = $processedResponse;
    }
    
    // Get response statistics
    $statsStmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_responses,
            MIN(submitted_at) as first_response,
            MAX(submitted_at) as last_response,
            AVG(completion_time) as avg_completion_time
        FROM survey_responses 
        WHERE survey_id = ?
    ");
    $statsStmt->execute([$surveyId]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'responses' => $processedResponses,
        'statistics' => [
            'total_responses' => intval($stats['total_responses']),
            'first_response' => $stats['first_response'],
            'last_response' => $stats['last_response'],
            'avg_completion_time' => $stats['avg_completion_time'] ? round(floatval($stats['avg_completion_time'])) : null
        ],
        'survey' => [
            'id' => $survey['id'],
            'title' => $survey['title']
        ]
    ]);

} catch (PDOException $e) {
    logError('Database error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    logError('Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
