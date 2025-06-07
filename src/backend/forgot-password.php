<?php
require_once 'cors.php';
require_once 'email-config.php';
require_once __DIR__ . '/../../vendor/autoload.php';
require_once 'db.php'; // Include your database connection file

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

header("Content-Type: application/json");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_log("Password Reset Request Started");

// Create a log file specifically for this script
$logFile = __DIR__ . '/password_reset_log.txt';
file_put_contents($logFile, "=== Password Reset Debug Log - " . date('Y-m-d H:i:s') . " ===\n", FILE_APPEND);

function logMessage($message) {
    global $logFile;
    file_put_contents($logFile, date('Y-m-d H:i:s') . ": " . $message . "\n", FILE_APPEND);
}

logMessage("Script started");



// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"])) {
    logMessage("Email not provided in request");
    echo json_encode(["success" => false, "message" => "Email is required."]);
    exit();
}

$email = trim(strtolower($data["email"])); // Normalize email to lowercase and trim whitespace
logMessage("Processing password reset for email: $email");

// Check if this is an organizational email
$isOrganizationalEmail = false;
if (strpos($email, '@gordoncollege.edu.ph') !== false || 
    strpos($email, '.edu') !== false || 
    strpos($email, '.org') !== false) {
    $isOrganizationalEmail = true;
    logMessage("Detected organizational email address");
}

try {
    // Check if the email exists in the database and get provider info
    $stmt = $pdo->prepare("SELECT id, first_name, provider, is_google_linked FROM users WHERE LOWER(email) = LOWER(:email)");
    $stmt->execute(["email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Case 1: Email doesn't exist in database
    if (!$user) {
        logMessage("User not found for email: $email");
        echo json_encode([
            "success" => false, 
            "message" => "This email address has not been registered yet. Try to register first.",
            "error_type" => "email_not_found"
        ]);
        exit();
    }

    logMessage("User found with ID: " . $user["id"] . ", Provider: " . $user["provider"] . ", Google linked: " . ($user["is_google_linked"] ? 'true' : 'false'));

    // Case 2: Account uses Google Sign-In
    if ($user["provider"] === "google" || $user["is_google_linked"]) {
        logMessage("User registered with Google provider");
        echo json_encode([
            "success" => false, 
            "message" => "Password reset failed. This email is linked to a Google account.",
            "error_type" => "google_account"
        ]);
        exit();
    }

    logMessage("User found with ID: " . $user["id"] . ", Provider: " . $user["provider"] . ", Google linked: " . ($user["is_google_linked"] ? 'true' : 'false'));

    // Case 3: Account uses other third-party provider
    if ($user["provider"] !== "manual") {
        logMessage("User has third-party provider: " . $user["provider"]);
        echo json_encode([
            "success" => false, 
            "message" => "This account was created with a third-party service. Please use the appropriate sign-in method.",
            "error_type" => "third_party_account"
        ]);
        exit();
    }

    // Case 4: Valid manual account - proceed with password reset
    logMessage("Valid manual account found, proceeding with password reset");

    // Check rate limiting - count reset attempts in the last 24 hours
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as attempt_count, 
               MIN(created_at) as first_attempt,
               MAX(created_at) as last_attempt
        FROM password_resets 
        WHERE user_id = :user_id 
        AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ");
    $stmt->execute(["user_id" => $user["id"]]);
    $rateLimit = $stmt->fetch(PDO::FETCH_ASSOC);

    logMessage("Rate limit check - Attempts in last 24h: " . $rateLimit['attempt_count']);

    // If user has made 3 or more attempts in the last 24 hours
    if ($rateLimit['attempt_count'] >= 3) {
        // Calculate when they can try again (24 hours from first attempt)
        $firstAttemptTime = new DateTime($rateLimit['first_attempt']);
        $canTryAgainTime = $firstAttemptTime->add(new DateInterval('P1D')); // Add 24 hours
        $currentTime = new DateTime();
        
        if ($currentTime < $canTryAgainTime) {
            $timeRemaining = $canTryAgainTime->format('Y-m-d H:i:s');
            $timeRemainingFormatted = $canTryAgainTime->format('M j, Y \a\t g:i A');
            
            logMessage("Rate limit exceeded. User can try again at: " . $timeRemaining);
            
            echo json_encode([
                "success" => false, 
                "message" => "You've reached the limit for password reset requests. Please try again on " . $timeRemainingFormatted . ".",
                "rate_limited" => true,
                "can_try_again_at" => $timeRemaining,
                "can_try_again_formatted" => $timeRemainingFormatted,
                "error_type" => "rate_limited"
            ]);
            exit();
        } else {
            // 24 hours have passed, clean up old attempts
            $stmt = $pdo->prepare("
                DELETE FROM password_resets 
                WHERE user_id = :user_id 
                AND created_at <= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            $stmt->execute(["user_id" => $user["id"]]);
            logMessage("Cleaned up old reset attempts for user ID: " . $user["id"]);
        }
    }

    // Generate a 6-digit OTP code
    $otp = sprintf("%06d", mt_rand(100000, 999999));
    logMessage("Generated OTP: $otp for user ID: " . $user["id"]);
    
    // Set expiry time (15 minutes from now)
    $expires = date("Y-m-d H:i:s", strtotime("+15 minutes"));
    logMessage("OTP will expire at: $expires");

    // Invalidate any existing unused OTPs for this user
    $stmt = $pdo->prepare("UPDATE password_resets SET used = 1 WHERE user_id = :user_id AND used = 0");
    $stmt->execute(["user_id" => $user["id"]]);
    logMessage("Invalidated existing OTPs for user ID: " . $user["id"]);

    // Store the new OTP (this counts as an attempt)
    $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, email, token, expires_at) VALUES (:user_id, :email, :token, :expires_at)");
    $stmt->execute([
        "user_id" => $user["id"],
        "email" => $email,
        "token" => $otp,
        "expires_at" => $expires
    ]);
    logMessage("Stored OTP in database for user ID: " . $user["id"]);

    // Send the email with OTP
    $mail = new PHPMailer(true);
    try {
        // Enable verbose debug output
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        
        // Capture debug output
        ob_start();
        
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = SMTP_AUTH;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port = SMTP_PORT;

        logMessage("SMTP Configuration: Host=" . SMTP_HOST . ", Port=" . SMTP_PORT . ", Username=" . SMTP_USERNAME);

        // IMPORTANT: When using Gmail SMTP, the From address MUST match the SMTP username
        $mail->setFrom(EMAIL_FROM, EMAIL_FROM_NAME);
        logMessage("From address set to: " . EMAIL_FROM);
        
        // The recipient can be any valid email address
        $mail->addAddress($email, $user['first_name']);
        logMessage("Recipient address set to: " . $email);

        // Add special headers for organizational emails to improve deliverability
        if ($isOrganizationalEmail) {
            // Add a Message-ID header with your domain
            $mail->MessageID = '<' . uniqid() . '@' . parse_url(APP_URL, PHP_URL_HOST) . '>';
            // Add a List-Unsubscribe header (good practice for transactional emails)
            $mail->addCustomHeader('List-Unsubscribe', '<' . APP_URL . '/unsubscribe?email=' . $email . '>');
            logMessage("Added special headers for organizational email");
        }

        $mail->isHTML(true);
        $mail->Subject = 'Your Password Reset Code';
        logMessage("Email subject set: 'Your Password Reset Code'");
        
        // Calculate remaining attempts
        $remainingAttempts = 3 - ($rateLimit['attempt_count'] + 1); // +1 for current attempt
        
        // Email with OTP code - slightly modified for organizational emails
        $emailBody = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #4169e1;'>Password Reset Code</h2>
                <p>Hello {$user['first_name']},</p>
                <p>We received a request to reset your password. Please use the following code to reset your password:</p>
                
                <div style='background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0; border-radius: 5px;'>
                    {$otp}
                </div>
                
                <p>This code will expire in 15 minutes.</p>";
        
        if ($remainingAttempts > 0) {
            $emailBody .= "<p><strong>Note:</strong> You have {$remainingAttempts} password reset attempts remaining in the next 24 hours.</p>";
        } else {
            $emailBody .= "<p><strong>Note:</strong> This is your last password reset attempt for the next 24 hours.</p>";
        }
        
        $emailBody .= "<p>If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>";
        
        // Add additional information for organizational emails
        if ($isOrganizationalEmail) {
            $emailBody .= "
                <p>Note: If you don't see this email in your inbox, please check your spam or junk folder. 
                You may also want to add " . EMAIL_FROM . " to your contacts or safe senders list.</p>";
        }
        
        $emailBody .= "
                <p>Thank you,<br>Formly Team</p>
            </div>
        ";
        
        $mail->Body = $emailBody;
        
        $altBody = "Hello {$user['first_name']},\n\nWe received a request to reset your password. Please use the following code to reset your password:\n\n{$otp}\n\nThis code will expire in 15 minutes.\n\n";
        
        if ($remainingAttempts > 0) {
            $altBody .= "Note: You have {$remainingAttempts} password reset attempts remaining in the next 24 hours.\n\n";
        } else {
            $altBody .= "Note: This is your last password reset attempt for the next 24 hours.\n\n";
        }
        
        $altBody .= "If you did not request this password reset, please ignore this email or contact support if you have concerns.";
        
        if ($isOrganizationalEmail) {
            $altBody .= "\n\nNote: If you don't see this email in your inbox, please check your spam or junk folder. You may also want to add " . EMAIL_FROM . " to your contacts or safe senders list.";
        }
        
        $altBody .= "\n\nThank you,\nFormly Team";
        
        $mail->AltBody = $altBody;

        logMessage("Attempting to send email...");
        $mail->send();
        
        // Get debug output
        $smtpDebug = ob_get_clean();
        logMessage("SMTP Debug Output: " . $smtpDebug);
        
        logMessage("Email sent successfully to: $email");
        
        // Store the email in the session for the frontend to use
        echo json_encode([
            "success" => true, 
            "message" => "Password reset code has been sent to your email.",
            "email" => $email, // Return the email to use in the next step
            "remaining_attempts" => $remainingAttempts
        ]);
    } catch (Exception $e) {
        // Get debug output
        $smtpDebug = ob_get_clean();
        logMessage("SMTP Debug Output: " . $smtpDebug);
        
        logMessage("Failed to send email: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Failed to send email: " . $e->getMessage()]);
    }
} catch (Exception $e) {
    logMessage("Error in forgot-password.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "An error occurred: " . $e->getMessage()]);
}
?>
