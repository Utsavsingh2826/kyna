declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;
    JWT_COOKIE_SECURE?: string;
    EMAIL_HOST?: string;
    EMAIL_PORT?: string;
    EMAIL_USER?: string;
    EMAIL_PASS?: string;
    EMAIL_FROM?: string;
    OTP_EXPIRY_MINUTES?: string;
    RESET_TOKEN_EXPIRY_HOURS?: string;
    BCRYPT_SALT_ROUNDS?: string;
  }
}
