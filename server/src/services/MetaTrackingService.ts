import axios from 'axios';
import crypto from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID || '1562132752582015';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

/**
 * Hashing helper for PII (Personally Identifiable Information)
 * Meta requires data to be SHA-256 hashed
 */
export const hashData = (data: string): string => {
  if (!data) return '';
  return crypto
    .createHash('sha256')
    .update(data.trim().toLowerCase())
    .digest('hex');
};

export const sendMetaEvent = async ({
  eventName,
  eventId,
  userData = {},
  customData = {},
}: {
  eventName: string;
  eventId: string;
  userData?: any;
  customData?: any;
}) => {
  if (!ACCESS_TOKEN) {
    console.warn('⚠️ Meta Access Token not found. Skipping CAPI event.');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        user_data: {
          ...userData,
          client_user_agent: userData.client_user_agent || 'Server API',
          client_ip_address: userData.client_ip_address,
        },
        custom_data: customData,
      },
    ],
    access_token: ACCESS_TOKEN,
    ...(process.env.META_TEST_EVENT_CODE && {
      test_event_code: process.env.META_TEST_EVENT_CODE,
    }),
  };

  try {
    const response = await axios.post(url, payload);
    console.log(`✅ Meta CAPI Event Sent: ${eventName}`, response.data);
  } catch (error: any) {
    console.error('❌ Meta CAPI Error:', error.response?.data || error.message);
  }
};
