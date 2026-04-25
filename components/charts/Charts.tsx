'use client'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const tooltipStyle = {
  contentStyle: { background: '#111318', border: '1px solid #1a1d24', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#8890a0' },
  itemStyle: { color: '#e8eaf0' },
}

export function MonthlyBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1d24" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#8890a0', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#8890a0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
        <Bar dataKey="deposits" name="Deposits" fill="#00d4aa" radius={[4, 4, 0, 0]} />
        <Bar dataKey="withdrawals" name="Withdrawals" fill="#f05050" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TrendLineChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1d24" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#8890a0', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#8890a0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
        <Line type="monotone" dataKey="deposits" name="Deposits" stroke="#00d4aa" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#f05050" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data, label }: { data: { name: string; value: number; color: string }[]; label?: string }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ color: '#8890a0', fontSize: 12 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function SpendingBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1d24" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#8890a0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="category" tick={{ fill: '#8890a0', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
        <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
