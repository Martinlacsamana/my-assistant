import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import config from "../config/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const twimlTemplate = readFileSync(join(__dirname, "../templates/twiml.xml"), "utf-8");

export const handleIncomingCall = (req, res) => {
    const wsUrl = new URL(config.publicUrl);
    wsUrl.protocol = "wss:";
    wsUrl.pathname = `/call`;

    const twimlContent = twimlTemplate.replace("{{WS_URL}}", wsUrl.toString());
    res.type("text/xml").send(twimlContent);
};