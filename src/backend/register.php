<?php
require_once 'cors.php'; // Include CORS configuration

// Rest of your register.php code...

// Include the database connection file
require_once 'db.php';

// Set the response header to JSON
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the input data from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input data
    $username = isset($input['username']) ? trim($input['username']) : null;
    $email = isset($input['email']) ? trim($input['email']) : null;
    $password = isset($input['password']) ? trim($input['password']) : null;

    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    // Hash the password for security
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    try {
        // Check if the email already exists
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE email = :email');
        $stmt->execute(['email' => $email]);
        $emailExists = $stmt->fetchColumn();

        if ($emailExists) {
            echo json_encode(['success' => false, 'message' => 'Email is already registered.']);
            exit;
        }

        // Insert the new user into the database
        $stmt = $pdo->prepare('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)');
        $stmt->execute([
            'username' => $username,
            'email' => $email,
            'password' => $hashedPassword
        ]);

        echo json_encode(['success' => true, 'message' => 'User registered successfully.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
} else {
    // If the request method is not POST, return an error
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}