'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import { mockBranches, mockEmployees, mockAccounts } from '@/lib/mockData'
import { GitBranch, Users, ChevronDown, ChevronUp, MapPin, Phone } from 'lucide-react'

export default function BranchesPage() {
  const [expanded, setExpanded] = useState<number | null>(1)

  return (
    <AppLayout>
      <Header title="Branches & Employees" />
      <div className="p-6 space-y-5 animate-fade-in">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Branches', value: mockBranches.length, icon: GitBranch, color: '#00d4aa' },
            { label: 'Total Employees', value: mockEmployees.length, icon: Users, color: '#4090f0' },
            { label: 'Avg Employees/Branch', value: (mockEmployees.length / mockBranches.length).toFixed(1), icon: Users, color: '#f0c040' },
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
          {mockBranches.map(branch => {
            const employees = mockEmployees.filter(e => e.branch_id === branch.branch_id)
            const accounts = mockAccounts.filter(a => a.branch_id === branch.branch_id)
            const isOpen = expanded === branch.branch_id

            return (
              <div key={branch.branch_id} className="card overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#1a1d24] transition-colors"
                  onClick={() => setExpanded(isOpen ? null : branch.branch_id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-display font-700 text-[13px] flex-shrink-0">
                    {branch.branch_id}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-display font-700 text-[15px] text-white">{branch.name}</p>
                    <p className="text-[12px] text-[#8890a0]">{branch.address}</p>
                  </div>
                  <div className="flex items-center gap-4 text-[13px] text-[#8890a0]">
                    <span className="flex items-center gap-1"><Users size={13} /> {employees.length} staff</span>
                    <span className="text-[#00d4aa] font-700">{accounts.length} accounts</span>
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

                    {/* Employees table */}
                    <div>
                      <p className="text-[12px] font-display font-600 uppercase tracking-widest text-[#8890a0] mb-3">Employees</p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#1a1d24]">
                            {['Name', 'Position', 'Email', 'Phone', 'Hire Date'].map(h => (
                              <th key={h} className="text-left py-2 text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map(emp => (
                            <tr key={emp.employee_id} className="border-b border-[#1a1d24]/50">
                              <td className="py-2.5 text-white font-display font-600">{emp.name}</td>
                              <td className="py-2.5"><Badge variant="blue">{emp.position}</Badge></td>
                              <td className="py-2.5 text-[#8890a0] text-[12px]">{emp.email}</td>
                              <td className="py-2.5 font-mono text-[12px] text-[#8890a0]">{emp.phone}</td>
                              <td className="py-2.5 text-[12px] text-[#8890a0]">{emp.hire_date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </AppLayout>
  )
}
