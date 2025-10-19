import crypto from 'crypto';

/**
 * CCAvenue Payment Gateway Utility Functions
 * Handles encryption and decryption for CCAvenue payment integration
 */

export interface CCAvenueConfig {
  merchantId: string;
  accessCode: string;
  workingKey: string;
  paymentUrl: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: string;
  currency: string;
  billingName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  billingTel: string;
  billingEmail: string;
  redirectUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  encryptedData: string;
  accessCode: string;
  orderId: string;
}

/**
 * Encrypts payment parameters using AES-128-CBC encryption
 * @param plainText - The plain text to encrypt
 * @param workingKey - CCAvenue working key
 * @returns Encrypted string
 */
export const encrypt = (plainText: string, workingKey: string): string => {
  try {
    // Create a 32-byte key by hashing the working key with MD5
    const key = crypto.createHash('md5').update(workingKey).digest();
    
    // Create a random 16-byte IV
    const iv = crypto.randomBytes(16);
    
    // Create cipher with IV
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    cipher.setAutoPadding(true);
    
    // Encrypt the data
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend IV to encrypted data
    const encryptedWithIv = iv.toString('hex') + encrypted;
    
    return encryptedWithIv;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt payment data');
  }
};

/**
 * Decrypts CCAvenue response using AES-128-CBC decryption
 * @param encryptedText - The encrypted text to decrypt
 * @param workingKey - CCAvenue working key
 * @returns Decrypted string
 */
export const decrypt = (encryptedText: string, workingKey: string): string => {
  try {
    // Create a 32-byte key by hashing the working key with MD5
    const key = crypto.createHash('md5').update(workingKey).digest();
    
    // Extract IV (first 32 characters) and encrypted data
    const iv = Buffer.from(encryptedText.substring(0, 32), 'hex');
    const encrypted = encryptedText.substring(32);
    
    // Create decipher with IV
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    decipher.setAutoPadding(true);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt payment response');
  }
};

/**
 * Creates a query string from payment parameters
 * @param params - Payment parameters object
 * @returns URL-encoded query string
 */
export const createQueryString = (params: PaymentRequest): string => {
  const queryParams = new URLSearchParams();
  
  queryParams.append('merchant_id', process.env.CCAVENUE_MERCHANT_ID || '');
  queryParams.append('order_id', params.orderId);
  queryParams.append('amount', params.amount);
  queryParams.append('currency', params.currency);
  queryParams.append('redirect_url', params.redirectUrl);
  queryParams.append('cancel_url', params.cancelUrl);
  queryParams.append('billing_name', params.billingName);
  queryParams.append('billing_address', params.billingAddress);
  queryParams.append('billing_city', params.billingCity);
  queryParams.append('billing_state', params.billingState);
  queryParams.append('billing_zip', params.billingZip);
  queryParams.append('billing_country', params.billingCountry);
  queryParams.append('billing_tel', params.billingTel);
  queryParams.append('billing_email', params.billingEmail);
  
  return queryParams.toString();
};

/**
 * Validates CCAvenue callback response
 * @param response - Decrypted response from CCAvenue
 * @returns Parsed and validated response object
 */
export const validateCallbackResponse = (response: string): any => {
  try {
    const params = new URLSearchParams(response);
    
    const callbackData = {
      orderId: params.get('order_id'),
      trackingId: params.get('tracking_id'),
      bankRefNo: params.get('bank_ref_no'),
      orderStatus: params.get('order_status'),
      failureMessage: params.get('failure_message'),
      paymentMode: params.get('payment_mode'),
      cardName: params.get('card_name'),
      statusCode: params.get('status_code'),
      statusMessage: params.get('status_message'),
      currency: params.get('currency'),
      amount: params.get('amount'),
      billingName: params.get('billing_name'),
      billingAddress: params.get('billing_address'),
      billingCity: params.get('billing_city'),
      billingState: params.get('billing_state'),
      billingZip: params.get('billing_zip'),
      billingCountry: params.get('billing_country'),
      billingTel: params.get('billing_tel'),
      billingEmail: params.get('billing_email'),
      deliveryName: params.get('delivery_name'),
      deliveryAddress: params.get('delivery_address'),
      deliveryCity: params.get('delivery_city'),
      deliveryState: params.get('delivery_state'),
      deliveryZip: params.get('delivery_zip'),
      deliveryCountry: params.get('delivery_country'),
      deliveryTel: params.get('delivery_tel'),
      merchantParam1: params.get('merchant_param1'),
      merchantParam2: params.get('merchant_param2'),
      merchantParam3: params.get('merchant_param3'),
      merchantParam4: params.get('merchant_param4'),
      merchantParam5: params.get('merchant_param5'),
      vault: params.get('vault'),
      offerType: params.get('offer_type'),
      offerCode: params.get('offer_code'),
      discountValue: params.get('discount_value'),
      merAmount: params.get('mer_amount'),
      eciValue: params.get('eci_value'),
      retry: params.get('retry'),
      responseCode: params.get('response_code'),
      transDate: params.get('trans_date')
    };
    
    return callbackData;
  } catch (error) {
    console.error('Callback validation error:', error);
    throw new Error('Failed to validate callback response');
  }
};

/**
 * Gets CCAvenue configuration from environment variables
 * @returns CCAvenue configuration object
 */
export const getCCAvenueConfig = (): CCAvenueConfig => {
  const config = {
    merchantId: process.env.CCAVENUE_MERCHANT_ID || '',
    accessCode: process.env.CCAVENUE_ACCESS_CODE || '',
    workingKey: process.env.CCAVENUE_WORKING_KEY || '',
    paymentUrl: process.env.CCAVENUE_PAYMENT_URL || 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
  };
  
  // Validate required configuration
  if (!config.merchantId || !config.accessCode || !config.workingKey) {
    throw new Error('Missing required CCAvenue configuration. Please check your environment variables.');
  }
  
  return config;
};
