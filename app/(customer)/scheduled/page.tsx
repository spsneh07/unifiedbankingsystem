'use client';
import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/mockData';
import { CalendarClock, Zap, Home, Shield, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';

function getBillIcon(type: string) {
  if (type === 'electricity') return <Zap size={20} />;
  if (type === 'rent') return <Home size={20} />;
  if (type === 'insurance') return <Shield size={20} />;
  return <RefreshCw size={20} />;
}

export default function ScheduledPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    account_id: '1', amount: '', frequency: 'monthly', bill_type: 'electricity', next_execution: ''
  });
  const [accounts, setAccounts] = useState<any[]>([]);

  const loadData = () => {
    setLoading(true);
    fetch('/api/scheduled', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { setSchedules(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  useEffect(() => {
    loadData();
    fetch('/api/accounts', { cache: 'no-store' }).then(r => r.json()).then(d => setAccounts(Array.isArray(d) ? d : []));
  }, [user?.id]);

  const handleToggle = async (id: number, currentActive: number) => {
    try {
      const res = await fetch('/api/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', schedule_id: id, is_active: currentActive ? 0 : 1 })
      });
      const data = await res.json();
      if (data.success) {
        toast('success', data.message);
        loadData();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Network error');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...formData, amount: parseFloat(formData.amount) })
      });
      const data = await res.json();
      if (data.success) {
        toast('success', data.message);
        setShowAdd(false);
        loadData();
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && schedules.length === 0) {
    return <div className="p-6 text-black dark:text-white">Loading scheduled payments...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-display font-800 text-black dark:text-white">Scheduled Payments</h1>
          <p className="text-[14px] text-[#8890a0] mt-1">Manage recurring bills and auto-pay</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <CalendarClock size={16} /> New Auto-Pay
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map(sch => {
          const isActive = sch.is_active === 1;
          const today = new Date();
          const nextDate = new Date(sch.next_execution);
          const isDueSoon = nextDate >= today && (nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24) <= 5;

          return (
            <div key={sch.schedule_id} className={`card p-6 flex flex-col justify-between ${isActive ? 'border-accent/20' : 'opacity-80 grayscale-[50%]'}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-500'}`}>
                    {getBillIcon(sch.bill_type)}
                  </div>
                  {isActive ? (
                    <Badge variant="green" className="flex items-center gap-1"><CheckCircle size={12}/> Active</Badge>
                  ) : (
                    <Badge variant="gray" className="flex items-center gap-1"><XCircle size={12}/> Paused</Badge>
                  )}
                </div>
                
                <p className="text-[12px] text-[#8890a0] mb-1 capitalize">{sch.bill_type} Bill • {sch.frequency}</p>
                <h3 className="text-2xl font-display font-700 text-black dark:text-white mb-4">
                  {formatCurrency(parseFloat(sch.amount))}
                </h3>
                
                <div className="space-y-2 border-t border-gray-200 dark:border-[#1a1d24] pt-4">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8890a0]">Debit Account</span>
                    <span className="font-600 text-black dark:text-white">{sch.account_no}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8890a0]">Next Payment</span>
                    <span className={`font-700 ${isDueSoon && isActive ? 'text-gold' : 'text-black dark:text-white'}`}>
                      {nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={() => handleToggle(sch.schedule_id, sch.is_active)}
                  className={`w-full py-2.5 rounded-lg text-sm font-600 transition-colors ${
                    isActive 
                      ? 'bg-gray-100 dark:bg-[#1a1d24] text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#22262f]' 
                      : 'bg-accent text-[#0a0c10] hover:bg-accent-dim'
                  }`}
                >
                  {isActive ? 'Pause Auto-Pay' : 'Resume Auto-Pay'}
                </button>
              </div>
            </div>
          )
        })}
        {schedules.length === 0 && !loading && (
          <div className="col-span-full card p-10 flex flex-col items-center justify-center text-center">
            <CalendarClock size={40} className="text-[#3d4455] mb-4" />
            <h3 className="text-lg font-display font-700 text-black dark:text-white mb-2">No Scheduled Payments</h3>
            <p className="text-[#8890a0]">You haven't setup any auto-pay schedules yet.</p>
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Scheduled Payment">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-black dark:text-[#e8eaf0] mb-1.5">Bill Type</label>
            <select className="input w-full" value={formData.bill_type} onChange={e => setFormData({ ...formData, bill_type: e.target.value })}>
              <option value="electricity">Electricity</option>
              <option value="rent">Rent</option>
              <option value="insurance">Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-black dark:text-[#e8eaf0] mb-1.5">Amount (₹)</label>
            <input required type="number" className="input w-full" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-black dark:text-[#e8eaf0] mb-1.5">Frequency</label>
              <select className="input w-full" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-black dark:text-[#e8eaf0] mb-1.5">Next Execution Date</label>
              <input required type="date" className="input w-full" value={formData.next_execution} onChange={e => setFormData({ ...formData, next_execution: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-black dark:text-[#e8eaf0] mb-1.5">Debit Account</label>
            <select className="input w-full" value={formData.account_id} onChange={e => setFormData({ ...formData, account_id: e.target.value })}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.account_number} ({formatCurrency(parseFloat(a.balance))})</option>)}
            </select>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={actionLoading} className="btn-primary flex-1 text-sm">
              {actionLoading ? 'Saving...' : 'Setup Auto-Pay'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
