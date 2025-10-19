declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      MONGO_URI: string;
      JWT_SECRET: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;
      EMAIL_USER: string;
      EMAIL_PASS: string;
      EMAIL_FROM: string;
      EMAIL_SECURE: string;
      CCAVENUE_MERCHANT_ID: string;
      CCAVENUE_ACCESS_CODE: string;
      CCAVENUE_WORKING_KEY: string;
      CCAVENUE_PAYMENT_URL: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
      SEQUEL247_TEST_ENDPOINT: string;
      SEQUEL247_TEST_TOKEN: string;
      SEQUEL247_PROD_ENDPOINT: string;
      SEQUEL247_PROD_TOKEN: string;
      SEQUEL247_STORE_CODE: string;
      CLIENT_URL: string;
      FRONTEND_URL: string;
      FROM_EMAIL: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
    }
  }
}

export {};
