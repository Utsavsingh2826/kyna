const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    background: #f4efe6;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #3a2f2a;
  }
  .wrapper {
    width: 100%;
    background: #f4efe6;
    padding: 40px 0;
  }
  .container {
    width: 100%;
    max-width: 620px;
    margin: 0 auto;
    background: #fffdf8;
    border-radius: 18px;
    box-shadow: 0 20px 40px rgba(14, 92, 103, 0.08);
    overflow: hidden;
    border: 1px solid #e4d7c7;
  }
  .brand-bar {
    background: #0f9aa7;
    text-align: center;
    padding: 32px 20px 26px;
    color: #fefefe;
    letter-spacing: 6px;
    font-size: 26px;
    font-weight: 600;
  }
  .brand-bar span {
    display: block;
    font-size: 13px;
    letter-spacing: 2px;
    margin-top: 6px;
  }
  .hero {
    background: #0f9aa7;
    color: #fefefe;
    text-align: center;
    padding: 18px 30px 26px;
    font-size: 18px;
    letter-spacing: 1px;
  }
  .content {
    padding: 36px 40px 10px;
  }
  .card {
    background: #ffffff;
    border-radius: 18px;
    border: 1px solid #f0e4d4;
    padding: 26px 28px;
    margin-bottom: 24px;
  }
  .card-title {
    text-transform: uppercase;
    font-size: 15px;
    letter-spacing: 2px;
    color: #8b776a;
    margin-bottom: 8px;
  }
  .summary {
    font-size: 16px;
    margin-bottom: 18px;
    color: #4a3c35;
  }
  .highlight-box {
    background: #eef7f8;
    border: 1px dashed #0f9aa7;
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    margin: 18px 0;
    font-weight: 600;
    letter-spacing: 2px;
    color: #0f9aa7;
    font-size: 26px;
  }
  .primary-btn {
    display: inline-block;
    background: #0f9aa7;
    color: #ffffff;
    padding: 14px 32px;
    border-radius: 40px;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 13px;
    margin: 14px 0 8px;
  }
  .note {
    background: #fff4ea;
    border-radius: 14px;
    border-left: 4px solid #c97c42;
    padding: 16px 18px;
    font-size: 14px;
    color: #6b4d3d;
    margin: 16px 0;
  }
  .details-table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 8px;
  }
  .details-table td {
    padding: 6px 0;
    font-size: 14px;
    color: #57463d;
  }
  .details-table td:first-child {
    color: #8b776a;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 13px;
    width: 45%;
  }
  .footer {
    padding: 24px 40px 36px;
    text-align: center;
    font-size: 13px;
    color: #8a7a6f;
    border-top: 1px solid #f0e4d4;
  }
  .contact-link {
    color: #0f9aa7;
    text-decoration: none;
    font-weight: 600;
  }
`;

const socialFooter = `
  <p style="margin: 6px 0 14px;">CONNECT WITH US</p>
  <div style="display:inline-flex;gap:18px;">
    <a href="https://www.instagram.com/kyna_jewels?igsh=MWZ5MWNtZHg0YnN6dA==" style="color:#0f9aa7;text-decoration:none;">Instagram</a>
  </div>
`;

const legalFooter = `
  <p style="margin-top:18px;font-size:11px;color:#b0a195;line-height:1.5;">
    © ${new Date().getFullYear()} KYNA. All rights reserved. You received this message because you registered on the KYNA platform. To manage your email preferences, visit your account settings.
  </p>
  <p style="font-size:11px;color:#b0a195;">
    Privacy Policy • Terms of Service
  </p>
`;

// Email verification template
export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code - KYNA</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="brand-bar">KYNA<span>FINE JEWELLERY</span></div>
      <div class="hero">Email Verification Required</div>
      <div class="content">
        <div class="card">
          <div class="card-title">Dear Patron,</div>
          <p class="summary">Thank you for registering with KYNA. Use the code below to activate your account and continue your journey with us.</p>
          <div class="highlight-box">{verificationCode}</div>
          <table class="details-table">
            <tr><td>Expires</td><td>10 minutes from the time you received this email</td></tr>
            <tr><td>Where to use</td><td>Enter the code on the verification screen after signing in</td></tr>
            <tr><td>Need help?</td><td>Call +91 8928610682 or email enquiries@kynajewellery.com</td></tr>
          </table>
          <div style="text-align:center;">
            <a class="primary-btn" href="${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email">Verify My Email</a>
          </div>
          <div class="note">
            If you didn’t request this, ignore the message—your account stays secure.
          </div>
        </div>
      </div>
      <div class="footer">
        ${socialFooter}
        ${legalFooter}
      </div>
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
  <title>Welcome to KYNA</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="brand-bar">KYNA<span>FINE JEWELLERY</span></div>
      <div class="hero">Your Account Is Ready</div>
      <div class="content">
        <div class="card">
          <div class="card-title">Welcome, {name}</div>
          <p class="summary">Your KYNA account has been verified successfully. Explore curated collections, manage your wishlist, and enjoy bespoke assistance tailored to you.</p>
          <div class="highlight-box" style="margin-top:10px;">ACCOUNT VERIFIED</div>
          <table class="details-table">
            <tr><td>Discover</td><td>Shop new arrivals and timeless icons</td></tr>
            <tr><td>Personalize</td><td>Save favourites, curate wishlists, share with loved ones</td></tr>
            <tr><td>Track</td><td>Follow orders, manage returns, and monitor referrals</td></tr>
          </table>
          <div style="text-align:center;">
            <a class="primary-btn" href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Explore KYNA</a>
          </div>
          <div class="note">
            Need styling advice or gifting assistance? Our concierge is here for you—just reply to this email.
          </div>
        </div>
      </div>
      <div class="footer">
        ${socialFooter}
        ${legalFooter}
      </div>
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
  <title>Reset Your Password - KYNA</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="brand-bar">KYNA<span>FINE JEWELLERY</span></div>
      <div class="hero">Secure Password Reset</div>
      <div class="content">
        <div class="card">
          <div class="card-title">Request Received</div>
          <p class="summary">We received a request to reset the password on your KYNA account. Use the secure link below to set a new password.</p>
          <div class="highlight-box" style="margin-top:10px;">RESET LINK ACTIVE</div>
          <table class="details-table">
            <tr><td>Issued for</td><td>Your KYNA login</td></tr>
            <tr><td>Validity</td><td>60 minutes</td></tr>
            <tr><td>Security</td><td>Link can be used once and cannot be forwarded</td></tr>
          </table>
          <div style="text-align:center;">
            <a class="primary-btn" href="{resetURL}">Reset Password</a>
          </div>
          <div class="note">
            Didn’t request this? Ignore the message—your password remains unchanged.
          </div>
        </div>
      </div>
      <div class="footer">
        ${socialFooter}
        ${legalFooter}
      </div>
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
  <title>Password Updated - KYNA</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="brand-bar">KYNA<span>FINE JEWELLERY</span></div>
      <div class="hero">Password Reset Successful</div>
      <div class="content">
        <div class="card">
          <div class="card-title">Security Confirmed</div>
          <p class="summary">Your password has been updated. You can now sign in with your new credentials and continue enjoying the KYNA experience.</p>
          <div class="highlight-box" style="margin-top:10px;">PASSWORD UPDATED</div>
          <table class="details-table">
            <tr><td>Next Step</td><td>Sign in with your new password</td></tr>
            <tr><td>Tip</td><td>Use a unique passphrase & update it periodically</td></tr>
          </table>
          <div style="text-align:center;">
            <a class="primary-btn" href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login">Continue to KYNA</a>
          </div>
          <div class="note">
            Didn’t change your password? Contact us immediately at <a class="contact-link" href="mailto:enquiries@kynajewellery.com">enquiries@kynajewellery.com</a>.
          </div>
        </div>
      </div>
      <div class="footer">
        ${socialFooter}
        ${legalFooter}
      </div>
    </div>
  </div>
</body>
</html>
`;