# NexusBank — Unified Banking System

A production-grade banking dashboard built with **Next.js 14**, **Tailwind CSS**, and **Recharts**.
This is the **frontend-only** version — all data is mocked. MySQL integration points are clearly marked.

---

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** (custom dark theme)
- **Recharts** (charts and analytics)
- **Lucide React** (icons)
- **TypeScript**

---

## Pages

| Route | Description |
|---|---|
| `/auth/login` | Login page |
| `/auth/signup` | Registration page |
| `/dashboard` | Main unified dashboard |
| `/customers` | Customer management table |
| `/accounts` | Account listing with filters |
| `/transactions` | Transaction history + deposit/withdraw/transfer |
| `/analytics` | Charts and insights |
| `/fraud` | Fraud detection with risk scoring |
| `/scheduled` | Scheduled/recurring transactions |
| `/branches` | Branch & employee management |
| `/query-dashboard` | ⭐ DBMS Query Visualizer |

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open browser
http://localhost:3000
```

> No database setup needed for frontend-only mode. All data comes from `lib/mockData.ts`.

---

## Connecting MySQL (Later)

1. Install mysql2: `npm install mysql2`
2. Create `.env.local`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=banking_system
SESSION_SECRET=your_32_char_secret
```
3. Create `lib/db.ts`:
```typescript
import mysql from 'mysql2/promise';
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});
export async function query(sql: string, params?: any[]) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}
export default pool;
```
4. Replace `lib/mockData.ts` imports in each page with API calls to `app/api/` routes.
5. Implement API routes using the `query()` function.

---

## DBMS Concepts Demonstrated

| Concept | Location |
|---|---|
| 4-Table JOIN | `/query-dashboard` → Query #1 |
| Subquery | `/query-dashboard` → Query #2 |
| GROUP BY + HAVING | `/query-dashboard` → Query #3 |
| VIEW | `/query-dashboard` → Query #4 |
| Stored Procedure | `/query-dashboard` → Query #5 |
| Trigger | `/query-dashboard` → Query #6 |
| Fraud Detection (subquery) | `/fraud` |
| Above-average filter (subquery) | `/accounts` |

---

## Project Structure

```
nexusbank/
├── app/
│   ├── auth/login/page.tsx
│   ├── auth/signup/page.tsx
│   ├── dashboard/page.tsx
│   ├── customers/page.tsx
│   ├── accounts/page.tsx
│   ├── transactions/page.tsx
│   ├── analytics/page.tsx
│   ├── fraud/page.tsx
│   ├── scheduled/page.tsx
│   ├── branches/page.tsx
│   └── query-dashboard/page.tsx
├── components/
│   ├── layout/ (Sidebar, Header, AppLayout)
│   ├── ui/ (StatCard, Badge, Modal, Toast)
│   ├── dashboard/ (AccountCard)
│   └── charts/ (Charts)
├── lib/
│   └── mockData.ts
└── README.md
```

---

## Academic Viva Notes

- **Triggers** are simulated client-side; in MySQL they fire automatically on INSERT.
- **Views** are pre-filtered virtual tables; `high_balance_accounts` would be created once in DB.
- **Stored Procedures** encapsulate business logic server-side for reuse.
- **Subqueries** avoid hardcoding averages — they compute dynamically.
- **Fraud detection** uses `amount > 3 × AVG(amount)` — a common statistical threshold.
