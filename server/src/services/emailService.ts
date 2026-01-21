import nodemailer from 'nodemailer';
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from './emailTemplates';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'enquiries@kynajewels.com',
      pass: process.env.EMAIL_PASS || 'qrue wzck rvqw pjzg',
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
};

// Send verification email
export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: email,
      subject: 'Verify your email - Kyna Jewels',
      html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationToken),
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: email,
      subject: 'Welcome to Kyna Jewels!',
      html: WELCOME_EMAIL_TEMPLATE.replace('{name}', name),
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: email,
      subject: 'Reset your password - Kyna Jewels',
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL),
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

// Send password reset success email
export const sendResetSuccessEmail = async (email: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: email,
      subject: 'Password Reset Successful - Kyna Jewels',
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset success email sent successfully');
  } catch (error) {
    console.error('Error sending password reset success email:', error);
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
// Send share email
export const sendShareEmail = async (email: string, message: string, url: string) => {
  try {
    const transporter = createTransporter();

    // Premium HTML template for sharing
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #0d9488; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 300;">KYNA JEWELS</h1>
          <p style="color: #ccfbf1; margin: 10px 0 0 0; font-size: 14px; font-style: italic;">Exquisite Craftsmanship. Timeless Beauty.</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 20px; font-weight: 600;">You've Received a Special Recommendation!</h2>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f0fdfa; border-left: 4px solid #0d9488; border-radius: 4px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">"${message.replace(/\n/g, '<br/>')}"</p>
          </div>

          <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
            We invite you to explore this hand-picked selection from our collection. At Kyna Jewels, we take pride in being <strong>the best online destination for premium jewellery</strong>, offering pieces that celebrate your unique story.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${url}" style="background-color: #0d9488; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; transition: background-color 0.3s ease; box-shadow: 0 2px 10px rgba(13, 148, 136, 0.3);">Discover the Collection</a>
          </div>

          <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Come visit us at <a href="https://kynajewels.com" style="color: #0d9488; text-decoration: none; font-weight: 500;">kynajewels.com</a></p>
            <p style="font-size: 13px; color: #9ca3af;">Experience the finest in online jewellery business.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0;">
          <p style="font-size: 11px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} Kyna Jewels. All rights reserved.</p>
          <p style="font-size: 11px; color: #9ca3af; margin: 5px 0 0 0;">This email was sent via a secure sharing feature on our website.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: email,
      subject: 'Something beautiful from Kyna Jewels just for you',
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Share email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending share email:', error);
    throw new Error(`Error sending share email: ${error}`);
  }
};
