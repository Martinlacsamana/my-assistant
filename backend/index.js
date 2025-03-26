const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store active threads by user (in memory for simplicity)
// In a production app, you would use a database
const userThreads = new Map();

// Assistant ID (create one in OpenAI dashboard or via API)
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// Helper function to create a new thread
async function createThread() {
  const thread = await openai.beta.threads.create();
  return thread.id;
}

// Helper function to get or create a thread for a user
async function getOrCreateThreadForUser(userId) {
  if (!userThreads.has(userId)) {
    const threadId = await createThread();
    userThreads.set(userId, threadId);
  }
  return userThreads.get(userId);
}

// Helper function to wait for run completion
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

// Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = 'default-user' } = req.body;
    
    // Get or create a thread for this user
    const threadId = await getOrCreateThreadForUser(userId);
    
    // Add the user's message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });
    
    // Create a run with the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID
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
    
    res.json({ 
      response: messageContent,
      threadId: threadId,
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
});

// Create a new assistant if ASSISTANT_ID is not provided
app.post('/api/create-assistant', async (req, res) => {
  try {
    if (ASSISTANT_ID) {
      return res.json({ 
        assistantId: ASSISTANT_ID,
        message: 'Using existing assistant ID from environment variables',
        success: true 
      });
    }
    
    const assistant = await openai.beta.assistants.create({
      name: "Personal Voice Assistant",
      instructions: "You are a helpful personal assistant named Jarvis. Be concise but friendly in your responses. You should provide helpful, accurate, and engaging responses to user queries.",
      model: "gpt-3.5-turbo",
    });
    
    console.log(`Created new assistant with ID: ${assistant.id}`);
    
    res.json({ 
      assistantId: assistant.id,
      message: 'New assistant created successfully. Add this ID to your .env file as OPENAI_ASSISTANT_ID',
      success: true 
    });
  } catch (error) {
    console.error('Error creating assistant:', error);
    res.status(500).json({ 
      error: 'Failed to create assistant', 
      details: error.message,
      success: false 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Check if assistant ID is configured
  if (!ASSISTANT_ID) {
    console.log('\x1b[33mWARNING: OPENAI_ASSISTANT_ID is not set in .env file.\x1b[0m');
    console.log('You can create a new assistant by making a POST request to /api/create-assistant');
    console.log('Then add the returned assistant ID to your .env file as OPENAI_ASSISTANT_ID');
  } else {
    console.log(`Using OpenAI Assistant with ID: ${ASSISTANT_ID}`);
  }
});
