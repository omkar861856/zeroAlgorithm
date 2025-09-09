import { useEffect, useState } from "react";
import "./App.css";
import { AuthFlow } from "./components/AuthFlow";
import { Dashboard } from "./components/Dashboard";
import { AccessTokenResponse } from "./services/kiteAuth";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenData, setTokenData] = useState<AccessTokenResponse | null>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const savedTokenData = localStorage.getItem("kite_token_data");
    if (savedTokenData) {
      try {
        const parsed = JSON.parse(savedTokenData);
        setTokenData(parsed);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing saved token data:", error);
        localStorage.removeItem("kite_token_data");
      }
    }
  }, []);

  const handleAuthSuccess = (data: AccessTokenResponse) => {
    setTokenData(data);
    setIsAuthenticated(true);
    // Save token data to localStorage (in production, use secure storage)
    localStorage.setItem("kite_token_data", JSON.stringify(data));
  };

  const handleLogout = () => {
    setTokenData(null);
    setIsAuthenticated(false);
    localStorage.removeItem("kite_token_data");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && tokenData ? (
        <Dashboard tokenData={tokenData} onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <AuthFlow onAuthSuccess={handleAuthSuccess} />
        </div>
      )}
    </div>
  );
}

export default App;
