/**
 * Environment Configuration
 * 
 * This module loads and validates environment variables used throughout the application.
 */

require('dotenv').config();

// Required environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];

// Check for required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`\x1b[31mError: ${envVar} is not set in the .env file\x1b[0m`);
    process.exit(1);
  }
}

module.exports = {
  PORT: process.env.PORT || 3001,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
