import dotenv from "dotenv";
dotenv.config();

export default {
  port: parseInt(process.env.PORT || "3001", 10),
  publicUrl: process.env.PUBLIC_URL || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
};