import nodemailer from 'nodemailer';
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  ORDER_CONFIRMATION_TEMPLATE,
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
export const sendShareEmail = async (email: string, message: string, url: string, senderName?: string) => {
  try {
    const transporter = createTransporter();

    // Quotes for jewelry
    const quotes = [
      "Jewelry has the power to be the one little thing that makes you feel unique.",
      "Every piece of jewelry tells a story.",
      "Diamonds are a girl's best friend, and jewelry is the spice of life.",
      "Gold is the sun's reflection on Earth.",
      "Elegance is not standing out, but being remembered."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const title = url.includes('wishlist')
      ? (senderName ? `Discover ${senderName}'s Wishlist` : 'Discover Wishlist')
      : 'Discover the Collection';

    const headerText = senderName
      ? `${senderName} shared something beautiful with you!`
      : "Someone shared something beautiful with you!";

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
          <h2 style="color: #1f2937; margin-top: 0; font-size: 18px; font-weight: 600; text-align: center;">${headerText}</h2>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f0fdfa; border-left: 4px solid #0d9488; border-radius: 4px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">"${message.replace(/\n/g, '<br/>')}"</p>
          </div>

          <div style="text-align: center; margin: 30px 0; padding: 15px; border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6; font-style: italic; color: #6b7280;">
            <p style="margin: 0; font-size: 14px;">"${randomQuote}"</p>
          </div>

          <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
            We invite you to explore this hand-picked selection from our collection. At Kyna Jewels, we take pride in being <strong>the best online destination for premium jewellery</strong>.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${url}" style="background-color: #0d9488; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; transition: background-color 0.3s ease; box-shadow: 0 2px 10px rgba(13, 148, 136, 0.3);">${title}</a>
          </div>

          <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Come visit us at <a href="https://kynajewels.com" style="color: #0d9488; text-decoration: none; font-weight: 500;">kynajewels.com</a></p>
            <p style="font-size: 13px; color: #9ca3af;">Experience the finest in online jewellery business.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0;">
          <p style="font-size: 11px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} Kyna Jewels. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: email,
      subject: senderName ? `${senderName} shared a wishlist with you from Kyna Jewels` : 'Something beautiful from Kyna Jewels just for you',
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Share email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending share email:', error);
    throw new Error(`Error sending share email: ${error}`);
  }
};

// Order confirmation email interface
export interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: string;
  transactionId: string;
  estimatedDelivery: string;
  items: Array<{
    title: string;
    sku?: string;
    variantSku?: string;
    quantity: number;
    price: number;
    total: number;
    imageUrl?: string;
    variantConfig?: any;
  }>;
  subtotal: number;
  gst: number;
  shipping: number;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

// Customization order confirmation email interface
export interface CustomizationOrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  requestNumber: string;
  orderDate: string;
  paymentMethod: string;
  transactionId: string;
  estimatedDelivery: string;
  customizationDetails: {
    title: string;
    description: string;
    category: string;
    subCategory: string;
    jewelryType: string;
    metalType?: string;
    metalKarat?: string;
    metalColor?: string;
    diamondShape?: string;
    diamondSize?: string;
    diamondOrigin?: string;
    size?: string;
    engraving?: string;
    specialInstructions?: string;
  };
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

// Send customization order confirmation email
export const sendCustomizationOrderConfirmationEmail = async (orderData: CustomizationOrderConfirmationData) => {
  console.log(`📧 sendCustomizationOrderConfirmationEmail called for order ${orderData.orderNumber}`);
  console.log(`📧 Customer email: ${orderData.customerEmail}`);
  
  try {
    const transporter = createTransporter();
    console.log(`📧 Email transporter created successfully`);

    // Format customization details HTML
    const customizationDetailsHtml = `
      <div class="order-item">
        <div class="item-details" style="padding: 16px 0;">
          <div class="item-title" style="font-weight: 600; color: #3a2f2a; margin-bottom: 4px; font-size: 16px;">${orderData.customizationDetails.title}</div>
          ${orderData.requestNumber && !orderData.requestNumber.startsWith('REQ-KYNA') ? `<div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">Request: ${orderData.requestNumber}</div>` : ''}
          <div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">Category: ${orderData.customizationDetails.category} - ${orderData.customizationDetails.subCategory}</div>
          <div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">Type: ${orderData.customizationDetails.jewelryType}</div>
          ${orderData.customizationDetails.metalType ? `<div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">Metal: ${orderData.customizationDetails.metalColor} ${orderData.customizationDetails.metalType} ${orderData.customizationDetails.metalKarat}</div>` : ''}
          ${orderData.customizationDetails.diamondShape ? `<div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">Diamond: ${orderData.customizationDetails.diamondSize} carat ${orderData.customizationDetails.diamondShape} ${orderData.customizationDetails.diamondOrigin}</div>` : ''}
          ${orderData.customizationDetails.size ? `<div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">Size: ${orderData.customizationDetails.size}</div>` : ''}
          ${orderData.customizationDetails.engraving ? `<div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">Engraving: ${orderData.customizationDetails.engraving}</div>` : ''}
          ${orderData.customizationDetails.specialInstructions ? `<div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 8px;">Special Instructions: ${orderData.customizationDetails.specialInstructions}</div>` : ''}
          <div class="item-price" style="font-weight: 600; color: #0f9aa7; font-size: 18px; margin-top: 8px;">₹${orderData.totalAmount.toLocaleString('en-IN')}</div>
        </div>
      </div>
    `;

    // Format addresses
    const formatAddress = (address: any) => {
      return `${address.street}<br>${address.city}, ${address.state} ${address.zipCode}<br>${address.country}`;
    };

    // Replace template placeholders (using same template but with customization content)
    let emailHtml = ORDER_CONFIRMATION_TEMPLATE
      .replace('{customerName}', orderData.customerName)
      .replace('{orderNumber}', orderData.orderNumber)
      .replace('{orderDate}', orderData.orderDate)
      .replace('{paymentMethod}', orderData.paymentMethod)
      .replace('{transactionId}', orderData.transactionId)
      .replace('{orderItems}', customizationDetailsHtml)
      .replace('{totalAmount}', orderData.totalAmount.toLocaleString('en-IN'))
      .replace('{shippingAddress}', formatAddress(orderData.shippingAddress))
      .replace('{billingAddress}', formatAddress(orderData.billingAddress));

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: orderData.customerEmail,
      subject: `Customization Order Confirmation #${orderData.orderNumber} - Kyna Jewels`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Customization order confirmation email sent successfully to ${orderData.customerEmail} for order ${orderData.orderNumber}`);
  } catch (error) {
    console.error('Error sending customization order confirmation email:', error);
    throw new Error(`Error sending customization order confirmation email: ${error}`);
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (orderData: OrderConfirmationData) => {
  console.log(`📧 sendOrderConfirmationEmail called for order ${orderData.orderNumber}`);
  console.log(`📧 Customer email: ${orderData.customerEmail}`);
  
  try {
    const transporter = createTransporter();
    console.log(`📧 Email transporter created successfully`);

    // Format order items HTML (without images)
    const orderItemsHtml = orderData.items.map(item => {
      console.log(`📧 Processing item: ${item.title}`);
      
      const variantDetails = [];
      
      if (item.variantConfig) {
        if (item.variantConfig.metalType && item.variantConfig.metalColor) {
          variantDetails.push(`Metal: ${item.variantConfig.metalColor} ${item.variantConfig.metalType}`);
        }
        if (item.variantConfig.goldKarat) variantDetails.push(`Karat: ${item.variantConfig.goldKarat}`);
        if (item.variantConfig.diamondShape) variantDetails.push(`Diamond: ${item.variantConfig.diamondShape}`);
        if (item.variantConfig.ringSize) variantDetails.push(`Size: ${item.variantConfig.ringSize}`);
      }
      
      return `
        <div class="order-item">
          <div class="item-details" style="padding: 16px 0;">
            <div class="item-title" style="font-weight: 600; color: #3a2f2a; margin-bottom: 4px; font-size: 16px;">${item.title}</div>
            ${item.sku ? `<div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">SKU: ${item.sku}</div>` : ''}
            ${variantDetails.length > 0 ? `<div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">${variantDetails.join(' • ')}</div>` : ''}
            <div class="item-variant" style="font-size: 13px; color: #8b776a; margin-bottom: 2px;">Quantity: ${item.quantity}</div>
            <div class="item-price" style="font-weight: 600; color: #0f9aa7; font-size: 18px; margin-top: 8px;">₹${item.total.toLocaleString('en-IN')}</div>
          </div>
        </div>
      `;
    }).join('');

    // Format addresses
    const formatAddress = (address: any) => {
      return `${address.street}<br>${address.city}, ${address.state} ${address.zipCode}<br>${address.country}`;
    };

    // Replace template placeholders
    let emailHtml = ORDER_CONFIRMATION_TEMPLATE
      .replace('{customerName}', orderData.customerName)
      .replace('{orderNumber}', orderData.orderNumber)
      .replace('{orderDate}', orderData.orderDate)
      .replace('{paymentMethod}', orderData.paymentMethod)
      .replace('{transactionId}', orderData.transactionId)
      .replace('{orderItems}', orderItemsHtml)
      .replace('{totalAmount}', orderData.totalAmount.toLocaleString('en-IN'))
      .replace('{shippingAddress}', formatAddress(orderData.shippingAddress))
      .replace('{billingAddress}', formatAddress(orderData.billingAddress));

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
      to: orderData.customerEmail,
      subject: `Order Confirmation #${orderData.orderNumber} - Kyna Jewels`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent successfully to ${orderData.customerEmail} for order ${orderData.orderNumber}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw new Error(`Error sending order confirmation email: ${error}`);
  }
};