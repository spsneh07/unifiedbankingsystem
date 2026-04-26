# 🏦 NexusBank — Unified Banking System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)

NexusBank is a production-grade, full-stack banking ecosystem designed for scalability and performance. It features a sophisticated dashboard for customers, an administrative suite for employees/admins, and a robust data layer demonstrating advanced DBMS principles.

---

## 🌟 Key Features

- **🔐 Multi-Role Authentication**: Secure login/signup for Customers, Employees, and Admins with role-based dashboard redirection.
- **📊 Interactive Analytics**: Real-time financial insights using Recharts.
- **💳 Account Management**: Manage multiple accounts (Checking, Savings, etc.) with detailed transaction history.
- **💸 Transaction Engine**: Support for deposits, withdrawals, and inter-account transfers.
- **🕵️ Fraud Detection**: Intelligent risk scoring based on statistical analysis of transaction patterns.
- **📅 Scheduled Payments**: Management of recurring transactions and scheduled transfers.
- **📍 Branch Locator**: Interactive map integration for finding physical branches.
- **🛠️ DBMS Query Visualizer**: Built-in tool for visualizing complex SQL operations and database health.

---

## 🏗️ Architecture

NexusBank is currently transitioning from a monolithic Next.js architecture to a decoupled Full-Stack system.

- **Frontend (`/nexusbank`)**: A high-performance Next.js 15 application utilizing the App Router and Server Components.
- **Integrated Backend**: API routes located in `nexusbank/app/api` handle current production traffic, directly interfacing with MySQL.
- **Standalone Backend (`/backend`)**: An Express.js microservice (in progress) designed to centralize business logic and improve horizontal scalability.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS (Premium Dark Theme)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Viz**: Recharts
- **Maps**: Leaflet / React Leaflet

### **Backend & Database**
- **Runtime**: Node.js
- **Framework**: Express.js (Migration target)
- **Database**: MySQL 8.0+
- **Driver**: `mysql2/promise`
- **Auth**: Custom implementation using `bcryptjs` for hashing and cookie-based sessions.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MySQL Server (running locally or remotely)

### 2. Environment Configuration
Create a `.env.local` file in the `/nexusbank` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=banking_db
SESSION_SECRET=your_secret_key
```

### 3. Database Initialization
NexusBank includes an automated script to set up your database schema and seed initial mock data.

```bash
cd nexusbank
npm run init-db  # Runs the lib/initDb.ts script
```

### 4. Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📂 Project Structure

```text
nexusbank/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication pages (Login/Signup)
│   ├── (customer)/       # Customer dashboard & features
│   ├── admin/            # Administrative management
│   └── api/              # Integrated Backend API Routes
├── components/           # Reusable UI components
│   ├── layout/           # Sidebar, Header, Sidebar
│   └── charts/           # Analytics visualizations
├── lib/                  # Database config & utility functions
├── public/               # Static assets
└── proxy.ts              # Role-based middleware & routing logic
```

---

## 🎓 DBMS Concepts Demonstrated

NexusBank is designed to showcase core database management principles:

| Concept | Implementation |
|---|---|
| **Triggers** | Automated balance updates on transaction insertion. |
| **Views** | Virtual tables for `high_value_customers` and `monthly_trends`. |
| **Stored Procedures** | Encapsulated logic for complex inter-bank transfers. |
| **ACID Compliance** | Transactional integrity during fund transfers. |
| **Subqueries** | Dynamic filtering for fraud detection (e.g., `amount > 3x AVG`). |

---

## 🔒 Security

- **Password Hashing**: Bcrypt with unique salts for every user.
- **Session Security**: HTTP-only cookies to prevent XSS-based token theft.
- **Data Isolation**: Multi-tenant architecture ensuring customers only see their own financial data.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
