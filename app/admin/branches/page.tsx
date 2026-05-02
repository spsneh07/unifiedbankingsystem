'use client'
import { useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
// Employee/account data fetched from API
import { GitBranch, Users, ChevronDown, ChevronUp, MapPin, Phone } from 'lucide-react'
import BranchMap from '@/components/BranchMap'

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(1)

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        setBranches(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-5 animate-fade-in">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Branches', value: branches.length, icon: GitBranch, color: '#00d4aa' },
            { label: 'Active Branches', value: branches.length, icon: Users, color: '#4090f0' },
            { label: 'Avg per Region', value: branches.length ? (branches.length / 3).toFixed(1) : '0', icon: Users, color: '#f0c040' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">{s.label}</p>
                <p className="font-display font-700 text-[20px] text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Branch accordion */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-[#8890a0]">Loading branches...</div>
          ) : branches.map((branch: any) => {
            const isOpen = expanded === branch.id

            return (
              <div key={branch.id} className="card overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#1a1d24] transition-colors"
                  onClick={() => setExpanded(isOpen ? null : branch.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-display font-700 text-[13px] flex-shrink-0">
                    {branch.id}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-display font-700 text-[15px] text-white">{branch.name}</p>
                    <p className="text-[12px] text-[#8890a0]">{branch.address}</p>
                  </div>
                  <div className="flex items-center gap-4 text-[13px] text-[#8890a0]">
                    <span className="flex items-center gap-1"><MapPin size={13} /> {branch.code}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[#1a1d24] px-5 py-4 space-y-4">
                    {/* Branch info */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#1a1d24] rounded-lg p-3">
                        <p className="text-[11px] text-[#8890a0] font-display font-600 uppercase tracking-widest mb-1">Manager</p>
                        <p className="text-[13px] text-white">{branch.manager_name}</p>
                      </div>
                      <div className="bg-[#1a1d24] rounded-lg p-3 flex items-center gap-2">
                        <Phone size={13} className="text-[#8890a0]" />
                        <p className="text-[13px] text-white">{branch.phone}</p>
                      </div>
                      <div className="bg-[#1a1d24] rounded-lg p-3 flex items-center gap-2">
                        <MapPin size={13} className="text-[#8890a0]" />
                        <p className="text-[13px] text-white truncate">{branch.address}</p>
                      </div>
                    </div>

                    {/* Branch Map */}
                    <div className="space-y-2">
                       <p className="text-[12px] font-display font-600 uppercase tracking-widest text-[#8890a0]">Location Map</p>
                       <BranchMap lat={branch.latitude} lng={branch.longitude} address={branch.address} />
                    </div>

                    {/* Branch Details */}
                    <div>
                      <p className="text-[12px] font-display font-600 uppercase tracking-widest text-[#8890a0] mb-3">Branch Code: {branch.code}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    
  )
}
