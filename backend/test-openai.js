/**
 * OpenAI Assistants API Test Script
 * 
 * This script tests the connection to the OpenAI API using the provided API key.
 * It verifies the Assistant ID if provided, or creates a new Assistant.
 * Then it creates a thread, adds a message, and runs the assistant to get a response.
 * 
 * Usage: node test-openai.js
 */

require('dotenv').config();
const { OpenAI } = require('openai');

// Check if API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('\x1b[31mError: OPENAI_API_KEY is not set in the .env file\x1b[0m');
  console.log('Please add your OpenAI API key to the .env file:');
  console.log('OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testAssistantsAPI() {
  console.log('\x1b[34mTesting OpenAI Assistants API connection...\x1b[0m');
  
  try {
    // Step 1: Check or create an assistant
    let assistantId = process.env.OPENAI_ASSISTANT_ID;
    
    if (!assistantId) {
      console.log('No assistant ID found in .env file. Creating a new assistant...');
      
      const assistant = await openai.beta.assistants.create({
        name: "Personal Voice Assistant",
        instructions: "You are a helpful personal assistant named Jarvis. Be concise but friendly in your responses.",
        model: "gpt-3.5-turbo",
      });
      
      assistantId = assistant.id;
      console.log(`\x1b[32mCreated new assistant with ID: ${assistantId}\x1b[0m`);
      console.log('Add this ID to your .env file as OPENAI_ASSISTANT_ID=', assistantId);
    } else {
      // Verify the assistant exists
      try {
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        console.log(`\x1b[32mFound existing assistant: ${assistant.name} (${assistantId})\x1b[0m`);
      } catch (error) {
        if (error.status === 404) {
          console.error(`\x1b[31mError: Assistant with ID ${assistantId} not found.\x1b[0m`);
          console.log('Please create a new assistant or update the ID in your .env file.');
          process.exit(1);
        } else {
          throw error;
        }
      }
    }
    
    // Step 2: Create a thread
    console.log('Creating a test thread...');
    const thread = await openai.beta.threads.create();
    console.log(`\x1b[32mCreated thread with ID: ${thread.id}\x1b[0m`);
    
    // Step 3: Add a message to the thread
    console.log('Adding a test message to the thread...');
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'Hello, who are you?'
    });
    
    // Step 4: Run the assistant
    console.log('Running the assistant...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });
    
    // Step 5: Wait for the run to complete
    console.log('Waiting for the assistant to respond...');
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      // Wait for a second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      process.stdout.write('.');
    }
    
    console.log('\nRun completed with status:', runStatus.status);
    
    if (runStatus.status === 'completed') {
      // Step 6: Get the assistant's response
      const messages = await openai.beta.threads.messages.list(thread.id);
      
      // Find the most recent assistant message
      const assistantMessages = messages.data
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      if (assistantMessages.length > 0) {
        const response = assistantMessages[0].content[0].text.value;
        console.log('\x1b[32mSuccess! Assistants API is working.\x1b[0m');
        console.log('\x1b[36mResponse from Assistant:\x1b[0m', response);
        console.log('\n\x1b[32mYour personal assistant is ready to use!\x1b[0m');
      } else {
        console.error('\x1b[31mNo assistant response found.\x1b[0m');
      }
    } else {
      console.error(`\x1b[31mRun ended with unexpected status: ${runStatus.status}\x1b[0m`);
    }
  } catch (error) {
    console.error('\x1b[31mError testing Assistants API:\x1b[0m', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\nPlease check that your API key is correct in the .env file.');
    } else if (error.message.includes('network')) {
      console.log('\nPlease check your internet connection and try again.');
    } else {
      console.log('\nPlease check the OpenAI API status and try again later.');
    }
  }
}

testAssistantsAPI();
