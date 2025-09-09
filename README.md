# Zerodha Kite Connect Authentication UI

A modern React application that implements the complete Zerodha Kite Connect API authentication flow with a beautiful, user-friendly interface.

## Features

- **Complete Authentication Flow**: Implements the full Zerodha Kite Connect OAuth flow
- **Modern UI**: Clean, responsive design with step-by-step progress indicators
- **Secure Token Management**: Handles request token exchange and access token storage
- **Dashboard**: Post-authentication dashboard showing user information and session details
- **Error Handling**: Comprehensive error handling and user feedback

## Authentication Flow

1. **Configuration**: Enter your API key and secret
2. **Login**: Redirect to Zerodha's secure login page
3. **Callback**: Process the request token from the redirect
4. **Success**: Display access token and user information

## Prerequisites

- Zerodha Kite Connect API Key and Secret
- Configured redirect URL in your Kite Connect application settings

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure your API credentials:

   ```bash
   # Copy the example environment file
   cp env.example .env

   # Edit .env and add your API credentials
   KITE_API_KEY=your_actual_api_key_here
   KITE_API_SECRET=your_actual_api_secret_here
   ```

3. Configure your redirect URL in Zerodha Kite Connect app settings:

   ```
   http://localhost:5173/auth/callback
   ```

4. Start both frontend and backend servers:

   ```bash
   npm run dev:full
   ```

   Or start them separately:

   ```bash
   # Terminal 1: Start backend server
   npm run server:dev

   # Terminal 2: Start frontend
   npm run dev
   ```

## API Configuration

The application requires you to provide your own API credentials:

- **API Key**: Enter your API key in the configuration step
- **API Secret**: Enter your secret in the configuration step
- **Redirect URL**: `http://localhost:5173/auth/callback`

## Security Notes

- Access tokens are stored in localStorage (use secure storage in production)
- Tokens expire in 24 hours and require daily re-authentication
- API secret is stored securely in backend environment variables
- Backend proxy handles CORS issues with Kite Connect API

## Architecture

The application uses a two-tier architecture to handle CORS restrictions:

- **Frontend (React)**: Handles UI and user interaction
- **Backend (Express)**: Proxies API requests to avoid CORS issues

This is necessary because Zerodha's Kite Connect API doesn't allow direct browser requests due to CORS policy restrictions.

## Usage

1. Open the application in your browser
2. Enter your API key and secret in the configuration step
3. Click "Login with Zerodha" to start the authentication flow
4. Complete the login on Zerodha's website
5. You'll be redirected back with your access token
6. Use the dashboard to view your session information and access token

## API Integration

After successful authentication, use the access token in your API requests:

```javascript
const headers = {
  Authorization: `token ${accessToken}`,
  "Content-Type": "application/json",
};

fetch("https://api.kite.trade/orders", { headers })
  .then((response) => response.json())
  .then((data) => console.log(data));
```

## Available Endpoints

- `/orders` - Order management
- `/portfolio` - Portfolio information
- `/positions` - Current positions
- `/instruments` - Available instruments
- `/profile` - User profile information

## Technologies Used

- React 19
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- CryptoJS (SHA-256 hashing)
- Vite (build tool)
