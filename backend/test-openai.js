/**
 * OpenAI API Test Script
 * 
 * This script tests the connection to the OpenAI API using the provided API key.
 * It sends a simple request and logs the response to verify that the API key works.
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

async function testOpenAI() {
  console.log('\x1b[34mTesting OpenAI API connection...\x1b[0m');
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant named Jarvis." },
        { role: "user", content: "Hello, who are you?" }
      ],
      max_tokens: 50,
    });
    
    const response = completion.choices[0].message.content;
    
    console.log('\x1b[32mSuccess! API connection is working.\x1b[0m');
    console.log('\x1b[36mResponse from OpenAI:\x1b[0m', response);
    console.log('\n\x1b[32mYour personal assistant is ready to use!\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mError connecting to OpenAI API:\x1b[0m', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\nPlease check that your API key is correct in the .env file.');
    } else if (error.message.includes('network')) {
      console.log('\nPlease check your internet connection and try again.');
    } else {
      console.log('\nPlease check the OpenAI API status and try again later.');
    }
  }
}

testOpenAI();
