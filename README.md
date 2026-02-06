# Chat App API

A modern, high-performance Chat Application Backend built with Node.js, Express, and TiDB/MySQL. This API provides a solid foundation for real-time messaging, supporting both 1-on-1 and group conversations with a robust security layer and background job processing.

## 🔗 Live Demo
**Render Deployment:** [Render Link](https://node-day-7-api.onrender.com)

---

## ✨ Key Features

- **Advanced Authentication**: 
  - Dual-token system (JWT Access & Refresh tokens).
  - Secure password hashing with Bcrypt.
  - Email verification workflow and token revocation.
- **Rich Messaging**:
  - Support for Direct (1-on-1) and Group chats.
  - Full message history with sender metadata.
  - Dynamic participant management.
- **Robust Background System**:
  - Asynchronous task processing using a custom MySQL-based queue.
  - Automatic email notifications (Verification, Password Changes).
- **Enterprise-Grade Security**:
  - Global rate limiting to prevent DDoS/Brute-force.
  - Standardized error handling and secure JSON response format.
  - CORS-enabled with environment-specific whitelist.
- **Scalable Design**: 
  - Module-based routing and domain-driven architecture.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MySQL / TiDB
- **Key Libraries**:
  - `jsonwebtoken` for secure Auth.
  - `bcrypt` for password security.
  - `nodemailer` & `resend` for email delivery.
  - `concurrently` for running dev environments.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed on your machine.
- A running MySQL or TiDB instance.

### 2. Installation
```bash
git clone https://github.com/Quang-Trung-68/node-day-7-api
cd node-day-7-api
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and configure the following variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `APP_PORT` | Port for the API server | `3000` |
| `APP_URL` | Base URL of your app | `http://localhost:3000` |
| `DB_HOST` | Database server host | `localhost` |
| `DB_USER` | Database username | `root` |
| `DB_PASS` | Database password | `your_password` |
| `DB_NAME` | Database name | `node-day-7` |
| `AUTH_ACCESS_TOKEN_JWT_SECRET` | Secret for Access Tokens | `long-random-string` |
| `AUTH_REFRESH_TOKEN_JWT_SECRET` | Secret for Refresh Tokens | `another-random-string` |

### 4. Database Setup
Ensure your database is created, then run the structural script:
```bash
mysql -u your_user -p node-day-7 < database.sql
```
*Note: The [database.sql](./database.sql) file contains the full schema extracted from the production environment.*

### 5. Running the Application

**Development Mode (Auto-restart):**
```bash
npm run dev
```

**Production Mode (API Server + Queue Worker):**
```bash
npm start
```

**Run Queue Worker Only:**
```bash
npm run queue
```

---

## 📖 API Documentation

### Authentication (`/api/auth`)
- `POST /register`: Create a new account (`email`, `password`).
- `POST /login`: Generate tokens and login (`email`, `password`).
- `POST /refresh-token`: Get a new Access Token using a Refresh Token.
- `GET /me`: Retrieve current user profile (Auth required).
- `POST /verify-email`: Confirm user email using token.
- `POST /change-password`: Update account password (Auth required).

### Conversations (`/api/conversations`)
- `GET /`: List all conversations for the authenticated user.
- `POST /`: Create a new conversation (`name`, `type`, `participant_ids`).
- `POST /:id/participants`: Add a new member to a group chat.
- `GET /:id/messages`: Fetch conversation history.
- `POST /:id/messages`: Send a new message (`content`).

### Users (`/api/users`)
- `GET /search?email=...`: Search for other users to start conversations.

---

## 📁 Project Structure
```text
src/
├── configs/      # Configuration files (DB, Auth, Constants)
├── controllers/  # Request handlers
├── middlewares/  # Auth, Rate Limiting, Error handling
├── models/       # Database queries and logic
├── routes/       # API endpoint definitions
├── services/     # Business logic layer
└── tasks/        # Background job definitions
server.js         # Entry point for API
queue.js          # Entry point for background worker
```

---

## 🛡️ Security Note
All sensitive endpoints are protected by a custom `authRequired` middleware. We use **Rate Limiting** globally to ensure API stability. For production, ensure `CLIENT_URL` in `.env` is set strictly to your frontend domain.
