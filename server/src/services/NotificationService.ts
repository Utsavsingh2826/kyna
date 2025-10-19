import nodemailer from 'nodemailer';
import { TrackingOrder } from '../models/TrackingOrder';
import { OrderModel } from '../models/orderModel';
import { UserModel } from '../models/userModel';
import { OrderStatus } from '../types/tracking';
import { logInfo, logError } from '../utils/tracking';
import { RetryService, createRetryService, RETRY_CONFIGS, RetryableOperation } from './RetryService';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class NotificationService {
  private transporter: nodemailer.Transporter;
  private retryService: RetryService;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
    this.retryService = createRetryService(RETRY_CONFIGS.EMAIL);
  }

  /**
   * Send tracking status update notification
   */
  async sendTrackingUpdateNotification(
    order: any, 
    previousStatus: OrderStatus, 
    newStatus: OrderStatus
  ): Promise<void> {
    try {
      const user = await UserModel.findOne({ email: order.customerEmail });
      if (!user) {
        logError(new Error(`User not found for email: ${order.customerEmail}`), 'NotificationService');
        return;
      }

      const emailTemplate = this.getTrackingUpdateTemplate(order, previousStatus, newStatus);
      
      // Create retryable operation for email sending
      const retryableOperation: RetryableOperation<any> = {
        operation: async () => {
          return await this.transporter.sendMail({
            from: process.env.FROM_EMAIL || 'noreply@kynajewels.com',
            to: order.customerEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          });
        },
        operationName: `sendTrackingUpdateNotification-${order.orderNumber}`,
        context: { orderNumber: order.orderNumber, customerEmail: order.customerEmail }
      };

      await this.retryService.executeWithRetry(retryableOperation);

      logInfo(`Tracking update notification sent to ${order.customerEmail} for order ${order.orderNumber}`, 'NotificationService');

    } catch (error) {
      logError(error as Error, 'sendTrackingUpdateNotification');
    }
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShippedNotification(order: any, docketNumber: string): Promise<void> {
    try {
      const user = await UserModel.findById(order.user);
      if (!user) {
        logError(new Error(`User not found for order: ${order.orderNumber}`), 'NotificationService');
        return;
      }

      const emailTemplate = this.getOrderShippedTemplate(order, docketNumber);
      
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@kynajewels.com',
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      logInfo(`Order shipped notification sent to ${user.email} for order ${order.orderNumber}`, 'NotificationService');

    } catch (error) {
      logError(error as Error, 'sendOrderShippedNotification');
    }
  }

  /**
   * Send order delivered notification
   */
  async sendOrderDeliveredNotification(order: any): Promise<void> {
    try {
      const user = await UserModel.findOne({ email: order.customerEmail });
      if (!user) {
        logError(new Error(`User not found for email: ${order.customerEmail}`), 'NotificationService');
        return;
      }

      const emailTemplate = this.getOrderDeliveredTemplate(order);
      
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@kynajewels.com',
        to: order.customerEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      logInfo(`Order delivered notification sent to ${order.customerEmail} for order ${order.orderNumber}`, 'NotificationService');

    } catch (error) {
      logError(error as Error, 'sendOrderDeliveredNotification');
    }
  }

  /**
   * Get tracking update email template
   */
  private getTrackingUpdateTemplate(
    order: any, 
    previousStatus: OrderStatus, 
    newStatus: OrderStatus
  ): EmailTemplate {
    const statusMessages = {
      [OrderStatus.ORDER_PLACED]: 'Order Placed',
      [OrderStatus.PROCESSING]: 'Processing',
      [OrderStatus.PACKAGING]: 'Packaging',
      [OrderStatus.ON_THE_ROAD]: 'On The Road',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'Cancelled'
    };

    const statusDescriptions = {
      [OrderStatus.ORDER_PLACED]: 'Your order has been successfully placed and is being prepared.',
      [OrderStatus.PROCESSING]: 'Your order is being processed and will be ready for shipping soon.',
      [OrderStatus.PACKAGING]: 'Your order is being carefully packaged for shipment.',
      [OrderStatus.ON_THE_ROAD]: 'Your order is on its way to you! Track your package in real-time.',
      [OrderStatus.DELIVERED]: 'Great news! Your order has been successfully delivered.',
      [OrderStatus.CANCELLED]: 'Your order has been cancelled. Please contact support if you have any questions.'
    };

    const subject = `Order ${order.orderNumber} Status Update - ${statusMessages[newStatus]}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: white; border-radius: 8px; margin-top: 20px; }
          .status-badge { 
            display: inline-block; 
            padding: 8px 16px; 
            background: #007bff; 
            color: white; 
            border-radius: 20px; 
            font-weight: bold; 
          }
          .order-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .tracking-link { 
            display: inline-block; 
            background: #28a745; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 15px 0; 
          }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Status Update</h1>
            <p>Your order status has been updated</p>
          </div>
          
          <div class="content">
            <h2>Hello ${order.customerName}!</h2>
            
            <p>Your order <strong>${order.orderNumber}</strong> status has been updated:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="status-badge">${statusMessages[newStatus]}</span>
            </div>
            
            <p>${statusDescriptions[newStatus]}</p>
            
            <div class="order-details">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString()}</p>
              ${order.docketNumber ? `<p><strong>Tracking Number:</strong> ${order.docketNumber}</p>` : ''}
              ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>` : ''}
            </div>
            
            ${order.docketNumber ? `
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/track-order?orderNumber=${order.orderNumber}&email=${order.customerEmail}" 
                   class="tracking-link">
                  Track Your Order
                </a>
              </div>
            ` : ''}
            
            <p>If you have any questions about your order, please don't hesitate to contact our customer support team.</p>
            
            <p>Thank you for choosing Kyna Jewels!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 Kyna Jewels. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Status Update - ${statusMessages[newStatus]}

Hello ${order.customerName}!

Your order ${order.orderNumber} status has been updated to: ${statusMessages[newStatus]}

${statusDescriptions[newStatus]}

Order Details:
- Order Number: ${order.orderNumber}
- Total Amount: ₹${order.totalAmount.toLocaleString()}
${order.docketNumber ? `- Tracking Number: ${order.docketNumber}` : ''}
${order.estimatedDelivery ? `- Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}` : ''}

${order.docketNumber ? `Track your order: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/track-order?orderNumber=${order.orderNumber}&email=${order.customerEmail}` : ''}

If you have any questions, please contact our customer support team.

Thank you for choosing Kyna Jewels!
    `;

    return { subject, html, text };
  }

  /**
   * Get order shipped email template
   */
  private getOrderShippedTemplate(order: any, docketNumber: string): EmailTemplate {
    const subject = `Your Order ${order.orderNumber} Has Been Shipped! 🚚`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Shipped</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e8f5e8; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: white; border-radius: 8px; margin-top: 20px; }
          .shipped-badge { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #28a745; 
            color: white; 
            border-radius: 25px; 
            font-weight: bold; 
            font-size: 18px;
          }
          .tracking-link { 
            display: inline-block; 
            background: #007bff; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Your Order Has Been Shipped!</h1>
            <p>Great news! Your order is on its way to you</p>
          </div>
          
          <div class="content">
            <h2>Hello!</h2>
            
            <p>We're excited to let you know that your order <strong>${order.orderNumber}</strong> has been shipped!</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <span class="shipped-badge">📦 SHIPPED</span>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Shipping Details:</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Tracking Number:</strong> ${docketNumber}</p>
              <p><strong>Courier Service:</strong> Sequel247</p>
              <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/track-order?orderNumber=${order.orderNumber}" 
                 class="tracking-link">
                Track Your Order Now
              </a>
            </div>
            
            <p>You can track your package in real-time using the tracking number above. We'll also send you updates as your package moves through our delivery network.</p>
            
            <p>Thank you for choosing Kyna Jewels!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Your Order Has Been Shipped! 🚚

Hello!

We're excited to let you know that your order ${order.orderNumber} has been shipped!

SHIPPED 📦

Shipping Details:
- Order Number: ${order.orderNumber}
- Tracking Number: ${docketNumber}
- Courier Service: Sequel247
- Shipped Date: ${new Date().toLocaleDateString()}

Track your order: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/track-order?orderNumber=${order.orderNumber}

You can track your package in real-time using the tracking number above.

Thank you for choosing Kyna Jewels!
    `;

    return { subject, html, text };
  }

  /**
   * Get order delivered email template
   */
  private getOrderDeliveredTemplate(order: any): EmailTemplate {
    const subject = `Your Order ${order.orderNumber} Has Been Delivered! 🎉`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Delivered</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d4edda; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: white; border-radius: 8px; margin-top: 20px; }
          .delivered-badge { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #28a745; 
            color: white; 
            border-radius: 25px; 
            font-weight: bold; 
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Delivered Successfully!</h1>
            <p>Your order has reached its destination</p>
          </div>
          
          <div class="content">
            <h2>Hello ${order.customerName}!</h2>
            
            <p>Great news! Your order <strong>${order.orderNumber}</strong> has been successfully delivered!</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <span class="delivered-badge">✅ DELIVERED</span>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Delivery Details:</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Delivered Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString()}</p>
            </div>
            
            <p>We hope you love your new jewelry! If you have any questions or need assistance, please don't hesitate to contact our customer support team.</p>
            
            <p>Thank you for choosing Kyna Jewels!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Delivered Successfully! 🎉

Hello ${order.customerName}!

Great news! Your order ${order.orderNumber} has been successfully delivered!

✅ DELIVERED

Delivery Details:
- Order Number: ${order.orderNumber}
- Delivered Date: ${new Date().toLocaleDateString()}
- Total Amount: ₹${order.totalAmount.toLocaleString()}

We hope you love your new jewelry! If you have any questions, please contact our customer support team.

Thank you for choosing Kyna Jewels!
    `;

    return { subject, html, text };
  }

  /**
   * Send order cancelled notification
   */
  async sendOrderCancelledNotification(order: any): Promise<void> {
    try {
      const user = await UserModel.findById(order.user);
      if (!user) {
        logError(new Error(`User not found for order: ${order.orderNumber}`), 'NotificationService');
        return;
      }

      const emailTemplate = this.getOrderCancelledTemplate(order);
      
      // Create retryable operation for email sending
      const retryableOperation: RetryableOperation<any> = {
        operation: async () => {
          return await this.transporter.sendMail({
            from: process.env.FROM_EMAIL || 'noreply@kynajewels.com',
            to: user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          });
        },
        operationName: `sendOrderCancelledNotification-${order.orderNumber}`,
        context: { orderNumber: order.orderNumber, customerEmail: user.email }
      };

      await this.retryService.executeWithRetry(retryableOperation);

      logInfo(`Order cancelled notification sent to ${user.email} for order ${order.orderNumber}`, 'NotificationService');

    } catch (error) {
      logError(error as Error, 'sendOrderCancelledNotification');
    }
  }

  /**
   * Get order cancelled email template
   */
  private getOrderCancelledTemplate(order: any): EmailTemplate {
    const subject = `Order ${order.orderNumber} Has Been Cancelled`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8d7da; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: white; border-radius: 8px; margin-top: 20px; }
          .cancelled-badge { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #dc3545; 
            color: white; 
            border-radius: 25px; 
            font-weight: bold; 
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Order Cancelled</h1>
            <p>Your order has been cancelled</p>
          </div>
          
          <div class="content">
            <h2>Hello!</h2>
            
            <p>We're sorry to inform you that your order <strong>${order.orderNumber}</strong> has been cancelled.</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <span class="cancelled-badge">❌ CANCELLED</span>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Cancelled Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString()}</p>
            </div>
            
            <p>If you have any questions about this cancellation or would like to place a new order, please don't hesitate to contact our customer support team.</p>
            
            <p>We apologize for any inconvenience caused.</p>
            
            <p>Thank you for your understanding.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Cancelled

Hello!

We're sorry to inform you that your order ${order.orderNumber} has been cancelled.

❌ CANCELLED

Order Details:
- Order Number: ${order.orderNumber}
- Cancelled Date: ${new Date().toLocaleDateString()}
- Total Amount: ₹${order.totalAmount.toLocaleString()}

If you have any questions about this cancellation or would like to place a new order, please contact our customer support team.

We apologize for any inconvenience caused.

Thank you for your understanding.
    `;

    return { subject, html, text };
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logInfo('Email configuration is valid', 'NotificationService');
      return true;
    } catch (error) {
      logError(error as Error, 'testEmailConfiguration');
      return false;
    }
  }
}

export const createNotificationService = (): NotificationService => {
  return new NotificationService();
};
