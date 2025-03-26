/**
 * Main Application Entry Point
 * 
 * This is the main entry point for the backend application.
 * It sets up the Express server, middleware, and routes.
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const apiRoutes = require('./routes/api.routes');
const { errorHandler, notFound } = require('./utils/error-handler');

// Initialize Express app
const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Check if assistant ID is configured
  if (!config.OPENAI_ASSISTANT_ID) {
    console.log('\x1b[33mWARNING: OPENAI_ASSISTANT_ID is not set in .env file.\x1b[0m');
    console.log('You need to create an assistant in the OpenAI playground and add its ID to your .env file.');
  } else {
    console.log(`Using OpenAI Assistant with ID: ${config.OPENAI_ASSISTANT_ID}`);
  }
});
