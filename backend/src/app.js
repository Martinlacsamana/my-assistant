import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { setupWebSocket } from "./services/websocket.js";
import callRoutes from "./routes/callRoutes.js";
import config from "./config/index.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use("/", callRoutes);

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
if (!config.openaiApiKey) {
  console.error("OPENAI_API_KEY environment variable is required");
  process.exit(1);
}
setupWebSocket(server, config.openaiApiKey);

// Start server
server.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

export default server;