<?php
require_once 'email-config.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
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
    $mail->addAddress('recipient@example.com', 'Recipient Name'); // Replace with recipient email

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Test Email';
    $mail->Body = '<p>This is a test email sent using Gmail SMTP.</p>';
    $mail->AltBody = 'This is a test email sent using Gmail SMTP.';

    $mail->send();
    echo 'Email has been sent successfully.';
} catch (Exception $e) {
    echo "Email could not be sent. Mailer Error: {$mail->ErrorInfo}";
}