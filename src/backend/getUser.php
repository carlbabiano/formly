<?php
require_once 'cors.php';
require_once 'db.php';

header('Content-Type: application/json');

// Check if the request is for a survey or user
if (isset($_GET['id'])) {
    // Fetch survey details based on the provided ID
    $id = $_GET['id'];

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Survey ID is required.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("SELECT id, title, description, question, creatorId FROM surveys WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $survey = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($survey) {
            echo json_encode([
                'success' => true,
                'survey' => $survey,
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Survey not found.']);
        }
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    try {
        $stmt = $pdo->prepare("SELECT id, username, email FROM users LIMIT 1"); // Fetch the first user as an example
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'], // Include the user ID
                    'username' => $user['username'],
                    'email' => $user['email'],
                ],
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found.']);
        }
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>