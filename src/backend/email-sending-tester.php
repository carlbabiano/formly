<?php
/**
 * Organizational Email Test Script
 * 
 * This script specifically tests sending emails to organizational Google accounts.
 */

require_once 'cors.php';
require_once 'email-config.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start HTML output
echo '<!DOCTYPE html>
<html>
<head>
    <title>Organizational Email Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        form { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        label { display: block; margin: 10px 0 5px; }
        input[type="email"], input[type="text"] { width: 100%; padding: 8px; box-sizing: border-box; }
        button { margin-top: 15px; padding: 8px 15px; background: #4169e1; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .config { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Organizational Email Test</h1>
    <p>This tool specifically tests sending emails to organizational Google accounts (like @gordoncollege.edu.ph).</p>';

// Display current configuration
echo '<div class="config">
    <h2>Current SMTP Configuration</h2>
    <p><strong>SMTP Host:</strong> ' . SMTP_HOST . '</p>
    <p><strong>SMTP Port:</strong> ' . SMTP_PORT . '</p>
    <p><strong>SMTP Security:</strong> ' . SMTP_SECURE . '</p>
    <p><strong>SMTP Username:</strong> ' . SMTP_USERNAME . '</p>
    <p><strong>From Email:</strong> ' . EMAIL_FROM . '</p>
    <p><strong>From Name:</strong> ' . EMAIL_FROM_NAME . '</p>
</div>';

// Test email form
echo '<form method="post">
    <h2>Send Test Email to Organizational Account</h2>
    <label for="to_email">Recipient Email (organizational account):</label>
    <input type="email" id="to_email" name="to_email" required placeholder="example@gordoncollege.edu.ph">
    
    <label for="to_name">Recipient Name:</label>
    <input type="text" id="to_name" name="to_name" placeholder="Enter recipient name (optional)">
    
    <label for="subject">Subject:</label>
    <input type="text" id="subject" name="subject" required placeholder="Enter email subject" value="Test Email from Formly">
    
    <button type="submit" name="send_test">Send Test Email</button>
</form>';

// Process form submission
if (isset($_POST['send_test'])) {
    $toEmail = $_POST['to_email'];
    $toName = $_POST['to_name'] ?: 'User';
    $subject = $_POST['subject'];
    
    echo '<h2>Test Results</h2>';
    
    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);
    
    try {
        // Enable verbose debug output
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        
        // Capture debug output
        ob_start();
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = SMTP_AUTH;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port = SMTP_PORT;
        
        // Recipients
        $mail->setFrom(EMAIL_FROM, EMAIL_FROM_NAME);
        $mail->addAddress($toEmail, $toName);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #4169e1;'>Test Email to Organizational Account</h2>
                <p>Hello {$toName},</p>
                <p>This is a test email sent from the Formly application to an organizational Google account.</p>
                <p>If you received this email, it means your SMTP configuration can successfully send to organizational accounts.</p>
                <p>Time sent: " . date('Y-m-d H:i:s') . "</p>
                <p>Thank you,<br>Formly Team</p>
            </div>
        ";
        $mail->AltBody = "Hello {$toName},\n\nThis is a test email sent from the Formly application to an organizational Google account.\n\nIf you received this email, it means your SMTP configuration can successfully send to organizational accounts.\n\nTime sent: " . date('Y-m-d H:i:s') . "\n\nThank you,\nFormly Team";
        
        // Send the email
        $mail->send();
        
        // Get debug output
        $debugOutput = ob_get_clean();
        
        echo '<p class="success">Email has been sent successfully to ' . htmlspecialchars($toEmail) . '!</p>';
        echo '<p>Please check the recipient\'s inbox (and spam folder) to confirm delivery.</p>';
        
        // Display debug information
        echo '<h3>SMTP Debug Output:</h3>';
        echo '<pre>' . htmlspecialchars($debugOutput) . '</pre>';
        
    } catch (Exception $e) {
        // Get debug output
        $debugOutput = ob_get_clean();
        
        echo '<p class="error">Email could not be sent. Error: ' . htmlspecialchars($mail->ErrorInfo) . '</p>';
        
        // Display debug information
        echo '<h3>SMTP Debug Output:</h3>';
        echo '<pre>' . htmlspecialchars($debugOutput) . '</pre>';
    }
}

