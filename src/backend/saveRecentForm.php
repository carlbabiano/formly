<?php
require_once 'cors.php';
header("Content-Type: application/json");

// Database connection
$host = "localhost";
$dbname = "surveysystem";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Get the JSON input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!isset($data["userId"]) || !isset($data["formId"]) || !isset($data["title"])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input. 'userId', 'formId' and 'title' are required."]);
    exit();
}

$userId = $data["userId"];
$formId = $data["formId"];
$title = $data["title"];
$lastOpened = date("Y-m-d H:i:s");

try {
    // Check if the form already exists for the user
    $stmt = $pdo->prepare("SELECT * FROM recent_forms WHERE user_id = :userId AND form_id = :formId");
    $stmt->execute([
        "userId" => $userId,
        "formId" => $formId,
    ]);
    $existingForm = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingForm) {
        $updateStmt = $pdo->prepare("UPDATE recent_forms SET last_opened = :lastOpened WHERE user_id = :userId AND form_id = :formId");
        $updateStmt->execute([
            "lastOpened" => $lastOpened,
            "userId" => $userId,
            "formId" => $formId,
        ]);
    } else {
        // Insert a new row if the form does not exist
        $insertStmt = $pdo->prepare("INSERT INTO recent_forms (user_id, form_id, title, last_opened) VALUES (:userId, :formId, :title, :lastOpened )");
        $insertStmt->execute([
            "userId" => $userId,
            "formId" => $formId,
            "title" => $title,
            "lastOpened" => $lastOpened,
        ]);
    }

    echo json_encode(["success" => true, "message" => "Recent form updated or inserted successfully."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update or insert recent form: " . $e->getMessage()]);
}
?>