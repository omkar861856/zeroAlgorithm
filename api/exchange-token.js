import CryptoJS from "crypto-js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { request_token, api_secret, api_key } = req.body;

    console.log("Received request:", {
      request_token: request_token ? "present" : "missing",
      api_secret: api_secret ? "present" : "missing",
      api_key: api_key ? "present" : "missing",
      api_secret_length: api_secret ? api_secret.length : 0,
      api_key_length: api_key ? api_key.length : 0,
    });

    if (!request_token) {
      return res.status(400).json({ error: "Request token is required" });
    }

    if (!api_secret) {
      return res.status(400).json({ error: "API secret is required" });
    }

    if (!api_key) {
      return res.status(400).json({ error: "API key is required" });
    }

    // Generate checksum using the API secret from request body
    const checksum = generateChecksum(api_key, request_token, api_secret);

    // Make request to Kite Connect API
    const response = await fetch("https://api.kite.trade/session/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        api_key: api_key,
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
}

// Generate checksum for API request
function generateChecksum(apiKey, requestToken, apiSecret) {
  const data = apiKey + requestToken + apiSecret;
  return CryptoJS.SHA256(data).toString();
}
