import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Create a function to generate the transporter
function createTransporter(): nodemailer.Transporter {
  // Check if we have SMTP credentials
  const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;
  
  // For development without real credentials, use Ethereal
  if (process.env.NODE_ENV === 'development' && !hasCredentials) {
    throw new Error('Ethereal test account requires async initialization');
  }
  
  // For production or when credentials are provided
  if (isGmailUser()) {
    return createGmailTransporter();
  } else {
    return createCustomSmtpTransporter();
  }
}

// Check if using Gmail
function isGmailUser(): boolean {
  const emailUser = process.env.EMAIL_USER || '';
  return emailUser.endsWith('@gmail.com') || 
         (process.env.EMAIL_HOST === 'smtp.gmail.com') || 
         (process.env.EMAIL_SERVICE === 'gmail');
}

// Create a Gmail-specific transporter (simpler configuration)
function createGmailTransporter(): nodemailer.Transporter {
  console.log('Creating Gmail transporter:');
  console.log(`- USER: ${process.env.EMAIL_USER}`);
  console.log('- Using App Password: Yes');
  
  return nodemailer.createTransport({
    service: 'gmail',  // Uses predefined settings for Gmail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // This should be an App Password
    },
    debug: true, // Enable debug logging
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
}

// Create a custom SMTP transporter
function createCustomSmtpTransporter(): nodemailer.Transporter {
  console.log('Creating custom SMTP transporter:');
  console.log(`- HOST: ${process.env.EMAIL_HOST || '(not set)'}`);
  console.log(`- PORT: ${process.env.EMAIL_PORT || '587'}`);
  console.log(`- USER: ${process.env.EMAIL_USER || '(not set)'}`);
  console.log(`- SECURE: ${process.env.EMAIL_SECURE === 'true' ? 'Yes' : 'No'}`);
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true, // Enable debug logging
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
}

// Create a test transporter using Ethereal
async function createTestTransporter(): Promise<nodemailer.Transporter> {
  try {
    // Create a test account at Ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    console.log('Created Ethereal test account:');
    console.log(`- USER: ${testAccount.user}`);
    console.log(`- PASS: ${testAccount.pass}`);
    
    // Create a transporter using those test credentials
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
  } catch (error) {
    console.error('Failed to create test email account:', error);
    throw new Error('Could not create test email account');
  }
}

// Create the transporter (may be async)
let transporterPromise: Promise<nodemailer.Transporter> | null = null;
let lastTransporterError: Error | null = null;

/**
 * Get or create the email transporter
 */
async function getTransporter(): Promise<nodemailer.Transporter> {
  if (lastTransporterError) {
    // Reset the error and try again if there was a previous error
    lastTransporterError = null;
    transporterPromise = null;
  }

  if (!transporterPromise) {
    // For the Ethereal case, which is async
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_PASS) {
      transporterPromise = createTestTransporter();
    } else {
      try {
        // For the real SMTP case
        const transporter = createTransporter();
        
        // Verify the connection works
        transporterPromise = new Promise<nodemailer.Transporter>((resolve, reject) => {
          transporter.verify((error) => {
            if (error) {
              console.error('Email transporter verification failed:', error);
              lastTransporterError = error;
              
              // If using Gmail and verification fails, try Ethereal as fallback
              if (isGmailUser() && process.env.NODE_ENV !== 'production') {
                console.log('Falling back to Ethereal test account...');
                createTestTransporter()
                  .then(resolve)
                  .catch(reject);
              } else {
                reject(error);
              }
            } else {
              console.log('Email transporter verified successfully!');
              resolve(transporter);
            }
          });
        });
      } catch (error) {
        console.error('Failed to create email transporter:', error);
        lastTransporterError = error instanceof Error ? error : new Error(String(error));
        throw error;
      }
    }
  }
  
  // This non-null assertion is safe because we either have a valid promise or have thrown an error
  return transporterPromise!;
}

/**
 * Send an email
 * @param to Recipient email address
 * @param subject Email subject
 * @param html Email content in HTML format
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com',
      to,
      subject,
      html,
    };
    
    console.log(`Sending email to ${to} with subject "${subject}"`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    // If using Ethereal, show preview URL
    if (info.messageId && typeof info.messageId === 'string' && info.messageId.includes('ethereal')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
