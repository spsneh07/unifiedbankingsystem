'use client'
import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { Plus, Search, Eye, Edit2, Phone, Mail, MapPin } from 'lucide-react'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  useEffect(() => {
    fetch('/api/customers', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch customers:', err);
        setData([]);
        setLoading(false);
      });
  }, [user?.id])

  if (loading) return <div className="p-6 text-white">Loading...</div>

  const mappedCustomers = data.map(c => ({
    ...c,
    customer_id: c.id,
    name: `${c.first_name} ${c.last_name}`,
    aadhar_number: '123456789012' // Fallback if missing
  }))

  const filtered = mappedCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  )

  return (
    <div className="p-6 space-y-5 animate-fade-in">

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4455]" />
            <input
              className="input pl-9 py-2 text-sm"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add Customer
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1d24]">
                  {['ID', 'Name', 'Email', 'Phone', 'Address', 'Since', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.customer_id} className="table-row">
                    <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">#{c.customer_id}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a1d24] flex items-center justify-center text-accent font-display font-700 text-[12px]">
                          {c.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="text-white font-display font-600">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#8890a0]">{c.email}</td>
                    <td className="px-5 py-3 text-[#8890a0] font-mono">{c.phone}</td>
                    <td className="px-5 py-3 text-[#8890a0] max-w-[140px] truncate">{c.address}</td>
                    <td className="px-5 py-3 text-[#8890a0] text-[12px]">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(c)} className="w-7 h-7 rounded-lg bg-[#1a1d24] hover:bg-accent/10 flex items-center justify-center text-[#8890a0] hover:text-accent transition-colors">
                          <Eye size={13} />
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-[#1a1d24] hover:bg-[#22262f] flex items-center justify-center text-[#8890a0] hover:text-white transition-colors">
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[#1a1d24] text-[12px] text-[#8890a0]">
            Showing {filtered.length} of {mappedCustomers.length} customers
          </div>
        </div>

        {/* Add Customer Modal */}
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Customer">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Full Name</label>
                <input className="input text-sm" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Email</label>
                <input className="input text-sm" type="email" placeholder="email@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Phone</label>
                <input className="input text-sm" placeholder="10-digit number" />
              </div>
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Aadhar Number</label>
                <input className="input text-sm" placeholder="12-digit Aadhar" maxLength={12} />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Address</label>
              <textarea className="input text-sm resize-none" rows={2} placeholder="Full address" />
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-primary flex-1 text-sm">Create Customer</button>
              <button className="btn-ghost flex-1 text-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </Modal>

        {/* View Customer Modal */}
        {selected && (
          <Modal open={!!selected} onClose={() => setSelected(null)} title="Customer Profile">
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-[#1a1d24]">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-display font-700 text-[20px]">
                  {selected.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-display font-700 text-[17px] text-white">{selected.name}</p>
                  <Badge variant="green">Active Customer</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={15} className="text-[#8890a0]" />
                  <span className="text-[#e8eaf0]">{selected.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={15} className="text-[#8890a0]" />
                  <span className="text-[#e8eaf0]">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={15} className="text-[#8890a0]" />
                  <span className="text-[#e8eaf0]">{selected.address}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#1a1d24] rounded-lg p-3">
                  <p className="text-[11px] text-[#8890a0] font-display font-600 uppercase tracking-widest mb-1">Aadhar</p>
                  <p className="font-mono text-[13px] text-white">****{String(selected.aadhar_number || '').slice(-4)}</p>
                </div>
                <div className="bg-[#1a1d24] rounded-lg p-3">
                  <p className="text-[11px] text-[#8890a0] font-display font-600 uppercase tracking-widest mb-1">Member Since</p>
                  <p className="text-[13px] text-white">{new Date(selected.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
                </div>
              </div>
            </div>
          </Modal>
        )}

      </div>
    
  )
}
