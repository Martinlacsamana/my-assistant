/**
 * Chat Controller
 * 
 * This controller handles chat-related requests, including
 * processing user messages and getting responses from the assistant.
 */

const openaiService = require('../services/openai.service');

/**
 * Process a chat message and get a response from the assistant
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function processChat(req, res) {
  try {
    const { message, userId = 'default-user', threadId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        success: false
      });
    }
    
    // Process the message and get a response
    const result = await openaiService.processMessage(message, userId);
    
    res.json({
      response: result.response,
      threadId: result.threadId,
      success: true
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
      success: false
    });
  }
}

/**
 * Get information about the assistant
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function getAssistantInfo(req, res) {
  try {
    const { OPENAI_ASSISTANT_ID } = require('../config/env');
    
    if (!OPENAI_ASSISTANT_ID) {
      return res.status(400).json({
        error: 'OPENAI_ASSISTANT_ID is not set in the environment variables',
        success: false
      });
    }
    
    const assistant = await openaiService.getAssistant(OPENAI_ASSISTANT_ID);
    
    res.json({
      assistant: {
        id: assistant.id,
        name: assistant.name,
        model: assistant.model,
        created_at: assistant.created_at
      },
      success: true
    });
  } catch (error) {
    console.error('Error getting assistant info:', error);
    res.status(500).json({
      error: 'Failed to get assistant info',
      details: error.message,
      success: false
    });
  }
}

module.exports = {
  processChat,
  getAssistantInfo
};
