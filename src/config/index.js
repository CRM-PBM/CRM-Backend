require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'crmumkm',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  },
  watzap: {
    apiUrl: process.env.WATZAP_API_URL || 'https://api.watzap.id/v1',
    apiKey: process.env.WATZAP_API_KEY,
    numberKey: process.env.WATZAP_NUMBER_KEY
  },
  broadcast: {
    rateLimit: parseInt(process.env.BROADCAST_RATE_LIMIT) || 10,
    delayMs: parseInt(process.env.BROADCAST_DELAY_MS) || 1000
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-this',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  }
};
