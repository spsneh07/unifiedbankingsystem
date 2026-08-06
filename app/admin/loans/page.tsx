'use client';
import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { Banknote, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

function statusBadge(s: string) {
  if (s === 'approved') return <Badge variant="green" className="flex items-center gap-1"><CheckCircle size={12}/> Approved</Badge>;
  if (s === 'rejected') return <Badge variant="red" className="flex items-center gap-1"><XCircle size={12}/> Rejected</Badge>;
  return <Badge variant="yellow" className="flex items-center gap-1"><Clock size={12}/> Pending</Badge>;
}

interface Loan {
  id: number;
  customer_name: string;
  customer_email: string;
  amount: string;
  tenure: number;
  interest_rate: string;
  emi: string;
  status: string;
  created_at: string;
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const loadLoans = () => {
    setLoading(true);
    fetch('/api/loans', { cache: 'no-store', credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setLoans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast('error', 'Failed to load loans');
      });
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleAction = async (loanId: number, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, loan_id: loanId })
      });
      const data = await res.json();
      if (data.success) {
        toast('success', data.message);
        loadLoans();
      } else {
        toast('error', data.error || `Failed to ${action} loan`);
      }
    } catch {
      toast('error', 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && loans.length === 0) {
    return <div className="p-6 text-black dark:text-white">Loading loan applications...</div>;
  }

  const filteredLoans = filter === 'all' ? loans : loans.filter(l => l.status === filter);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-800 text-black dark:text-white">Loan Applications</h1>
          <p className="text-[14px] text-[#8890a0] mt-1">Review and manage customer loan requests</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                filter === f ? 'bg-gold/10 text-gold font-600' : 'text-[#8890a0] hover:bg-gray-100 dark:hover:bg-[#1a1d24]'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1d24] bg-gray-50 dark:bg-[#0d0f14]">
                <th className="px-5 py-4 text-[11px] font-600 text-[#8890a0] uppercase tracking-wider">Customer</th>
                <th className="px-5 py-4 text-[11px] font-600 text-[#8890a0] uppercase tracking-wider">Amount</th>
                <th className="px-5 py-4 text-[11px] font-600 text-[#8890a0] uppercase tracking-wider">Details</th>
                <th className="px-5 py-4 text-[11px] font-600 text-[#8890a0] uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-[11px] font-600 text-[#8890a0] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#1a1d24]">
              {filteredLoans.map(loan => (
                <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-[#111318]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-[14px] font-display font-600 text-black dark:text-white">{loan.customer_name}</p>
                    <p className="text-[12px] text-[#8890a0]">{loan.customer_email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[15px] font-display font-700 text-black dark:text-white">{formatCurrency(parseFloat(loan.amount))}</p>
                    <p className="text-[12px] text-[#8890a0]">EMI: {formatCurrency(parseFloat(loan.emi))}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[13px] text-black dark:text-white">{loan.tenure} Months @ {loan.interest_rate}%</p>
                    <p className="text-[12px] text-[#8890a0]">{new Date(loan.created_at).toLocaleDateString('en-IN')}</p>
                  </td>
                  <td className="px-5 py-4">
                    {statusBadge(loan.status)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {loan.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          disabled={actionLoading}
                          onClick={() => handleAction(loan.id, 'approve')}
                          className="px-3 py-1.5 rounded-lg bg-[#00d4aa]/10 text-[#00d4aa] hover:bg-[#00d4aa]/20 text-sm font-600 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button 
                          disabled={actionLoading}
                          onClick={() => handleAction(loan.id, 'reject')}
                          className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 text-sm font-600 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#8890a0]">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#8890a0] text-sm">
                    No loan applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

