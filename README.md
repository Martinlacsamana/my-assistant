# Personal Voice Assistant

A mobile-friendly personal voice assistant web application with speech recognition and text-to-speech capabilities. This application allows you to have a conversation with an AI assistant using your voice.

## Features

- 🎤 Voice input through microphone
- 🔊 Text-to-speech responses
- 📱 Mobile-friendly interface
- 💬 Conversation history display
- 🌓 Light/dark mode support
- 🧠 AI-powered responses

## Project Structure

The project is organized into two main parts:

### Frontend (Next.js)

- Built with Next.js, TypeScript, and Tailwind CSS
- Uses the Web Speech API for speech recognition and text-to-speech
- Responsive design optimized for mobile devices

### Backend (Node.js)

- Express.js server
- OpenAI integration for generating responses
- RESTful API for handling conversation

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- OpenAI API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd personal-voice-assistant
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following content:

```
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

#### Testing the OpenAI API connection

After setting up your API key, you can test the connection to OpenAI:

```bash
cd backend
npm run test-openai
```

This will verify that your API key is working correctly before running the full application.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Start the application

You can start both the frontend and backend servers with a single command from the root directory:

```bash
npm run dev
```

Or start them individually:

Backend server:
```bash
npm run backend
```

Frontend development server:
```bash
npm run frontend
```

For a fresh installation of all dependencies:
```bash
npm run install-all
```

### 5. Access the application

Open your browser and navigate to:

```
http://localhost:3000
```

For the best experience on mobile, use your local network IP address instead of localhost, for example:

```
http://192.168.1.100:3000
```

## Usage

1. Open the application in a browser (preferably on a mobile device)
2. Tap the microphone button to start speaking
3. Ask a question or give a command
4. Listen to the assistant's response
5. Continue the conversation as needed

## Browser Compatibility

This application uses the Web Speech API, which has varying levels of support across browsers:

- Chrome/Edge: Full support
- Firefox: Partial support
- Safari: Partial support
- Mobile browsers: Varies by device and browser

## Development

### Running in development mode

The application includes a mock API mode for development without requiring the backend. To enable it, set `useMockApi` to `true` in the `VoiceAssistant.tsx` component.

### Building for production

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
npm run start
```

## License

[MIT License](LICENSE)

## Acknowledgements

- OpenAI for the AI capabilities
- Next.js team for the frontend framework
- Web Speech API for speech recognition and synthesis
