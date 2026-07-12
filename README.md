# 🚀 ProTime - Productivity & Study Companion

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38B2AC.svg)](https://tailwindcss.com/)

ProTime is a comprehensive, full-stack productivity and study companion platform designed to help users manage their time, tasks, and study sessions effectively. It features study rooms, a buddy matching system, real-time chat, gamification, and more.

## ✨ Features

- **🔐 Authentication:** Secure JWT-based authentication with Google OAuth integration.
- **📊 Dashboard:** Personalized user dashboard with Recharts-powered analytics.
- **📝 To-Do & Calendar:** Advanced task management and calendar integration.
- **📚 Study Rooms:** Real-time collaborative study rooms powered by Socket.io.
- **🤝 Buddy Match:** Find and match with study buddies based on your goals.
- **💬 Real-time Chat:** Direct messaging and community chat capabilities.
- **🏆 Gamification:** Earn points, level up, and climb the leaderboard as you study.
- **🔔 Notifications:** Real-time push notifications for events and messages.
- **💳 Premium Features:** Stripe integration for premium subscriptions.
- **🛠️ Admin Panel:** Comprehensive admin dashboard to manage users and platform data.

## 📸 Screenshots
*(Add your project screenshots here)*

<details>
<summary>Click to view screenshots</summary>

| Dashboard | Study Room |
| --- | --- |
| <img src="client/public/images/logo.png" width="400" alt="Dashboard Placeholder"> | <img src="client/public/images/logo.png" width="400" alt="Study Room Placeholder"> |

*(Replace the `logo.png` paths above with actual screenshot paths like `client/public/screenshots/dashboard.png`)*
</details>

## 💻 Tech Stack

### Frontend (Client)
- **Framework:** React 19 + Vite
- **Architecture:** Feature-Based
- **Language:** TypeScript
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS v4, Framer Motion
- **Routing:** React Router v7
- **Forms & Validation:** React Hook Form, Zod
- **Real-time:** Socket.io-client
- **Data Visualization:** Recharts

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express
- **Architecture:** Clean Architecture
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose)
- **Caching:** Redis (via ioredis)
- **Real-time:** Socket.io
- **File Storage:** Cloudinary
- **Payments:** Stripe
- **Emails:** Nodemailer
- **Dependency Injection:** Tsyringe

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Deployment Ready:** Vercel config included for frontend

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas URI)
- [Redis](https://redis.io/download)
- [Docker](https://www.docker.com/) (Optional, for running backend via containers)

### Environment Variables

You need to create `.env` files in both the `client` and `server` directories. Use the existing `.env` files as a reference, or configure them according to your external services.

**Client (`client/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Server (`server/.env`):**
Required variables include database connection strings, JWT secrets, Stripe keys, Cloudinary credentials, and Email config.
```env
PORT=5000
DATABASE_URI=mongodb://localhost:27017/appprotime
JWT_ACCESS_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
CLIENT_URI=http://localhost:5174
...
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd projectTwo
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application (Local Development)

**1. Start the Backend Server:**
```bash
cd server
npm run dev
```

**2. Start the Frontend Client:**
```bash
cd client
npm run dev
```

The frontend will usually be accessible at `http://localhost:5173` (or `5174` depending on Vite).

### Running with Docker

The backend is configured to run easily with Docker Compose.

```bash
docker-compose up --build
```
This will start the `protime-backend` container on port `5000`.

## 📂 Project Structure

```text
protime/
├── client/                 # React Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # API communication logic
│   │   ├── features/       # Feature-based module architecture (auth, chat, study-rooms, etc.)
│   │   ├── store/          # Redux store configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── shared/         # Shared components and utilities
│   │   └── App.tsx         # Main application component
│   └── vite.config.ts      # Vite configuration
│
├── server/                 # Node.js/Express Backend
│   ├── src/
│   │   ├── infrastructure/ # DB config, logger, external services
│   │   └── ...             # Controllers, Services, Models
│   ├── Dockerfile          # Docker configuration for backend
│   └── package.json
│
├── docker-compose.yml      # Orchestration for backend services
└── README.md
```

## 📜 Scripts

### Client Scripts
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds for production.
- `npm run lint`: Runs ESLint to check for code issues.

### Server Scripts
- `npm run dev`: Starts the development server using `ts-node-dev` with hot-reloading.
- `npm run build`: Compiles TypeScript into JavaScript in the `dist` directory.
- `npm run start`: Runs the compiled JavaScript application.
- `npm run lint`: Runs ESLint for the backend.
- `npm run format`: Formats code using Prettier.

## 📄 License
This project is licensed under the ISC License.
