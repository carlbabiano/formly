<?php
/**
 * Email Sending Helper
 * 
 * This file contains a helper function to send emails using PHPMailer.
 */

require_once __DIR__ . '/../../vendor/autoload.php';
require_once 'email-config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

/**
 * Send an email using PHPMailer
 * 
 * @param string $to Recipient email address
 * @param string $toName Recipient name
 * @param string $subject Email subject
 * @param string $htmlBody HTML email body
 * @param string $textBody Plain text email body
 * @return array Result of the email sending operation
 */
function sendEmail($to, $toName, $subject, $htmlBody, $textBody = '') {
    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = SMTP_AUTH;
        $mail->Username   = SMTP_USERNAME;
        $mail->Password   = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port       = SMTP_PORT;
        
        // Recipients
        $mail->setFrom(EMAIL_FROM, EMAIL_FROM_NAME);
        $mail->addAddress($to, $toName);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->AltBody = $textBody ?: strip_tags($htmlBody);
        
        $mail->send();
        return [
            'success' => true,
            'message' => 'Email sent successfully'
        ];
    } catch (Exception $e) {
        error_log("Email sending failed: " . $mail->ErrorInfo);
        return [
            'success' => false,
            'message' => "Email could not be sent. Error: " . $mail->ErrorInfo
        ];
    }
}
