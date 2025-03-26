/**
 * OpenAI Service
 * 
 * This service handles all interactions with the OpenAI API,
 * including managing threads and messages for the assistant.
 */

const { OpenAI } = require('openai');
const config = require('../config/env');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

// Store active threads by user (in memory for simplicity)
// In a production app, you would use a database
const userThreads = new Map();

/**
 * Create a new thread
 * @returns {Promise<string>} The thread ID
 */
async function createThread() {
  const thread = await openai.beta.threads.create();
  return thread.id;
}

/**
 * Get or create a thread for a user
 * @param {string} userId - The user ID
 * @returns {Promise<string>} The thread ID
 */
async function getOrCreateThreadForUser(userId) {
  if (!userThreads.has(userId)) {
    const threadId = await createThread();
    userThreads.set(userId, threadId);
  }
  return userThreads.get(userId);
}

/**
 * Wait for a run to complete
 * @param {string} threadId - The thread ID
 * @param {string} runId - The run ID
 * @returns {Promise<object>} The completed run
 */
async function waitForRunCompletion(threadId, runId) {
  let run = await openai.beta.threads.runs.retrieve(threadId, runId);
  
  // Poll for status change
  while (run.status === 'queued' || run.status === 'in_progress') {
    // Wait for a second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
  }
  
  if (run.status === 'completed') {
    return run;
  } else {
    throw new Error(`Run ended with status: ${run.status}`);
  }
}

/**
 * Process a user message and get a response from the assistant
 * @param {string} message - The user's message
 * @param {string} userId - The user ID
 * @returns {Promise<object>} The assistant's response and thread ID
 */
async function processMessage(message, userId = 'default-user') {
  // Ensure we have an assistant ID
  if (!config.OPENAI_ASSISTANT_ID) {
    throw new Error('OPENAI_ASSISTANT_ID is not set in the environment variables');
  }
  
  // Get or create a thread for this user
  const threadId = await getOrCreateThreadForUser(userId);
  
  // Add the user's message to the thread
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message
  });
  
  // Create a run with the assistant
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: config.OPENAI_ASSISTANT_ID
  });
  
  // Wait for the run to complete
  await waitForRunCompletion(threadId, run.id);
  
  // Get the latest messages (including the assistant's response)
  const messages = await openai.beta.threads.messages.list(threadId);
  
  // Find the most recent assistant message
  const assistantMessages = messages.data
    .filter(msg => msg.role === 'assistant')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  if (assistantMessages.length === 0) {
    throw new Error('No assistant response found');
  }
  
  // Get the content of the latest assistant message
  const latestMessage = assistantMessages[0];
  const messageContent = latestMessage.content[0].text.value;
  
  return {
    response: messageContent,
    threadId: threadId
  };
}

/**
 * Get an assistant by ID
 * @param {string} assistantId - The assistant ID
 * @returns {Promise<object>} The assistant
 */
async function getAssistant(assistantId) {
  return await openai.beta.assistants.retrieve(assistantId);
}

module.exports = {
  processMessage,
  getAssistant,
  getOrCreateThreadForUser
};
