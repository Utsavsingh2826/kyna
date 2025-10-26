import axios, { AxiosInstance } from 'axios';
import { TrackingOrder } from '../models/TrackingOrder';
import { OrderStatus } from '../types/tracking';
import { logInfo, logError } from '../utils/tracking';

export interface WebhookPayload {
  event: string;
  orderNumber: string;
  status: OrderStatus;
  previousStatus?: OrderStatus;
  timestamp: string;
  data: {
    order: any;
    tracking: any;
  };
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  retryAttempts: number;
  timeout: number;
}

export class WebhookService {
  private client: AxiosInstance;
  private config: WebhookConfig;

  constructor(config: WebhookConfig) {
    this.config = config;
    this.client = axios.create({
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KynaJewels-Webhook/1.0'
      }
    });
  }

  /**
   * Send webhook for tracking status change
   */
  async sendTrackingStatusChange(
    order: any, 
    previousStatus: OrderStatus, 
    newStatus: OrderStatus
  ): Promise<void> {
    if (!this.config.events.includes('tracking.status_change')) {
      return;
    }

    const payload: WebhookPayload = {
      event: 'tracking.status_change',
      orderNumber: order.orderNumber,
      status: newStatus,
      previousStatus: previousStatus,
      timestamp: new Date().toISOString(),
      data: {
        order: {
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          totalAmount: order.totalAmount,
          status: newStatus,
          docketNumber: order.docketNumber,
          estimatedDelivery: order.estimatedDelivery,
          trackingHistory: order.trackingHistory
        },
        tracking: {
          currentStatus: newStatus,
          previousStatus: previousStatus,
          progress: this.calculateProgress(newStatus),
          lastUpdated: new Date().toISOString()
        }
      }
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send webhook for order shipped
   */
  async sendOrderShipped(order: any, docketNumber: string): Promise<void> {
    if (!this.config.events.includes('order.shipped')) {
      return;
    }

    const payload: WebhookPayload = {
      event: 'order.shipped',
      orderNumber: order.orderNumber,
      status: OrderStatus.ON_THE_ROAD,
      timestamp: new Date().toISOString(),
      data: {
        order: {
          orderNumber: order.orderNumber,
          status: 'shipped',
          docketNumber: docketNumber,
          shippedAt: new Date().toISOString(),
          courierService: 'Sequel247'
        },
        tracking: {
          docketNumber: docketNumber,
          status: OrderStatus.ON_THE_ROAD,
          courierService: 'Sequel247'
        }
      }
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send webhook for order delivered
   */
  async sendOrderDelivered(order: any): Promise<void> {
    if (!this.config.events.includes('order.delivered')) {
      return;
    }

    const payload: WebhookPayload = {
      event: 'order.delivered',
      orderNumber: order.orderNumber,
      status: OrderStatus.DELIVERED,
      timestamp: new Date().toISOString(),
      data: {
        order: {
          orderNumber: order.orderNumber,
          status: 'delivered',
          deliveredAt: new Date().toISOString(),
          docketNumber: order.docketNumber
        },
        tracking: {
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date().toISOString()
        }
      }
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send webhook for order cancelled
   */
  async sendOrderCancelled(order: any): Promise<void> {
    if (!this.config.events.includes('order.cancelled')) {
      return;
    }

    const payload: WebhookPayload = {
      event: 'order.cancelled',
      orderNumber: order.orderNumber,
      status: OrderStatus.CANCELLED,
      timestamp: new Date().toISOString(),
      data: {
        order: {
          orderNumber: order.orderNumber,
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        },
        tracking: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date().toISOString()
        }
      }
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send webhook with retry logic
   */
  private async sendWebhook(payload: WebhookPayload, attempt: number = 1): Promise<void> {
    try {
      const signature = this.generateSignature(JSON.stringify(payload));
      
      await this.client.post(this.config.url, payload, {
        headers: {
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Timestamp': payload.timestamp
        }
      });

      logInfo(`Webhook sent successfully for event ${payload.event} (attempt ${attempt})`, 'WebhookService');

    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        logError(new Error(`Webhook attempt ${attempt} failed, retrying...`), 'WebhookService');
        await this.delay(1000 * attempt); // Exponential backoff
        await this.sendWebhook(payload, attempt + 1);
      } else {
        logError(new Error(`Webhook failed after ${this.config.retryAttempts} attempts`), 'WebhookService');
        throw error;
      }
    }
  }

  /**
   * Generate webhook signature for security
   */
  private generateSignature(payload: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.config.secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Calculate progress percentage based on status
   */
  private calculateProgress(status: OrderStatus): number {
    const statusProgressMap: Record<OrderStatus, number> = {
      [OrderStatus.ORDER_PLACED]: 10,
      [OrderStatus.PROCESSING]: 25,
      [OrderStatus.PACKAGING]: 40,
      [OrderStatus.IN_TRANSIT]: 60,
      [OrderStatus.ON_THE_ROAD]: 75,
      [OrderStatus.DELIVERED]: 100,
      [OrderStatus.CANCELLED]: 0
    };

    return statusProgressMap[status] || 0;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test webhook configuration
   */
  async testWebhook(): Promise<boolean> {
    try {
      const testPayload: WebhookPayload = {
        event: 'webhook.test',
        orderNumber: 'TEST123',
        status: OrderStatus.ORDER_PLACED,
        timestamp: new Date().toISOString(),
        data: {
          order: { test: true },
          tracking: { test: true }
        }
      };

      await this.sendWebhook(testPayload);
      return true;
    } catch (error) {
      logError(error as Error, 'testWebhook');
      return false;
    }
  }
}

export const createWebhookService = (config: WebhookConfig): WebhookService => {
  return new WebhookService(config);
};
