// Email verification template
export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Kyna Jewels</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .verification-code { background: #e8f2ff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; font-family: monospace; font-size: 24px; font-weight: bold; color: #667eea; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Welcome to Kyna Jewels! ✨</h1>
      <p>Please verify your email address to complete your registration</p>
    </div>
    
    <div class="content">
      <h2>Email Verification Required</h2>
      <p>Thank you for signing up with Kyna Jewels! To complete your registration and start exploring our beautiful jewelry collection, please verify your email address.</p>
      
      <div class="verification-code">
        Your Verification Code: {verificationCode}
      </div>
      
      <p>Enter this code in the verification form on our website to activate your account.</p>
      
      <p><strong>This code will expire in 24 hours for security reasons.</strong></p>
      
      <p>If you didn't create an account with Kyna Jewels, please ignore this email.</p>
    </div>
    
    <div class="footer">
      <p>Best regards,<br>The Kyna Jewels Team</p>
    </div>
  </div>
</body>
</html>
`;

// Welcome email template
export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kyna Jewels!</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .welcome-box { background: #d4edda; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; border: 2px solid #c3e6cb; }
    .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Kyna Jewels! 🎉</h1>
      <p>Your account has been successfully verified</p>
    </div>
    
    <div class="content">
      <h2>Hello {name}!</h2>
      <p>Congratulations! Your email has been verified and your Kyna Jewels account is now active.</p>
      
      <div class="welcome-box">
        <h3>🎁 What's Next?</h3>
        <p>Start exploring our stunning collection of jewelry and discover pieces that speak to your style!</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="cta-button">Start Shopping Now</a>
      </div>
      
      <h3>🌟 What you can do:</h3>
      <ul>
        <li>Browse our exclusive jewelry collections</li>
        <li>Create your wishlist</li>
        <li>Track your orders</li>
        <li>Earn rewards with every purchase</li>
        <li>Refer friends and get special discounts</li>
      </ul>
      
      <p>Thank you for choosing Kyna Jewels. We're excited to be part of your jewelry journey!</p>
    </div>
    
    <div class="footer">
      <p>Best regards,<br>The Kyna Jewels Team</p>
    </div>
  </div>
</body>
</html>
`;

// Password reset request template
export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Kyna Jewels</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .cta-button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .security-note { background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset Request</h1>
      <p>Kyna Jewels Account Security</p>
    </div>
    
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password for your Kyna Jewels account.</p>
      
      <div style="text-align: center;">
        <a href="{resetURL}" class="cta-button">Reset My Password</a>
      </div>
      
      <div class="security-note">
        <strong>Security Note:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email.
      </div>
      
      <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace;">{resetURL}</p>
      
      <p>For your security, this link will only work once and will expire after 1 hour.</p>
      </div>
      
    <div class="footer">
      <p>Best regards,<br>The Kyna Jewels Team</p>
      </div>
    </div>
</body>
</html>
`;

// Email verification function (for compatibility with rajan/backend)
export const verificationEmail = (otp: string): string => {
  return VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', otp);
};

// Password reset email function (for compatibility with rajan/backend)
export const resetPasswordEmail = (resetToken: string): string => {
  const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  return PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL);
};

// Password reset success template
export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful - Kyna Jewels</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-box { background: #d4edda; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; border: 2px solid #c3e6cb; }
    .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Password Reset Successful</h1>
      <p>Your account is now secure</p>
    </div>
    
    <div class="content">
      <h2>Password Successfully Updated!</h2>
      <p>Your Kyna Jewels account password has been successfully reset.</p>
      
      <div class="success-box">
        <h3>🔒 Account Security</h3>
        <p>Your account is now secure with your new password. You can now log in with your new credentials.</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="cta-button">Log In to Your Account</a>
      </div>
      
      <p><strong>Security Tips:</strong></p>
      <ul>
        <li>Use a strong, unique password</li>
        <li>Never share your password with anyone</li>
        <li>Log out from shared devices</li>
        <li>Contact us if you notice any suspicious activity</li>
      </ul>
      
      <p>If you didn't make this change, please contact our support team immediately.</p>
    </div>
    
    <div class="footer">
      <p>Best regards,<br>The Kyna Jewels Team</p>
    </div>
  </div>
</body>
</html>
`;