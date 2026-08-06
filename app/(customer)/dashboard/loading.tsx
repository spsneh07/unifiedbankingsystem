export default function DashboardLoading() {
  return (
    <div className="w-full flex flex-col gap-6 p-6 animate-pulse">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 bg-[#111318]/50 border border-white/5">
            <div className="skeleton h-3 w-20 mb-3 rounded" />
            <div className="skeleton h-8 w-28 mb-2 rounded" />
            <div className="skeleton h-2 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Accounts skeleton */}
      <div>
        <div className="skeleton h-4 w-24 mb-4 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 bg-[#111318]/50 border border-white/5">
              <div className="flex justify-between mb-4">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-3 w-12 rounded" />
              </div>
              <div className="skeleton h-7 w-32 mb-1 rounded" />
              <div className="skeleton h-2 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 bg-[#111318]/50 border border-white/5">
          <div className="skeleton h-4 w-32 mb-6 rounded" />
          <div className="skeleton h-[300px] w-full rounded-lg" />
        </div>
        <div className="card p-6 bg-[#111318]/50 border border-white/5">
          <div className="skeleton h-4 w-28 mb-4 rounded" />
          <div className="skeleton h-[240px] w-full rounded-full" />
        </div>
      </div>

      {/* Transactions skeleton */}
      <div className="card p-6 bg-[#111318]/50 border border-white/5">
        <div className="skeleton h-4 w-36 mb-5 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
            <div className="flex flex-col gap-1.5">
              <div className="skeleton h-3 w-40 rounded" />
              <div className="skeleton h-2 w-20 rounded" />
            </div>
            <div className="skeleton h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
