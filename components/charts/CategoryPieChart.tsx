'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const tooltipStyle = {
  contentStyle: { background: '#111318', border: '1px solid #1a1d24', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#8890a0' },
  itemStyle: { color: '#e8eaf0' },
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function CategoryPieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          dataKey="value"
          paddingAngle={3}
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
        </Pie>
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ color: '#8890a0', fontSize: 12 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
