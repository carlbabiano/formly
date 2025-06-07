<?php
// Turn off error display
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once 'cors.php'; // Ensure this points to your CORS configuration file

// Function to log errors instead of displaying them
function logError($message) {
    error_log($message);
}

include 'db.php';

try {
    // Check if survey_responses table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'survey_responses'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        // Create the table if it doesn't exist
        $createTableSQL = "
        CREATE TABLE IF NOT EXISTS survey_responses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            survey_id INT NOT NULL,
            user_id INT NULL,
            respondent_email VARCHAR(255) NULL,
            answers JSON NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45) NULL,
            user_agent TEXT NULL,
            completion_time INT NULL COMMENT 'Time taken to complete in seconds',
            INDEX idx_survey_id (survey_id),
            INDEX idx_submitted_at (submitted_at)
        )";
        
        $pdo->exec($createTableSQL);
        
        // Insert sample data
        $sampleData = [
            [
                'survey_id' => 1,
                'respondent_email' => 'user1@example.com',
                'answers' => json_encode(['1' => 0, '2' => 'Great product!', '3' => 4]),
                'submitted_at' => '2024-01-15 10:30:00'
            ],
            [
                'survey_id' => 1,
                'respondent_email' => 'user2@example.com',
                'answers' => json_encode(['1' => 1, '2' => 'Could be better', '3' => 3]),
                'submitted_at' => '2024-01-16 14:20:00'
            ],
            [
                'survey_id' => 1,
                'respondent_email' => 'user3@example.com',
                'answers' => json_encode(['1' => 0, '2' => 'Excellent service', '3' => 5]),
                'submitted_at' => '2024-01-17 09:15:00'
            ]
        ];
        
        $insertStmt = $pdo->prepare("
            INSERT INTO survey_responses 
            (survey_id, respondent_email, answers, submitted_at) 
            VALUES (?, ?, ?, ?)
        ");
        
        foreach ($sampleData as $data) {
            $insertStmt->execute([
                $data['survey_id'],
                $data['respondent_email'],
                $data['answers'],
                $data['submitted_at']
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'survey_responses table created and sample data inserted',
            'tableExists' => true
        ]);
        exit;
    }
    
    // Get count of responses
    $countStmt = $pdo->query("SELECT COUNT(*) as count FROM survey_responses");
    $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get sample response
    $sampleStmt = $pdo->query("SELECT * FROM survey_responses LIMIT 1");
    $sample = $sampleStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'survey_responses table exists and is accessible',
        'tableExists' => true,
        'responseCount' => intval($count),
        'sampleResponse' => $sample
    ]);
    
} catch (PDOException $e) {
    logError('Database error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'tableExists' => false
    ]);
} catch (Exception $e) {
    logError('Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'tableExists' => false
    ]);
}
?>
