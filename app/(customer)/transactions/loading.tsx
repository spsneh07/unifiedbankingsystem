import { Loader2 } from 'lucide-react'

export default function TransactionsLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Action buttons */}
      <div className="flex gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-10 w-28 rounded-lg" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card overflow-hidden bg-[#111318]/50 border border-white/5">
        <div className="border-b border-white/5 px-6 py-4">
          <div className="flex gap-8">
            {['Description', 'Type', 'Amount', 'Category', 'Status', 'Date'].map(h => (
              <div key={h} className="skeleton h-3 w-16 rounded" />
            ))}
          </div>
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-8 items-center px-6 py-4 border-b border-white/5">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="skeleton h-3 w-40 rounded" />
              <div className="skeleton h-2 w-20 rounded" />
            </div>
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-5 w-14 rounded-full" />
            <div className="skeleton h-5 w-14 rounded-full" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
