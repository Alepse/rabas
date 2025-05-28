# Rabas Project

## Project Description
This project is a web-based platform designed to connect tourists with tourism business owners in Bicol, Sorsogon, Philippines. It provides essential travel needs and information, including features such as a Trip Planner, chat system, feedback system, and booking system. The platform also includes a business profile management system, service and product management system, and booking management system for tourism-related businesses.

## Tech Stack

**Frontend:**
- React
- Vite
- Tailwind CSS
- NextUI
- Redux Toolkit
- Axios
- Chart.js & React Chart.js 2
- React Router DOM
- Framer Motion
- Leaflet & React Leaflet
- Embla Carousel
- SweetAlert2
- Swiper
- Date-fns
- React Icons
- React Toastify
- React Multi Date Picker
- React Slick & Slick Carousel
- Dompurify
- Crypto-js
- Lucide React
- Other supporting React libraries and plugins

**Backend:**
- Node.js
- Express
- MySQL (mysql2)
- Express Session & Express MySQL Session
- Passport (including Google OAuth 2.0)
- Nodemailer
- Multer
- dotenv
- bcrypt & bcryptjs
- CORS
- JSON Web Token (jsonwebtoken)
- Sharp
- Node-RSA
- ws (WebSocket)
- Other supporting Node.js libraries

## Directory Structure
```
./
├── frontend/
│   ├── src/
│   ├── public/
│   ├── dist/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── ...
├── backend/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── ...
├── node_modules/
├── package.json
└── ...
```

## Installation Guide

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL (for backend)

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend directory with the following placeholders:
   ```env
   VITE_SECRET_KEY=
   VITE_BASE_URL=
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory with the following placeholders:
   ```env
   ORIGIN_CORS_ORIGIN=
   NODE_ENV=
   BASE_URL_LOCAL=
   BASE_URL_PRODUCTION=
   BASE_URL_STAGING=
   REDIRECTION_URL_LOCAL=
   REDIRECTION_URL_PRODUCTION=
   REDIRECTION_URL_STAGING=
   DB_HOST=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   SESSION_DB_HOST=
   SESSION_DB_USER=
   SESSION_DB_PASSWORD=
   SESSION_DB_NAME=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GMAIL_USER=
   GMAIL_PASS=
   ```
   > **Note:** Do not include sensitive information in your `.env` file if sharing it publicly.
4. Start the server:
   ```bash
   npm run dev
   ```

## Authors
- Jestoni Vargas
- Kenneth Espela 