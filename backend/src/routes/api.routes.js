/**
 * API Routes
 * 
 * This module defines the API routes for the application.
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Chat routes
router.post('/chat', chatController.processChat);
router.get('/assistant', chatController.getAssistantInfo);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
