import * as CryptoJS from "crypto-js";

export interface KiteConfig {
  apiKey: string;
  apiSecret: string;
  redirectUrl: string;
}

export interface AccessTokenResponse {
  status: string;
  data: {
    access_token: string;
    login_time: string;
    public_token: string;
    user_id: string;
    user_name: string;
    user_shortname: string;
    user_type: string;
    email: string;
    broker: string;
    exchanges: string[];
    products: string[];
    order_types: string[];
    avatar_url: string;
    api_key: string;
    enctoken: string;
    refresh_token: string;
    meta: {
      demat_consent: string;
    };
  };
}

export class KiteAuthService {
  private config: KiteConfig;

  constructor(config: KiteConfig) {
    this.config = config;
  }

  /**
   * Update the API key
   */
  updateApiKey(apiKey: string): void {
    console.log("Updating API key:", {
      old_key: this.config.apiKey ? "present" : "missing",
      new_key: apiKey ? "present" : "missing",
      new_length: apiKey ? apiKey.length : 0,
    });
    this.config.apiKey = apiKey;
    console.log("API key updated:", {
      current_key: this.config.apiKey ? "present" : "missing",
      current_length: this.config.apiKey ? this.config.apiKey.length : 0,
    });
  }

  /**
   * Update the API secret
   */
  updateApiSecret(apiSecret: string): void {
    console.log("Updating API secret:", {
      old_secret: this.config.apiSecret ? "present" : "missing",
      new_secret: apiSecret ? "present" : "missing",
      new_length: apiSecret ? apiSecret.length : 0,
    });
    this.config.apiSecret = apiSecret;
    console.log("API secret updated:", {
      current_secret: this.config.apiSecret ? "present" : "missing",
      current_length: this.config.apiSecret ? this.config.apiSecret.length : 0,
    });
  }

  /**
   * Get the current configuration
   */
  getConfig(): KiteConfig {
    return this.config;
  }

  /**
   * Generate the login URL for Zerodha Kite Connect
   */
  generateLoginUrl(): string {
    if (!this.config.apiKey) {
      throw new Error("API Key is required to generate login URL");
    }
    if (!this.config.apiSecret) {
      throw new Error("API Secret is required to generate login URL");
    }

    const baseUrl = "https://kite.zerodha.com/connect/login";
    const params = new URLSearchParams({
      v: "3",
      api_key: this.config.apiKey,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Extract request token from URL
   */
  extractRequestToken(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("request_token");
    } catch (error) {
      console.error("Error extracting request token:", error);
      return null;
    }
  }

  /**
   * Generate checksum for API request
   */
  private generateChecksum(requestToken: string): string {
    const data = this.config.apiKey + requestToken + this.config.apiSecret;
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Exchange request token for access token via backend proxy
   */
  async exchangeToken(requestToken: string): Promise<AccessTokenResponse> {
    const requestBody = {
      request_token: requestToken,
      api_secret: this.config.apiSecret,
    };

    console.log("Sending request to backend:", {
      request_token: requestToken ? "present" : "missing",
      api_secret: this.config.apiSecret ? "present" : "missing",
      api_secret_length: this.config.apiSecret
        ? this.config.apiSecret.length
        : 0,
    });

    const response = await fetch("http://localhost:3001/api/exchange-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Token exchange failed: ${response.status} ${
          errorData.error || errorData.details
        }`
      );
    }

    const tokenData = await response.json();

    // Send access token to webhook
    await this.sendToWebhook(tokenData);

    return tokenData;
  }

  /**
   * Send access token data to webhook
   */
  private async sendToWebhook(tokenData: AccessTokenResponse): Promise<void> {
    const webhookUrl =
      "https://n8n.srv832532.hstgr.cloud/webhook/b4111c9f-a38a-495f-9537-4cb28954996b";

    try {
      console.log("Sending access token to webhook:", webhookUrl);

      const webhookPayload = {
        access_token: tokenData.data.access_token,
        user_id: tokenData.data.user_id,
        user_name: tokenData.data.user_name,
        email: tokenData.data.email,
        broker: tokenData.data.broker,
        login_time: tokenData.data.login_time,
        api_key: tokenData.data.api_key,
        public_token: tokenData.data.public_token,
        exchanges: tokenData.data.exchanges,
        products: tokenData.data.products,
        order_types: tokenData.data.order_types,
        timestamp: new Date().toISOString(),
        source: "zerodha-algo-app",
      };

      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        console.log("✅ Access token successfully sent to webhook");
      } else {
        console.warn(
          "⚠️ Webhook request failed:",
          webhookResponse.status,
          webhookResponse.statusText
        );
      }
    } catch (error) {
      console.error("❌ Failed to send access token to webhook:", error);
      // Don't throw error - webhook failure shouldn't break the main flow
    }
  }

  /**
   * Complete authentication flow
   */
  async authenticate(requestToken: string): Promise<AccessTokenResponse> {
    if (!requestToken) {
      throw new Error("Request token is required");
    }

    return await this.exchangeToken(requestToken);
  }

  /**
   * Validate if access token is still valid (basic check)
   */
  isTokenValid(accessToken: string): boolean {
    // Basic validation - in production, you might want to make an API call
    return accessToken && accessToken.length > 0;
  }
}

// Default configuration - API credentials should be provided by the user
export const defaultKiteConfig: KiteConfig = {
  apiKey: "", // This should be provided by the user
  apiSecret: "", // This should be provided by the user
  redirectUrl:
    typeof window !== "undefined"
      ? window.location.origin + "/auth/callback"
      : "http://localhost:5173/auth/callback",
};

export const kiteAuthService = new KiteAuthService(defaultKiteConfig);
