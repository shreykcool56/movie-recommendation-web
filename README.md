# CineVerse - Movie Recommendation Web & Mobile Application

CineVerse is a premium movie discovery and recommendation platform featuring a dynamic, modern web application, an Express-based backend API, and a mobile application client service.

## 🌟 Features

- **Personalized Recommendations**: Advanced movie discovering algorithms based on user preferences.
- **Robust Authentication**: Secure RSA key-pair JWT-signed auth system featuring OTP-based registration and profile management.
- **Premium Upgrades**: Sleek premium pricing tier components, subscription options, and mock integration support.
- **Cross-Platform Syncing**: Keep track of your watchlists seamlessly across the React web app and the mobile interface.
- **Beautiful & Modern UI**: Built with rich aesthetics, glassmorphism elements, smooth micro-animations, and dynamic transitions.

## 📁 Repository Structure

```
├── src/                  # React Frontend (Vite)
│   ├── components/       # AuthModal, Profile, Movie Detail Sheets, Watchlist, Onboarding, etc.
│   ├── store/            # Redux State Management (auth slices)
│   ├── services/         # API integration services
│   └── index.css         # Theme config & global styling
├── backend/              # Node.js/Express Backend API
│   ├── db/               # SQLite database client & migrations
│   ├── middleware/       # JWT Authentication middleware
│   ├── routes/           # Auth, syncing, and billing routes
│   └── server.js         # Entry point
└── mobile/               # Mobile Application codebase
    └── services/         # API integrations & local secure store utilities
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS/Vanilla CSS, Redux Toolkit, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, JWT (RSA-2048 signing), SQLite3
- **Mobile Services**: React Native compatible API helper scripts and local SecureStore managers

## 🚀 Setup & Execution

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Install Dependencies
Run the installation command in both the root directory and backend directory:

```bash
# Install frontend packages
npm install

# Install backend packages
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables
Create a `.env` file in the root or `backend` folders if custom configurations are required (the server runs on port `5000` by default).

### 3. Run the Application
You can launch both the frontend client and the backend server concurrently using:

```bash
npm run dev
```

- **Frontend client** runs on: `http://localhost:5173` (or the next available port)
- **Backend API** runs on: `http://localhost:5000`

---

## 🔒 Security Note
Security keys for JWT signing (`private.pem` and `public.pem`) are dynamically generated on the fly inside the `backend/keys/` directory when starting the backend server for the first time. They are ignored by Git version control to ensure safety.

## 📄 License
This project is private and proprietary. All rights reserved.
