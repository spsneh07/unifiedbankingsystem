# 🏛️ NexusBank — Unified Banking System

> A production-ready, full-stack Next.js banking application demonstrating secure authentication, atomic database transactions, role-based access control, and a dynamic, responsive UI.

![NexusBank Dashboard](public/screenshot.png)

---

## 📖 Project Overview

**NexusBank** is a comprehensive banking platform built to handle secure financial operations. It features three distinct portals (Customer, Employee, and Admin), all served from a unified architecture.

This project was engineered with a primary focus on **Security** and **Data Integrity**, implementing industry-standard defenses against race conditions (Atomic MySQL Transactions), XSS, CSRF, and session hijacking.

## ✨ Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and capabilities for Customers, Employees, and Admins.
- **Secure Authentication:** HMAC-SHA256 signed, HttpOnly session cookies with bcrypt password hashing. Next.js server-side proxy middleware prevents unauthorized access.
- **Atomic Transactions:** Transfer and withdrawal systems utilize MySQL `SELECT ... FOR UPDATE` row-level locks, ensuring concurrent requests cannot overdraw an account (zero race conditions).
- **Automated Fraud Detection:** Transactions exceeding 3× an account's historical average are automatically flagged as suspicious for manual review.
- **Mock OTP Flow:** Fully functional server-side One Time Password generation (5-minute TTL) for sensitive operations.
- **Responsive UI/UX:** Built with modern CSS (glassmorphism, micro-animations with Framer Motion), dark mode support, and loading skeletons for layout shift prevention.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Components)
- **Styling:** Vanilla CSS, TailwindCSS (for utility classes)
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Server:** Node.js / Express.js
- **Database:** MySQL 8.0
- **Security:** Helmet, express-rate-limit, bcrypt, crypto (HMAC)

---

## 🏗️ Architecture

The application uses a hybrid architecture:
1. **Next.js Frontend (Port 3000):** Handles all UI rendering, client state, and route protection via `proxy.ts`. API calls are forwarded to the backend.
2. **Express Backend (Port 5000):** Acts as the secure API gateway and business logic handler. Manages database connections, rate-limiting, and OTP generation.
3. **MySQL Database:** Stores normalized relational data (users, accounts, transactions, loans, credit scores).

---

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)

### 1. Database Setup
Ensure your local MySQL server is running on port 3306.

### 2. Environment Variables
Create `.env.local` in the root directory (for Next.js):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Create `.env` in the `backend/` directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=banking_db
PORT=5000
SESSION_SECRET=a_very_long_and_secure_random_session_secret_12345
```

### 3. Install Dependencies
Install dependencies for both the frontend and backend:
```bash
# In the root directory (Frontend)
npm install

# In the backend directory
cd backend
npm install
```

### 4. Initialize Database
Run the seed script to create tables and demo data (this drops existing tables if they exist):
```bash
cd backend
node db/initDb.js

# Note: The seed script uses plaintext passwords. You MUST run the patch script to hash them via Bcrypt:
node db/patchPasswords.js
```

### 5. Start Servers
You will need two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
# In the root directory
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🔑 Demo Credentials

You can easily log in to the platform using the **"Login as Demo"** buttons on the login page, or manually use:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@nexusbank.com` | `admin` |
| **Employee** | `employee@nexusbank.com` | `employee123` |
| **Customer** | `customer@nexusbank.com` | `password` |

---

## 🔒 Security Implementation Details

1. **Session Handling:** Next.js frontend uses a `SessionProvider` React context to safely load session data without hydration mismatch errors.
2. **Proxy Routing:** Next.js `proxy.ts` (formerly `middleware.ts`) intercepts unauthorized users before React even boots, securely reading the `ub_role` cookie.
3. **Row-Level Locking:** `transactionsController.js` uses `conn.beginTransaction()` and `FOR UPDATE` to lock rows. 
4. **Rate Limiting:** Global rate limit (100 req/15min) with strict limits on auth endpoints (10 req/min).

---

## 📦 Production Deployment

### Building the Frontend
```bash
npm run build
```
This prepares the `.next/` optimized output. Ensure `next.config.js` is correctly configured for your hosting environment (e.g., standalone output for Docker, or standard for Vercel).

### Hosting
- **Frontend:** Can be deployed seamlessly to [Vercel](https://vercel.com).
- **Backend:** Can be deployed to Render, Railway, or an AWS EC2 instance. Ensure the `PORT` env var is utilized.
- **Database:** Deploy MySQL to AWS RDS, PlanetScale, or a DigitalOcean Managed Database. Update the backend `.env` variables accordingly.

---

## 📄 License
This project is for demonstration and portfolio purposes. 
