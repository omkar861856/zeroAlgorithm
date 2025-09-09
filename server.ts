import cors from "cors";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kite Connect configuration
const KITE_CONFIG = {
  apiKey: process.env.KITE_API_KEY || "", // Set this in .env file
  apiSecret: process.env.KITE_API_SECRET || "", // Set this in .env file
};

// Generate checksum for API request
function generateChecksum(
  apiKey: string,
  requestToken: string,
  apiSecret: string
): string {
  const data = apiKey + requestToken + apiSecret;
  return CryptoJS.SHA256(data).toString();
}

// Token exchange endpoint
app.post("/api/exchange-token", async (req, res) => {
  try {
    const { request_token, api_secret } = req.body;

    console.log("Received request:", {
      request_token: request_token ? "present" : "missing",
      api_secret: api_secret ? "present" : "missing",
      api_secret_length: api_secret ? api_secret.length : 0,
    });

    if (!request_token) {
      return res.status(400).json({ error: "Request token is required" });
    }

    if (!api_secret) {
      return res.status(400).json({ error: "API secret is required" });
    }

    // Generate checksum using the API secret from request body
    const checksum = generateChecksum(
      KITE_CONFIG.apiKey,
      request_token,
      api_secret
    );

    // Make request to Kite Connect API
    const response = await fetch("https://api.kite.trade/session/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        api_key: KITE_CONFIG.apiKey,
        request_token: request_token,
        checksum: checksum,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Kite API Error:", response.status, errorText);
      return res.status(response.status).json({
        error: `Token exchange failed: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Kite Connect Proxy Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Kite Connect Proxy Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/exchange-token`);
  console.log(`🔑 Make sure to set KITE_API_SECRET in .env file`);
});
