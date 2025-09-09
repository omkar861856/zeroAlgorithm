import {
  Activity,
  CheckCircle,
  Copy,
  DollarSign,
  LogOut,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { AccessTokenResponse } from "../services/kiteAuth";

interface DashboardProps {
  tokenData: AccessTokenResponse;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tokenData,
  onLogout,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "token") {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const sendToWebhook = async () => {
    const webhookUrl =
      "https://n8n.srv832532.hstgr.cloud/webhook/b4111c9f-a38a-495f-9537-4cb28954996b";

    setWebhookStatus("sending");

    try {
      console.log("Manually sending access token to webhook:", webhookUrl);

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
        source: "zerodha-algo-app-manual",
      };

      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        console.log("✅ Access token successfully sent to webhook manually");
        setWebhookStatus("success");
        setTimeout(() => setWebhookStatus("idle"), 3000);
      } else {
        console.warn(
          "⚠️ Manual webhook request failed:",
          webhookResponse.status,
          webhookResponse.statusText
        );
        setWebhookStatus("error");
        setTimeout(() => setWebhookStatus("idle"), 3000);
      }
    } catch (error) {
      console.error(
        "❌ Failed to send access token to webhook manually:",
        error
      );
      setWebhookStatus("error");
      setTimeout(() => setWebhookStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Zerodha Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {tokenData.data.user_name}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Authentication Successful!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  You have successfully authenticated with Zerodha Kite Connect.
                </p>
                <p className="mt-1">
                  ✅ Access token has been automatically sent to your webhook
                  endpoint.
                </p>
                <p className="mt-1">
                  📡 You can also send it manually using the button below.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {tokenData.data.user_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {tokenData.data.user_name}
                </h2>
                <p className="text-gray-600">{tokenData.data.email}</p>
                <p className="text-sm text-gray-500">
                  User ID: {tokenData.data.user_id}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Broker</p>
              <p className="font-medium text-gray-900">
                {tokenData.data.broker}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Available Balance
                </p>
                <p className="text-2xl font-semibold text-gray-900">₹0.00</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Portfolio Value
                </p>
                <p className="text-2xl font-semibold text-gray-900">₹0.00</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's P&L</p>
                <p className="text-2xl font-semibold text-gray-900">₹0.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Session Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Session Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Access Token</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-800 break-all">
                    {tokenData.data.access_token}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(tokenData.data.access_token, "token")
                    }
                    className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {copiedToken ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This access token is valid for 24 hours. Store it securely for
                API requests.
              </p>
              <div className="mt-4">
                <button
                  onClick={sendToWebhook}
                  disabled={webhookStatus === "sending"}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                    webhookStatus === "sending"
                      ? "bg-gray-400 cursor-not-allowed"
                      : webhookStatus === "success"
                      ? "bg-green-600 hover:bg-green-700"
                      : webhookStatus === "error"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {webhookStatus === "sending" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : webhookStatus === "success" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sent Successfully!
                    </>
                  ) : webhookStatus === "error" ? (
                    <>
                      <div className="h-4 w-4 mr-2">❌</div>
                      Send Failed
                    </>
                  ) : (
                    <>
                      <div className="h-4 w-4 mr-2">📡</div>
                      Send to Webhook
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Manually send access token to your webhook endpoint
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Session Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Login Time:</span>
                  <span className="text-gray-900">
                    {new Date(tokenData.data.login_time).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User Type:</span>
                  <span className="text-gray-900">
                    {tokenData.data.user_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Public Token:</span>
                  <span className="text-gray-900">
                    {tokenData.data.public_token}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Key:</span>
                  <span className="text-gray-900 font-mono">
                    {tokenData.data.api_key}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Features */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Exchanges</h4>
              <div className="flex flex-wrap gap-2">
                {tokenData.data.exchanges.map((exchange) => (
                  <span
                    key={exchange}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {exchange}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Products</h4>
              <div className="flex flex-wrap gap-2">
                {tokenData.data.products.map((product) => (
                  <span
                    key={product}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Types */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Order Types
          </h3>
          <div className="flex flex-wrap gap-2">
            {tokenData.data.order_types.map((orderType) => (
              <span
                key={orderType}
                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {orderType}
              </span>
            ))}
          </div>
        </div>

        {/* Raw Response (Collapsible) */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <details className="group">
            <summary className="cursor-pointer text-lg font-semibold text-gray-900 mb-4">
              Raw API Response
            </summary>
            <div className="mt-4">
              <pre className="bg-gray-50 rounded-lg p-4 overflow-auto text-sm text-gray-800">
                {JSON.stringify(tokenData, null, 2)}
              </pre>
            </div>
          </details>
        </div>

        {/* API Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            API Usage Instructions
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              • Use the access token in the Authorization header:{" "}
              <code>Authorization: token {tokenData.data.access_token}</code>
            </p>
            <p>• Token expires in 24 hours - re-authenticate daily</p>
            <p>
              • All API requests should be made to:{" "}
              <code>https://api.kite.trade</code>
            </p>
            <p>
              • Available endpoints: /orders, /portfolio, /positions,
              /instruments, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
