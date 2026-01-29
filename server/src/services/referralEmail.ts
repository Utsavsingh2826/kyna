import nodemailer from 'nodemailer';
import { IReferral, IUser } from '../types';
import { baseStyles, socialFooter, legalFooter } from './emailTemplates';

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

    const baseUrl = process.env.FRONTEND_URL || 'https://kynajewels.com';
    const referralLink = `${baseUrl}/signup?referral=${referrer.referralCode}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: friendEmail,
      subject: `${referrer.firstName} invited you to discover Kyna Jewels`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're Invited to KYNA</title>
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="brand-bar">KYNA<span>FINE JEWELLERY</span></div>
              <div class="hero">You're Invited</div>
              <div class="content">
                <div class="card">
                  <div class="card-title">Dear Friend,</div>
                  <p class="summary">
                    <strong>${referrer.firstName} ${referrer.lastName || ''}</strong> has invited you to discover KYNA, where timeless elegance meets modern craftsmanship. Join our community and unlock exclusive benefits.
                  </p>
                  
                  ${referral.note ? `<div class="note"><strong>Personal message from ${referrer.firstName}:</strong><br>"${referral.note}"</div>` : ''}
                  
                  <div class="highlight-box" style="margin-top:10px;">REFERRAL CODE: ${referrer.referralCode}</div>
                  
                  <table class="details-table">
                    <tr><td>Exclusive Access</td><td>Curated collections & limited editions</td></tr>
                    <tr><td>Special Benefits</td><td>Earn points & unlock discounts</td></tr>
                    <tr><td>Personalized Service</td><td>Bespoke assistance for your jewelry journey</td></tr>
                  </table>
                  
                  <div style="text-align:center;">
                    <a class="primary-btn" href="${referralLink}">Join KYNA Now</a>
                  </div>
                  
                  <div class="note">
                    This invitation expires on ${new Date(referral.expiresAt).toLocaleDateString()}. Start your journey with KYNA today.
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
      subject: 'Your referral was successful - KYNA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Referral Success - KYNA</title>
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="brand-bar">KYNA<span>FINE JEWELLERY</span></div>
              <div class="hero">Referral Successful</div>
              <div class="content">
                <div class="card">
                  <div class="card-title">Congratulations, ${referrer.firstName}</div>
                  <p class="summary">
                    <strong>${friendEmail}</strong> has successfully joined KYNA using your referral code. Thank you for sharing the beauty of KYNA with your friends.
                  </p>
                  
                  <div class="highlight-box" style="margin-top:10px;">POINTS EARNED</div>
                  
                  <table class="details-table">
                    <tr><td>Referral Status</td><td>Successfully completed</td></tr>
                    <tr><td>Points Added</td><td>Available in your account</td></tr>
                    <tr><td>Next Steps</td><td>Use your points for exclusive discounts</td></tr>
                  </table>
                  
                  <div style="text-align:center;">
                    <a class="primary-btn" href="${process.env.FRONTEND_URL || 'https://kynajewels.com'}">View My Account</a>
                  </div>
                  
                  <div class="note">
                    Continue sharing KYNA with your friends and family to earn more points and unlock special benefits.
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

    const baseUrl = process.env.FRONTEND_URL || 'https://kynajewels.com';
    const referralLink = `${baseUrl}/signup?referral=${referrer.referralCode}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: friendEmail,
      subject: 'Reminder: Your KYNA invitation awaits',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reminder: Your KYNA Invitation</title>
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="brand-bar">KYNA<span>FINE JEWELLERY</span></div>
              <div class="hero">Don't Miss Out</div>
              <div class="content">
                <div class="card">
                  <div class="card-title">Friendly Reminder</div>
                  <p class="summary">
                    <strong>${referrer.firstName} ${referrer.lastName || ''}</strong> invited you to join KYNA a few days ago. We wanted to ensure you don't miss this opportunity to discover exquisite jewelry and exclusive benefits.
                  </p>
                  
                  <div class="note" style="background: #fff4ea; border-left: 4px solid #c97c42;">
                    <strong>Limited Time:</strong> This invitation expires on ${new Date(referral.expiresAt).toLocaleDateString()}
                  </div>
                  
                  ${referral.note ? `<div class="note"><strong>Personal message from ${referrer.firstName}:</strong><br>"${referral.note}"</div>` : ''}
                  
                  <div class="highlight-box" style="margin-top:10px;">REFERRAL CODE: ${referrer.referralCode}</div>
                  
                  <table class="details-table">
                    <tr><td>Exclusive Access</td><td>Curated collections & limited editions</td></tr>
                    <tr><td>Special Benefits</td><td>Earn points & unlock discounts</td></tr>
                    <tr><td>Personalized Service</td><td>Bespoke assistance for your jewelry journey</td></tr>
                  </table>
                  
                  <div style="text-align:center;">
                    <a class="primary-btn" href="${referralLink}">Join KYNA Now</a>
                  </div>
                  
                  <div class="note">
                    Start your journey with KYNA today and unlock a world of elegant possibilities.
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
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending referral reminder email:', error);
    return false;
  }
};
