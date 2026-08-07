# 🚀 NexusBank — Unified Banking System

**Live Demo:** [https://unifiedbankingsystem.vercel.app/](https://unifiedbankingsystem.vercel.app/)
NexusBank is a next-generation unified banking dashboard that aggregates all your financial data into a single, comprehensive platform. With a strong focus on security, usability, and speed, NexusBank helps you manage accounts, schedule payments, transfer funds securely, and track analytics in real-time.

## ✨ Features
- **Centralized Dashboard**: View real-time balances, income vs expenses, and recent transactions.
- **Transfers & Transactions**: Send funds instantly with automated multi-tier security and OTP locks.
- **Fraud Detection**: Flag suspicious activities (e.g., transactions 3x higher than your average).
- **Scheduled Payments**: Set up recurring payments for monthly bills or investments.
- **Analytics Engine**: Deep dive into categorical spending, top vendors, and historical trends.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, Vercel Serverless Functions
- **Database**: PostgreSQL (Supabase)
- **Security**: bcryptjs, HMAC-SHA256 Signed Cookies, OTP validation

## 🏗 Architecture & Folder Structure
This repository utilizes a dual-engine architecture:
- `app/`, `components/`, `lib/`: The Next.js 14 App Router frontend.
- `backend/`: The Express.js backend. This handles all business logic securely away from the client and connects to the PostgreSQL database.

## 🚀 Supabase PostgreSQL Setup
NexusBank has been completely migrated to a cloud-native PostgreSQL architecture using **Supabase**.

1. **Create Project**: Go to [Supabase](https://supabase.com), create a free project.
2. **Schema**: Open the Supabase SQL Editor and run the contents of `backend/db/supabase_schema.sql`.
3. **Demo Data**: Run the contents of `backend/db/supabase_seed.sql` to populate accounts.
4. **Environment**: Copy the PostgreSQL connection string.

## ⚙️ Environment Variables
### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
*(On Vercel, set this to your backend Vercel deployment URL)*

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
PORT=5000
SESSION_SECRET=a_very_long_secure_string_here
```

## 💻 Running Locally
1. Clone the repository.
2. Run `npm install` in the root folder.
3. Run `npm install` inside the `backend` folder.
4. Open two terminals:
   - Terminal 1 (Frontend): `npm run dev`
   - Terminal 2 (Backend): `cd backend && npm start`

## ☁️ Deploying to Vercel
1. Create a Vercel project for the **Frontend**. Leave settings as default.
2. Create a second Vercel project for the **Backend** from the same repo.
   - Set the Root Directory to `backend/`.
   - Vercel will automatically detect `vercel.json` and deploy it as serverless functions!

## 🔐 Demo Credentials
| Role | Email | Password |
|---|---|---|
| Customer | `customer@nexusbank.com` | `password` |
| Admin | `admin@nexusbank.com` | `admin` |
| Employee | `employee@nexusbank.com` | `employee123` |

## 📖 API Overview
- `POST /api/auth/login` - Authenticate
- `POST /api/transactions` - Transfer funds / Deposit / Withdraw
- `GET /api/dashboard` - Get dashboard aggregates
- `GET /api/analytics` - Fetch chart data

## 🔮 Future Improvements
- Plaid API integration for external account linking.
- Mobile application using React Native.
- Multi-currency support and real-time exchange rates.

## 📄 License
MIT License. See LICENSE for more information.
