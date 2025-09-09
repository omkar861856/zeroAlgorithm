# 🚀 Quick Start Guide

## ✅ CORS Issue Fixed!

The CORS error you encountered has been resolved by creating a backend proxy server.

## 🔧 Setup Steps:

### 1. Configure Your API Credentials

```bash
# Edit the .env file and replace the placeholders with your actual API credentials
nano .env
```

Update these values in your `.env` file:

```
KITE_API_KEY=your_actual_api_key_here
KITE_API_SECRET=your_actual_api_secret_here
```

### 2. Update Zerodha App Settings

- Go to [Kite Connect Developer Console](https://kite.trade/connect/login)
- Find your app using your API key
- Update the redirect URL to: `http://localhost:5173/auth/callback`

### 3. Start Both Servers

```bash
# This will start both frontend and backend
npm run dev:full
```

Or start them separately:

```bash
# Terminal 1: Backend server (port 3001)
npm run server:dev

# Terminal 2: Frontend (port 5173)
npm run dev
```

## 🎯 What's Fixed:

- ✅ **CORS Error**: Backend proxy handles API requests
- ✅ **Token Exchange**: Now works through backend server
- ✅ **Security**: API secret stored in environment variables
- ✅ **Architecture**: Two-tier system (React + Express)

## 🔍 Testing:

1. Open `http://localhost:5173`
2. Enter your API key and secret
3. Click "Login with Zerodha"
4. Complete authentication on Zerodha's site
5. You'll be redirected back with a request token
6. The token will be exchanged for an access token via the backend

## 📡 Server Endpoints:

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001/api/exchange-token`
- **Health Check**: `http://localhost:3001/api/health`

The authentication flow should now work completely without CORS errors!
