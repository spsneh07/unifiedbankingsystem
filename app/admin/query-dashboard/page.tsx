'use client'
import { useState } from 'react'
import { mockTransactions, mockAccounts, mockCustomers, mockBranches, formatCurrency } from '@/lib/mockData'
import { Play, Terminal, ChevronDown, ChevronUp, Database } from 'lucide-react'

interface Query {
  id: number
  title: string
  concept: string
  description: string
  sql: string
  run: () => any[]
  columns: string[]
}

const avgBalance = mockAccounts.reduce((s, a) => s + a.balance, 0) / mockAccounts.length

const queries: Query[] = [
  {
    id: 1,
    title: '4-Table JOIN Query',
    concept: 'JOIN',
    description: 'Joins customers, accounts, branches, and transactions in one query. Retrieves recent transactions with full context.',
    sql: `SELECT c.name, a.account_no,\n       t.amount, t.created_at AS transaction_date, t.type\nFROM customers c\nJOIN accounts a ON c.customer_id = a.customer_id\nJOIN transactions t ON a.account_id = t.account_id\nWHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\nORDER BY t.created_at DESC;`,
    run: () => mockTransactions.slice(0, 10).map(t => {
      const acc = mockAccounts.find(a => a.account_id === t.account_id)!
      const branch = mockBranches.find(b => b.branch_id === acc?.branch_id)
      return {
        name: t.customer_name,
        account_no: t.account_no,
        bank_name: acc?.bank_name,
        branch_name: branch?.name || 'N/A',
        amount: formatCurrency(t.amount),
        date: new Date(t.transaction_date).toLocaleDateString('en-IN'),
        type: t.type,
      }
    }),
    columns: ['Customer', 'Account No', 'Bank', 'Branch', 'Amount', 'Date', 'Type'],
  },
  {
    id: 2,
    title: 'Subquery — Above Average Balance',
    concept: 'SUBQUERY',
    description: 'Uses a subquery to find accounts whose balance is greater than the average balance of all accounts. Avg balance: ' + formatCurrency(avgBalance),
    sql: `SELECT c.name, a.account_no, a.bank_name, a.balance\nFROM customers c\nJOIN accounts a ON c.customer_id = a.customer_id\nWHERE a.balance > (\n  SELECT AVG(balance) FROM accounts\n)\nORDER BY a.balance DESC;`,
    run: () => mockAccounts
      .filter(a => a.balance > avgBalance)
      .sort((a, b) => b.balance - a.balance)
      .map(a => ({
        name: a.customer_name,
        account_no: a.account_no,
        bank: a.bank_name,
        balance: formatCurrency(a.balance),
        diff: `+${formatCurrency(a.balance - avgBalance)} above avg`,
      })),
    columns: ['Customer', 'Account No', 'Bank', 'Balance', 'vs Average'],
  },
  {
    id: 3,
    title: 'GROUP BY + HAVING — Branch Summary',
    concept: 'GROUP BY / HAVING',
    description: 'Groups accounts by branch, sums/averages balances, and filters branches with more than 1 account using HAVING clause.',
    sql: `SELECT b.name AS branch_name,\n       COUNT(DISTINCT a.account_id) AS total_accounts,\n       SUM(a.balance) AS total_balance,\n       AVG(a.balance) AS avg_balance\nFROM branches b\nJOIN accounts a ON b.branch_id = a.branch_id\nGROUP BY b.branch_id\nHAVING total_accounts > 1\nORDER BY total_balance DESC;`,
    run: () => mockBranches.map(b => {
      const accs = mockAccounts.filter(a => a.branch_id === b.branch_id)
      return {
        branch: b.name,
        total_accounts: accs.length,
        total_balance: formatCurrency(accs.reduce((s, a) => s + a.balance, 0)),
        avg_balance: formatCurrency(accs.length ? accs.reduce((s, a) => s + a.balance, 0) / accs.length : 0),
      }
    }).filter(r => r.total_accounts > 1).sort((a, b) => b.total_accounts - a.total_accounts),
    columns: ['Branch', 'Total Accounts', 'Total Balance', 'Avg Balance'],
  },
  {
    id: 4,
    title: 'VIEW — High Balance Accounts',
    concept: 'VIEW',
    description: 'Creates a view called high_balance_accounts for accounts with balance > ₹1,00,000. Views simplify complex queries into reusable virtual tables.',
    sql: `-- Create the view\nCREATE VIEW high_balance_accounts AS\nSELECT a.account_no, a.balance, a.bank_name,\n       c.name AS customer_name, c.email\nFROM accounts a\nJOIN customers c ON a.customer_id = c.customer_id\nWHERE a.balance > 100000;\n\n-- Query the view\nSELECT * FROM high_balance_accounts\nORDER BY balance DESC;`,
    run: () => mockAccounts
      .filter(a => a.balance > 100000)
      .sort((a, b) => b.balance - a.balance)
      .map(a => {
        const cust = mockCustomers.find(c => c.customer_id === a.customer_id)
        return {
          account_no: a.account_no,
          balance: formatCurrency(a.balance),
          bank: a.bank_name,
          customer: a.customer_name,
          email: cust?.email || '',
        }
      }),
    columns: ['Account No', 'Balance', 'Bank', 'Customer', 'Email'],
  },
  {
    id: 5,
    title: 'Stored Procedure — GetCustomerTransactions',
    concept: 'STORED PROCEDURE',
    description: 'Simulates calling a stored procedure that retrieves all transactions for a given customer ID. Procedures encapsulate reusable SQL logic.',
    sql: `DELIMITER $$\nCREATE PROCEDURE GetCustomerTransactions(IN customerId INT)\nBEGIN\n  SELECT t.transaction_id, t.amount, t.type,\n         t.created_at AS transaction_date, a.account_no\n  FROM transactions t\n  JOIN accounts a ON t.account_id = a.account_id\n  WHERE a.customer_id = customerId\n  ORDER BY t.created_at DESC;\nEND$$\nDELIMITER ;\n\n-- Execute for customer #1\nCALL GetCustomerTransactions(1);`,
    run: () => {
      const custAccounts = mockAccounts.filter(a => a.customer_id === 1).map(a => a.account_id)
      return mockTransactions
        .filter(t => custAccounts.includes(t.account_id))
        .map(t => ({
          tx_id: `#${t.transaction_id}`,
          amount: formatCurrency(t.amount),
          type: t.type,
          date: new Date(t.transaction_date).toLocaleDateString('en-IN'),
          account_no: t.account_no,
          bank: mockAccounts.find(a => a.account_id === t.account_id)?.bank_name,
        }))
    },
    columns: ['TX ID', 'Amount', 'Type', 'Date', 'Account No', 'Bank'],
  },
  {
    id: 6,
    title: 'Trigger Simulation — Auto Balance Update',
    concept: 'TRIGGER',
    description: 'Simulates a BEFORE/AFTER INSERT trigger on transactions table that automatically updates the account balance. Shows before/after balance comparison.',
    sql: `-- Trigger definition\nCREATE TRIGGER after_transaction_insert\nAFTER INSERT ON transactions\nFOR EACH ROW\nBEGIN\n  IF NEW.type = 'deposit' THEN\n    UPDATE accounts\n    SET balance = balance + NEW.amount\n    WHERE account_id = NEW.account_id;\n  ELSEIF NEW.type = 'withdraw' THEN\n    UPDATE accounts\n    SET balance = balance - NEW.amount\n    WHERE account_id = NEW.account_id;\n  END IF;\nEND;\n\n-- Simulation: INSERT then SELECT\nINSERT INTO transactions (account_id, type, amount)\nVALUES (1, 'deposit', 5000);\n-- Trigger fires → balance auto-updated`,
    run: () => {
      const simulatedDeposit = 5000
      return mockAccounts.slice(0, 5).map(a => ({
        account: a.account_no.slice(-8),
        bank: a.bank_name,
        before: formatCurrency(a.balance),
        trigger_action: a.account_id === 1 ? `+${formatCurrency(simulatedDeposit)} (deposit)` : '—',
        after: a.account_id === 1 ? formatCurrency(a.balance + simulatedDeposit) : formatCurrency(a.balance),
      }))
    },
    columns: ['Account', 'Bank', 'Balance Before', 'Trigger Action', 'Balance After'],
  },
]

function highlightSQL(sql: string) {
  const keywords = ['SELECT', 'FROM', 'JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'CREATE', 'VIEW', 'AS', 'ON', 'IN', 'IF', 'THEN', 'ELSE', 'ELSEIF', 'END', 'BEGIN', 'FOR', 'EACH', 'ROW', 'DELIMITER', 'CALL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'AND', 'OR', 'NOT', 'BY', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DATE_SUB', 'NOW', 'INTERVAL', 'DESC', 'ASC', 'PROCEDURE', 'TRIGGER', 'AFTER', 'BEFORE']
  let result = sql
  keywords.forEach(kw => {
    result = result.replace(new RegExp(`\\b${kw}\\b`, 'g'), `<span class="sql-keyword">${kw}</span>`)
  })
  result = result.replace(/--[^\n]*/g, m => `<span class="sql-comment">${m}</span>`)
  result = result.replace(/'[^']*'/g, m => `<span class="sql-string">${m}</span>`)
  result = result.replace(/\b\d+\b/g, m => `<span class="sql-number">${m}</span>`)
  return result
}

const conceptColors: Record<string, string> = {
  'JOIN': '#00d4aa',
  'SUBQUERY': '#4090f0',
  'GROUP BY / HAVING': '#f0c040',
  'VIEW': '#a040f0',
  'STORED PROCEDURE': '#f06040',
  'TRIGGER': '#f05050',
}

export default function QueryDashboardPage() {
  const [results, setResults] = useState<Record<number, any[]>>({})
  const [expanded, setExpanded] = useState<number | null>(null)

  const runQuery = async (q: Query) => {
    try {
      const res = await fetch('/api/queries/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: q.sql })
      })
      const data = await res.json()
      if (data.success) {
        setResults(prev => ({ ...prev, [q.id]: data.data }))
      } else {
        console.error("Error executing query: " + data.error)
        setResults(prev => ({ ...prev, [q.id]: [{ error: data.error }] }))
      }
    } catch (e: any) {
      console.error(e)
    }
    setExpanded(q.id)
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">

        {/* Hero */}
        <div className="flex items-start gap-4 p-5 rounded-xl border border-[#00d4aa]/20 bg-[#00d4aa]/5">
          <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/15 flex items-center justify-center flex-shrink-0">
            <Database size={20} className="text-[#00d4aa]" />
          </div>
          <div>
            <p className="font-display font-700 text-[15px] text-white mb-1">Advanced DBMS Query Visualizer</p>
            <p className="text-[13px] text-[#8890a0]">
              Run 6 interactive queries demonstrating core DBMS concepts: JOIN, Subquery, GROUP BY/HAVING, VIEW, Stored Procedure, and Triggers.
              Results are simulated from mock data — replace with real MySQL queries when connected.
            </p>
          </div>
        </div>

        {/* Query cards */}
        <div className="space-y-4">
          {queries.map(q => {
            const color = conceptColors[q.concept]
            const isExpanded = expanded === q.id
            const queryResults = results[q.id]

            return (
              <div key={q.id} className="card overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-700 text-[13px]" style={{ background: `${color}18`, color }}>
                    {q.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-700 text-[15px] text-white">{q.title}</p>
                      <span className="badge" style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>{q.concept}</span>
                    </div>
                    <p className="text-[12px] text-[#8890a0] mt-0.5">{q.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runQuery(q)}
                      className="flex items-center gap-2 text-[13px] font-display font-700 px-4 py-2 rounded-lg transition-all"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
                    >
                      <Play size={13} /> Run Query
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : q.id)}
                      className="w-8 h-8 rounded-lg bg-[#1a1d24] flex items-center justify-center text-[#8890a0] hover:text-white transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* SQL Block */}
                {isExpanded && (
                  <div className="border-t border-[#1a1d24] px-5 py-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal size={13} className="text-[#8890a0]" />
                      <span className="text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">SQL Query</span>
                    </div>
                    <div
                      className="sql-block"
                      dangerouslySetInnerHTML={{ __html: highlightSQL(q.sql) }}
                    />

                    {/* Results */}
                    {queryResults && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse-soft" />
                          <span className="text-[11px] font-display font-600 uppercase tracking-widest text-[#00d4aa]">
                            Query Results — {queryResults.length} row{queryResults.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-[#1a1d24]">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[#1a1d24] bg-[#0d0f14]">
                                {q.columns.map(col => (
                                  <th key={col} className="text-left px-4 py-2.5 text-[11px] font-display font-600 uppercase tracking-widest" style={{ color }}>
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResults.map((row, i) => (
                                <tr key={i} className="table-row">
                                  {Object.values(row).map((val: any, j) => (
                                    <td key={j} className="px-4 py-2.5 text-[13px] font-mono text-[#e8eaf0]">{String(val)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    
  )
}
