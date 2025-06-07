<?php
/**
 * Email Configuration
 * 
 * This file contains the configuration for sending emails.
 * Update these settings with your actual SMTP server details.
 */

// SMTP Configuration
define('SMTP_HOST', 'smtp.gmail.com'); // Gmail's SMTP server
define('SMTP_PORT', 587); // Port 587 for TLS
define('SMTP_SECURE', 'tls'); // Use TLS encryption
define('SMTP_AUTH', true); // Enable SMTP authentication
define('SMTP_USERNAME', '202310749@gordoncollege.edu.ph'); // Your Gmail email address
define('SMTP_PASSWORD', 'tsoo omhw hrnn jbjy'); // Use your Gmail App Password
define('EMAIL_FROM', '202310749@gordoncollege.edu.ph'); // Sender's email address
define('EMAIL_FROM_NAME', 'Formly Team'); // Sender's name
define('APP_NAME', 'Formly');
define('APP_URL', 'http://localhost:5173');
