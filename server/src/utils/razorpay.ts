import Razorpay from 'razorpay';
import crypto from 'crypto';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
  }
  
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === signature;
}

export function createOrderPayload(amount: number, currency = 'INR', receipt?: string) {
  // Razorpay expects amount in paise (INR * 100)
  return {
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt || `rcpt_${Date.now()}`
  };
}
