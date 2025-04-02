import { WebSocketServer } from "ws";
import { handleCallConnection, handleFrontendConnection } from "./sessionManager.js";

export function setupWebSocket(server, openaiApiKey) {
  const wss = new WebSocketServer({ server });
  let currentCall = null;
  let currentLogs = null;

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length < 1) {
      ws.close();
      return;
    }

    const type = parts[0];

    if (type === "call") {
      if (currentCall) currentCall.close();
      currentCall = ws;
      handleCallConnection(currentCall, openaiApiKey);
    } else if (type === "logs") {
      if (currentLogs) currentLogs.close();
      currentLogs = ws;
      handleFrontendConnection(currentLogs);
    } else {
      ws.close();
    }
  });
}