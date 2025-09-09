import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Key,
  Loader2,
  Shield,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { AccessTokenResponse, kiteAuthService } from "../services/kiteAuth";

interface AuthFlowProps {
  onAuthSuccess: (tokenData: AccessTokenResponse) => void;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState<"config" | "login" | "callback" | "success">(
    "config"
  );
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [requestToken, setRequestToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<AccessTokenResponse | null>(null);

  // Check for request token in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("request_token");
    if (token) {
      setRequestToken(token);
      setStep("callback");
    }

    // Restore API credentials from localStorage if available
    const savedApiKey = localStorage.getItem("kite_api_key");
    const savedApiSecret = localStorage.getItem("kite_api_secret");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      kiteAuthService.updateApiKey(savedApiKey);
      console.log("Restored API key from localStorage");
    }
    if (savedApiSecret) {
      setApiSecret(savedApiSecret);
      kiteAuthService.updateApiSecret(savedApiSecret);
      console.log("Restored API secret from localStorage");
    }
  }, []);

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("API Key is required");
      return;
    }
    if (!apiSecret.trim()) {
      setError("API Secret is required");
      return;
    }
    setError(null);
    // Update the API credentials in the service and store them locally
    kiteAuthService.updateApiKey(apiKey);
    kiteAuthService.updateApiSecret(apiSecret);
    localStorage.setItem("kite_api_key", apiKey);
    localStorage.setItem("kite_api_secret", apiSecret);
    setStep("login");
  };

  const handleLogin = () => {
    try {
      const loginUrl = kiteAuthService.generateLoginUrl();
      console.log("Generated login URL:", loginUrl);
      window.location.href = loginUrl;
    } catch (err) {
      setError("Failed to generate login URL");
    }
  };

  const handleTokenExchange = async () => {
    if (!requestToken) {
      setError("No request token found");
      return;
    }

    console.log("Starting token exchange:", {
      request_token: requestToken ? "present" : "missing",
      api_secret_in_service: kiteAuthService.getConfig().apiSecret
        ? "present"
        : "missing",
      api_secret_length: kiteAuthService.getConfig().apiSecret
        ? kiteAuthService.getConfig().apiSecret.length
        : 0,
    });

    setLoading(true);
    setError(null);

    try {
      const response = await kiteAuthService.authenticate(requestToken);
      setTokenData(response);
      setStep("success");
      onAuthSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token exchange failed");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("config");
    setApiKey("");
    setApiSecret("");
    setRequestToken("");
    setError(null);
    setTokenData(null);
    // Clear stored API credentials
    localStorage.removeItem("kite_api_key");
    localStorage.removeItem("kite_api_secret");
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Zerodha Kite Connect
        </h1>
        <p className="text-gray-600 mt-2">Secure API Authentication Flow</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {["config", "login", "callback", "success"].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName
                    ? "bg-blue-600 text-white"
                    : ["config", "login", "callback", "success"].indexOf(step) >
                      index
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={`w-16 h-1 ${
                    ["config", "login", "callback", "success"].indexOf(step) >
                    index
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Step 1: Configuration */}
      {step === "config" && (
        <div className="space-y-6">
          <div className="text-center">
            <Key className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              API Configuration
            </h2>
            <p className="text-gray-600">
              Enter your Zerodha Kite Connect API credentials to begin
              authentication
            </p>
          </div>

          <form onSubmit={handleConfigSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from Zerodha Kite Connect app settings
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret *
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your API secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URL
              </label>
              <input
                type="text"
                value={kiteAuthService.getConfig().redirectUrl}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Configure this URL in your Kite Connect app
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue to Login
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Login */}
      {step === "login" && (
        <div className="text-center space-y-6">
          <div>
            <ExternalLink className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Redirect to Zerodha
            </h2>
            <p className="text-gray-600 mb-6">
              You will be redirected to Zerodha's secure login page to
              authenticate your account
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• You'll be redirected to Zerodha's login page</li>
              <li>• Enter your Zerodha credentials</li>
              <li>• Authorize the application access</li>
              <li>• You'll be redirected back with a request token</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-900 mb-2">
              Important: Configure Redirect URL
            </h3>
            <p className="text-sm text-yellow-800 mb-2">
              Make sure this redirect URL is configured in your Zerodha Kite
              Connect app:
            </p>
            <code className="text-sm text-yellow-900 bg-yellow-100 px-2 py-1 rounded">
              {kiteAuthService.getConfig().redirectUrl}
            </code>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Login with Zerodha
          </button>

          <button
            onClick={resetFlow}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Configuration
          </button>
        </div>
      )}

      {/* Step 3: Callback */}
      {step === "callback" && (
        <div className="text-center space-y-6">
          <div>
            <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Processing Authentication
            </h2>
            <p className="text-gray-600 mb-6">
              We received your request token. Click below to exchange it for an
              access token.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Request Token</h3>
            <code className="text-sm text-gray-700 break-all">
              {requestToken}
            </code>
          </div>

          <button
            onClick={handleTokenExchange}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Exchanging Token...
              </>
            ) : (
              "Exchange for Access Token"
            )}
          </button>

          <button
            onClick={resetFlow}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Step 4: Success */}
      {step === "success" && tokenData && (
        <div className="text-center space-y-6">
          <div>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully authenticated with Zerodha Kite Connect
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-left">
            <h3 className="font-medium text-green-900 mb-4">
              Session Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-green-800">User:</span>
                <span className="text-green-700 ml-2">
                  {tokenData.user_name}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-800">User ID:</span>
                <span className="text-green-700 ml-2">{tokenData.user_id}</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Email:</span>
                <span className="text-green-700 ml-2">{tokenData.email}</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Broker:</span>
                <span className="text-green-700 ml-2">{tokenData.broker}</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Login Time:</span>
                <span className="text-green-700 ml-2">
                  {new Date(tokenData.login_time).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Access Token</h3>
            <code className="text-sm text-blue-800 break-all">
              {tokenData.access_token}
            </code>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">
              Important Notes
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1 text-left">
              <li>• Access token is valid for 24 hours</li>
              <li>• Store the token securely</li>
              <li>• Use this token for all API requests</li>
              <li>• Re-authenticate daily to get a new token</li>
            </ul>
          </div>

          <button
            onClick={resetFlow}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Authenticate Again
          </button>
        </div>
      )}
    </div>
  );
};
