import nodemailer from 'nodemailer';
import { IReferral, IUser } from '../types';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send referral invitation email
export const sendReferralInvitation = async (
  referral: IReferral, 
  referrer: IUser, 
  friendEmail: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const referralLink = `${baseUrl}/signup?referral=${referrer.referralCode}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: friendEmail,
      subject: `${referrer.firstName} invited you to join Kyna Jewels!`,
      html: `
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
                <li>Get a <strong>special discount</strong> when you sign up</li>
                <li>Access to exclusive jewelry collections</li>
                <li>Earn rewards for future purchases</li>
                <li>${referrer.firstName} will also get a reward when you join!</li>
              </ul>
              
              <div class="referral-code">
                Your Referral Code: ${referrer.referralCode}
              </div>
              
              <div style="text-align: center;">
                <a href="${referralLink}" class="cta-button">Sign Up & Get Rewards</a>
              </div>
              
              <p><strong>How to get your rewards:</strong></p>
              <ol>
                <li>Click the button above to visit our website</li>
                <li>You'll be redirected to our signup page</li>
                <li>Create your account (referral code is automatically applied)</li>
                <li>Verify your email with OTP</li>
                <li>Both you and ${referrer.firstName} get ₹100 rewards automatically!</li>
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
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending referral email:', error);
    return false;
  }
};

// Send referral success notification to referrer
export const sendReferralSuccessNotification = async (
  referrer: IUser,
  friendEmail: string,
  rewardAmount: number
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: referrer.email,
      subject: '🎉 Your referral was successful!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Referral Success!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reward-box { background: #d4edda; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; border: 2px solid #c3e6cb; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>Your referral was successful</p>
            </div>
            
            <div class="content">
              <h2>Great news, ${referrer.firstName}!</h2>
              <p><strong>${friendEmail}</strong> has successfully joined Kyna Jewels using your referral code!</p>
              
              <div class="reward-box">
                <h3>💰 Your Reward</h3>
                <p style="font-size: 24px; font-weight: bold; color: #28a745;">$${rewardAmount}</p>
                <p>has been added to your available offers balance!</p>
              </div>
              
              <p>You can use this reward on your next purchase. Thank you for helping us grow our community!</p>
              
              <p><strong>Want to refer more friends?</strong> Share your referral link and earn more rewards!</p>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>The Kyna Jewels Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
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
    const transporter = createTransporter();
    
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const referralLink = `${baseUrl}/signup?referral=${referrer.referralCode}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: friendEmail,
      subject: '⏰ Reminder: Your Kyna Jewels invitation is waiting!',
      html: `
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
              <p><strong>${referrer.firstName} ${referrer.lastName || ''}</strong> invited you to join Kyna Jewels a few days ago, and we wanted to make sure you didn't miss this special offer!</p>
              
              <div class="urgency">
                <strong>⏰ Limited Time Offer:</strong> This invitation expires on ${new Date(referral.expiresAt).toLocaleDateString()}!
              </div>
              
              ${referral.note ? `<div class="note"><strong>Personal message from ${referrer.firstName}:</strong><br>"${referral.note}"</div>` : ''}
              
              <h3>🎁 What you'll get:</h3>
              <ul>
                <li>Get a <strong>special discount</strong> when you sign up</li>
                <li>Access to exclusive jewelry collections</li>
                <li>Earn rewards for future purchases</li>
                <li>${referrer.firstName} will also get a reward when you join!</li>
              </ul>
              
              <div class="referral-code">
                Your Referral Code: ${referral.referFrdId}
              </div>
              
              <div style="text-align: center;">
                <a href="${referralLink}" class="cta-button">Sign Up & Get Rewards</a>
              </div>
              
              <p><strong>How to get your rewards:</strong></p>
              <ol>
                <li>Click the button above to visit our website</li>
                <li>You'll be redirected to our signup page</li>
                <li>Create your account (referral code is automatically applied)</li>
                <li>Verify your email with OTP</li>
                <li>Both you and ${referrer.firstName} get ₹100 rewards automatically!</li>
              </ol>
              
              <p><em>This is your final reminder - don't let this opportunity slip away!</em></p>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>The Kyna Jewels Team</p>
              <p>If you don't want to receive these reminders, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending referral reminder email:', error);
    return false;
  }
};
