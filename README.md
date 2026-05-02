# NexusBank — Unified Banking System

A full-stack banking application with separated **Frontend** (Next.js) and **Backend** (Express + MySQL) architecture.

---

## 📁 Project Structure

```
unifiedbankingsystem/
├── backend/                    # Express API Server
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── accountsController.js
│   │   ├── transactionsController.js
│   │   ├── dashboardController.js
│   │   ├── customersController.js
│   │   ├── alertsController.js
│   │   ├── loansController.js
│   │   ├── creditCardsController.js
│   │   ├── creditScoreController.js
│   │   ├── analyticsController.js
│   │   ├── scheduledController.js
│   │   └── branchesController.js
│   ├── routes/                 # Express route definitions
│   ├── db/                     # Database connection & init
│   ├── middleware/             # Auth middleware
│   ├── server.js              # Entry point
│   ├── .env                   # Backend environment
│   └── package.json
│
├── app/                        # Next.js Frontend (pages)
│   ├── (customer)/            # Customer views
│   ├── admin/                 # Admin views
│   ├── employee/              # Employee views
│   ├── auth/                  # Auth pages (login)
│   └── branches/              # Branch locator
│
├── components/                 # React UI components
├── lib/                        # Frontend utilities
│   ├── utils.ts               # formatCurrency, maskAccountNo
│   ├── auth.ts                # Session management
│   └── api.ts                 # API helper (points to backend)
│
├── next.config.js             # Proxies /api/* to Express backend
├── .env.local                 # Frontend environment
└── package.json               # Frontend dependencies
```

---

## 🚀 Getting Started

### 1. Initialize Database

```bash
cd backend
npm install
node db/initDb.js
```

### 2. Start Backend (Express API — Port 5000)

```bash
cd backend
node server.js
```

### 3. Start Frontend (Next.js — Port 3000)

```bash
# From root directory
npm run dev
```

### 4. Open

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔐 Default Credentials

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@nexusbank.com      | admin       |
| Customer | customer@nexusbank.com   | password    |
| Employee | employee@nexusbank.com   | employee123 |

---

## 🔌 API Endpoints

All API routes are served from the Express backend on port 5000:

| Method | Endpoint               | Description                |
|--------|------------------------|----------------------------|
| POST   | /api/auth/login        | User login                 |
| POST   | /api/auth/signup       | User registration          |
| POST   | /api/auth/forgot-password | Request password reset  |
| POST   | /api/auth/reset-password  | Reset password           |
| GET    | /api/dashboard         | Dashboard stats            |
| GET    | /api/accounts          | List accounts              |
| POST   | /api/accounts          | Create account             |
| GET    | /api/transactions      | List transactions          |
| POST   | /api/transactions      | Create transaction         |
| GET    | /api/customers         | List customers (admin)     |
| POST   | /api/customers         | Create customer            |
| PUT    | /api/customers         | Update customer            |
| GET    | /api/alerts            | Get alerts                 |
| PATCH  | /api/alerts            | Mark alerts read           |
| GET    | /api/loans             | List loans                 |
| POST   | /api/loans             | Apply/approve/reject loan  |
| GET    | /api/credit-cards      | List credit cards          |
| POST   | /api/credit-cards      | Spend/pay/apply card       |
| GET    | /api/credit-score      | Get credit score           |
| GET    | /api/analytics         | Get analytics data         |
| GET    | /api/scheduled         | List scheduled payments    |
| POST   | /api/scheduled         | Create/toggle scheduled    |
| GET    | /api/branches          | List branches              |

---

## 🏗️ Architecture

```
Browser → Next.js (Port 3000) → Proxy Rewrite → Express (Port 5000) → MySQL
```

- **Frontend**: Only handles UI rendering and makes `fetch('/api/...')` calls
- **Backend**: Handles all business logic, database queries, and authentication
- **Proxy**: `next.config.js` rewrites `/api/*` requests to the Express backend
- **Database**: MySQL with 13 tables (users, customers, accounts, transactions, etc.)
