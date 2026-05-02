'use client';
import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { Banknote, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';

function statusBadge(s: string) {
  if (s === 'approved') return <Badge variant="green" className="flex items-center gap-1"><CheckCircle size={12}/> Approved</Badge>;
  if (s === 'rejected') return <Badge variant="red" className="flex items-center gap-1"><XCircle size={12}/> Rejected</Badge>;
  return <Badge variant="yellow" className="flex items-center gap-1"><Clock size={12}/> Pending</Badge>;
}

interface Loan {
  id: number;
  amount: string;
  tenure: number;
  interest_rate: string;
  emi: string;
  status: string;
  created_at: string;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ amount: '', tenure: '36', interest_rate: '10.5' });

  const loadLoans = () => {
    setLoading(true);
    fetch('/api/loans', { cache: 'no-store' })
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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          amount: parseFloat(formData.amount),
          tenure: parseInt(formData.tenure),
          interest_rate: parseFloat(formData.interest_rate)
        })
      });
      const data = await res.json();
      if (data.success) {
        toast('success', data.message);
        setShowApply(false);
        setFormData({ amount: '', tenure: '36', interest_rate: '10.5' });
        loadLoans();
      } else {
        toast('error', data.error || 'Failed to apply');
      }
    } catch {
      toast('error', 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateEMI = (amount: string, tenure: string) => {
    const p = parseFloat(amount);
    const n = parseInt(tenure);
    const r = 10.5 / 100 / 12;
    if (!p || !n) return 0;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi || 0;
  };

  if (loading && loans.length === 0) {
    return <div className="p-6 text-black dark:text-white">Loading loans...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-display font-800 text-black dark:text-white">My Loans</h1>
          <p className="text-[14px] text-[#8890a0] mt-1">Manage your active and past loans</p>
        </div>
        <button onClick={() => setShowApply(true)} className="btn-primary flex-center gap-2 px-4 py-2">
          <Plus size={16} /> Apply for Loan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map(loan => (
          <div key={loan.id} className="card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Banknote size={20} />
                </div>
                {statusBadge(loan.status)}
              </div>
              <p className="text-[12px] text-[#8890a0] mb-1">Loan Amount</p>
              <h3 className="text-2xl font-display font-700 text-black dark:text-white mb-4">
                {formatCurrency(parseFloat(loan.amount) || 0)}
              </h3>
              
              <div className="space-y-2 border-t border-gray-200 dark:border-[#1a1d24] pt-4">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#8890a0]">Tenure</span>
                  <span className="font-600 text-black dark:text-white">{loan.tenure} Months</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#8890a0]">Interest Rate</span>
                  <span className="font-600 text-black dark:text-white">{loan.interest_rate}% p.a.</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#8890a0]">Monthly EMI</span>
                  <span className="font-700 text-accent">{formatCurrency(parseFloat(loan.emi) || 0)}</span>
                </div>
                <div className="flex justify-between text-[13px] mt-2 pt-2 border-t border-gray-200 dark:border-[#1a1d24]">
                  <span className="text-[#8890a0]">Applied On</span>
                  <span className="text-black dark:text-white">
                    {loan.created_at ? new Date(loan.created_at).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loans.length === 0 && !loading && (
          <div className="col-span-full card p-10 flex flex-col items-center justify-center text-center">
            <Banknote size={40} className="text-[#3d4455] mb-4" />
            <h3 className="text-lg font-display font-700 text-black dark:text-white mb-2">No Active Loans</h3>
            <p className="text-[#8890a0]">You haven't applied for any loans yet.</p>
          </div>
        )}
      </div>

      <Modal open={showApply} onClose={() => setShowApply(false)} title="Apply for a Loan">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-black dark:text-[#e8eaf0] mb-1.5">Loan Amount (₹)</label>
            <input 
              required type="number" min="10000" step="1000"
              className="input w-full"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-black dark:text-[#e8eaf0] mb-1.5">Tenure (Months)</label>
              <select 
                className="input w-full"
                value={formData.tenure}
                onChange={e => setFormData({ ...formData, tenure: e.target.value })}
              >
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
                <option value="48">48 Months</option>
                <option value="60">60 Months</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-black dark:text-[#e8eaf0] mb-1.5">Interest Rate (%)</label>
              <input 
                disabled type="text"
                className="input w-full opacity-70"
                value="10.5%"
              />
            </div>
          </div>
          
          {formData.amount && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-[12px] text-black dark:text-white mb-1">Estimated EMI</p>
              <p className="text-[18px] font-display font-700 text-accent">
                {formatCurrency(calculateEMI(formData.amount, formData.tenure))}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={actionLoading} className="btn-primary flex-1 text-sm">
              {actionLoading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button type="button" onClick={() => setShowApply(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
