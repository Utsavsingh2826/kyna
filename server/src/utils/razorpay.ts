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

// Payment method limits in INR
export const PAYMENT_METHOD_LIMITS = {
  upi: 100000, // ₹1,00,000
  wallet: 100000, // ₹1,00,000 (KYC merchants)
  paylater: 60000, // ₹60,000 (highest among paylater options)
  netbanking: 500000, // ₹5,00,000
  cards: Infinity // No limit
} as const;

// Default Razorpay transaction limit
export const DEFAULT_MAX_AMOUNT = 500000; // ₹5,00,000

/**
 * Validate payment amount against Razorpay limits
 */
export function validatePaymentAmount(amount: number): {
  isValid: boolean;
  error?: string;
  recommendedMethods?: string[];
  exceededMethods?: string[];
} {
  const amountNum = parseFloat(amount.toString());
  
  if (isNaN(amountNum) || amountNum <= 0) {
    return {
      isValid: false,
      error: 'Amount must be a positive number'
    };
  }

  // Check against default limit
  if (amountNum > DEFAULT_MAX_AMOUNT) {
    return {
      isValid: false,
      error: `Amount exceeds maximum limit of ₹${DEFAULT_MAX_AMOUNT}`,
      recommendedMethods: ['netbanking', 'cards']
    };
  }

  // Check payment method specific limits
  const exceededMethods = Object.entries(PAYMENT_METHOD_LIMITS)
    .filter(([method, limit]) => amountNum > limit)
    .map(([method]) => method);

  const recommendedMethods = Object.entries(PAYMENT_METHOD_LIMITS)
    .filter(([method, limit]) => amountNum <= limit)
    .map(([method]) => method);

  return {
    isValid: true,
    exceededMethods,
    recommendedMethods
  };
}