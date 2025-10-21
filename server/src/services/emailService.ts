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
