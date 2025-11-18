require('dotenv').config();

// import cron
const startCleanupCron = require('./src/cron/CleanupLogs');

// Bootstrap the application from src/app.js
const app = require('./src/app');
const { port } = require('./src/config');
const logger = require('./src/utils/logger');

// start cron
startCleanupCron();

const server = app.listen(port, () => {
  logger.info(`CRM Backend listening on port ${port}`);
});

process.on('SIGINT', () => {
  logger.info('Shutting down...');
  server.close(() => process.exit(0));
});