import { IReferral, IUser } from '../types';
import { sendEmail } from './email';

// Send referral invitation email
export const sendReferralInvitation = async (
  referral: IReferral, 
  referrer: IUser, 
  friendEmail: string
): Promise<boolean> => {
  try {
    console.log(`[ReferralEmail] Preparing invitation for ${friendEmail}`);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const referralLink = `${baseUrl}/signup?referral=${referrer.referralCode}`;
    
    console.log(`[ReferralEmail] Referral link: ${referralLink}`);
    const subject = `${referrer.firstName} invited you to join Kyna Jewels!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited to Kyna Jewels!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .referral-code { background: #e8f2ff; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .note { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ You're Invited to Kyna Jewels! ✨</h1>
            <p>Discover beautiful jewelry and earn rewards together</p>
          </div>
          
          <div class="content">
            <h2>Hello!</h2>
            <p><strong>${referrer.firstName} ${referrer.lastName || ''}</strong> has invited you to join Kyna Jewels, where you can discover stunning jewelry pieces and earn rewards!</p>
            
            ${referral.note ? `<div class="note"><strong>Personal message from ${referrer.firstName}:</strong><br>"${referral.note}"</div>` : ''}
            
            <h3>🎁 What's in it for you?</h3>
            <ul>
              <li>Get a <strong>5% discount</strong> when you sign up</li>
              <li>Access to exclusive jewelry collections</li>
              <li>Earn rewards for future purchases</li>
              <li>${referrer.firstName} will also get a reward when you join!</li>
            </ul>
            
            <div class="referral-code">
              Your Referral Code: ${referrer.referralCode}
            </div>
            
            <div style="text-align: center;">
              <a href="${referralLink}" class="cta-button">Sign Up & Get 5% Discount</a>
            </div>
            
            <p><strong>How to get your discount:</strong></p>
            <ol>
              <li>Click the button above to visit our website</li>
              <li>You'll be redirected to our signup page</li>
              <li>Create your account (referral code is automatically applied)</li>
              <li>Verify your email with OTP</li>
              <li>You get 5% discount automatically!</li>
            </ol>
            
            <p><em>This invitation expires on ${new Date(referral.expiresAt).toLocaleDateString()}.</em></p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The Kyna Jewels Team</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`[ReferralEmail] Calling sendEmail for ${friendEmail}`);
    await sendEmail(friendEmail, subject, html);
    console.log(`[ReferralEmail] Email sent successfully to ${friendEmail}`);
    return true;
  } catch (error) {
    console.error(`[ReferralEmail] Error sending referral email to ${friendEmail}:`, error);
    console.error(`[ReferralEmail] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    return false;
  }
};

// Send referral success notification to referrer
export const sendReferralSuccessNotification = async (
  referrer: IUser,
  friendEmail: string,
  friendName: string
): Promise<boolean> => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const subject = '🎉 Your friend joined Kyna Jewels!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Friend Joined!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .reward-box { background: #d4edda; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; border-left: 4px solid #28a745; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>Your friend joined Kyna Jewels!</p>
          </div>
          
          <div class="content">
            <h2>Great news!</h2>
            <p><strong>${friendName}</strong> (${friendEmail}) has successfully joined Kyna Jewels using your referral code!</p>
            
            <div class="reward-box">
              <h3>🎁 Your Reward</h3>
              <p><strong>₹100</strong> has been added to your account!</p>
              <p>You can use this reward on your next purchase.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${baseUrl}/products" class="cta-button">Start Shopping</a>
            </div>
            
            <p><strong>Keep referring friends to earn more rewards!</strong></p>
            <p>Share your referral code: <strong>${referrer.referralCode}</strong></p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The Kyna Jewels Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(referrer.email, subject, html);
    return true;
  } catch (error) {
    console.error('Error sending referral success email:', error);
    return false;
  }
};

// Send reminder email for pending referrals
export const sendReferralReminder = async (
  referral: IReferral, 
  referrer: IUser, 
  friendEmail: string
): Promise<boolean> => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const referralLink = `${baseUrl}/signup?referral=${referrer.referralCode}`;
    
    const subject = '⏰ Reminder: Your Kyna Jewels invitation is waiting!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reminder: Your Kyna Jewels Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .referral-code { background: #ffe8e8; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #ff6b6b; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .note { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
          .urgency { background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Don't Miss Out!</h1>
            <p>Your invitation from ${referrer.firstName} is still waiting</p>
          </div>
          
          <div class="content">
            <h2>Hello again!</h2>
            <p><strong>${referrer.firstName}</strong> sent you an invitation to join Kyna Jewels, but we haven't seen you yet!</p>
            
            <div class="urgency">
              <h3>⏰ Limited Time Offer</h3>
              <p>This invitation expires on <strong>${new Date(referral.expiresAt).toLocaleDateString()}</strong></p>
              <p>Don't miss out on your special rewards!</p>
            </div>
            
            <div class="referral-code">
              Your Referral Code: ${referrer.referralCode}
            </div>
            
            <div style="text-align: center;">
              <a href="${referralLink}" class="cta-button">Join Now & Get 5% Discount</a>
            </div>
            
            <p><strong>What you'll get:</strong></p>
            <ul>
              <li>5% discount for joining</li>
              <li>Access to exclusive jewelry collections</li>
              <li>Special discounts on your first purchase</li>
              <li>${referrer.firstName} will also get a reward when you join!</li>
            </ul>
            
            <p>This is your last chance to claim this invitation!</p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The Kyna Jewels Team</p>
            <p>If you're not interested, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(friendEmail, subject, html);
    return true;
  } catch (error) {
    console.error('Error sending referral reminder email:', error);
    return false;
  }
};