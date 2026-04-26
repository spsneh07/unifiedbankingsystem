'use client';
import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/mockData';
import { CreditCard, AlertTriangle, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';

export default function CreditCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  // Action Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'spend' | 'pay'>('spend');
  const [actionAmount, setActionAmount] = useState('');
  const [otp, setOtp] = useState('');
  const [applying, setApplying] = useState(false);

  const loadCards = () => {
    setLoading(true);
    fetch('/api/credit-cards', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setCards(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast('error', 'Failed to load credit cards');
      });
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleActionClick = (cardId: number, action: 'spend' | 'pay') => {
    setSelectedCardId(cardId);
    setActionType(action);
    setActionAmount('');
    setOtp('');
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedCardId) return;
    
    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast('error', 'Invalid amount');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: selectedCardId, action: actionType, amount, otp })
      });
      const data = await res.json();
      
      if (data.success) {
        toast('success', `${data.message} ${data.reference_id ? `(Ref: ${data.reference_id})` : ''}`);
        if (data.is_suspicious) {
          toast('error', 'Warning: High amount flagged by fraud detection.');
        }
        setModalOpen(false);
        loadCards();
      } else {
        toast('error', data.error || 'Action failed');
      }
    } catch (e) {
      toast('error', 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', card_id: 0, amount: 0 })
      });
      const data = await res.json();
      if (data.success) {
        toast('success', data.message);
        loadCards();
      } else {
        toast('error', data.error || 'Application failed');
      }
    } catch (e) {
      toast('error', 'Network error');
    } finally {
      setApplying(false);
    }
  };

  if (loading && cards.length === 0) {
    return <div className="p-6 text-black dark:text-white">Loading credit cards...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-800 text-black dark:text-white">Credit Cards</h1>
          <p className="text-[14px] text-[#8890a0] mt-1">Manage your credit lines and pay bills</p>
        </div>
        <button 
          onClick={handleApply}
          disabled={applying}
          className="btn-primary flex items-center gap-2"
        >
          {applying ? 'Applying...' : <><CreditCard size={18} /> Apply for New Card</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map(card => {
          const limit = parseFloat(card.limit_amount);
          const used = parseFloat(card.used_amount);
          const available = limit - used;
          const usagePercent = (used / limit) * 100;
          const isWarning = usagePercent > 80;

          return (
            <div key={card.id} className={`card p-6 relative overflow-hidden ${isWarning ? 'border-danger/50' : ''}`}>
              {isWarning && (
                <div className="absolute top-0 left-0 w-full h-1 bg-danger" />
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isWarning ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-700 text-[16px] text-black dark:text-white tracking-widest">
                      **** **** **** {String(card.card_number || '').slice(-4)}
                    </h3>
                    <p className="text-[12px] text-[#8890a0]">Status: <span className="capitalize">{card.status}</span></p>
                  </div>
                </div>
                {isWarning && (
                  <Badge variant="red" className="flex items-center gap-1">
                    <AlertTriangle size={12} /> High Usage
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-[#1a1d24] rounded-xl p-4">
                  <p className="text-[11px] font-600 text-[#8890a0] uppercase tracking-wider mb-1">Available Limit</p>
                  <p className="text-[20px] font-display font-700 text-accent">{formatCurrency(available)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#1a1d24] rounded-xl p-4">
                  <p className="text-[11px] font-600 text-[#8890a0] uppercase tracking-wider mb-1">Used Amount</p>
                  <p className={`text-[20px] font-display font-700 ${isWarning ? 'text-danger' : 'text-black dark:text-white'}`}>
                    {formatCurrency(used)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[12px] text-[#8890a0]">Total Limit</p>
                  <p className="text-[14px] font-600 text-black dark:text-white">{formatCurrency(limit)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[#8890a0]">Due Date</p>
                  <p className="text-[14px] font-600 text-black dark:text-white">
                    {new Date(card.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-[#1a1d24]">
                <button 
                  disabled={actionLoading || available <= 0}
                  onClick={() => handleActionClick(card.id, 'spend')}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1d24] dark:hover:bg-[#22262f] text-black dark:text-white py-2.5 rounded-lg text-sm font-600 transition-colors disabled:opacity-50"
                >
                  <ArrowUpRight size={16} className="text-danger" /> Spend
                </button>
                <button 
                  disabled={actionLoading || used <= 0}
                  onClick={() => handleActionClick(card.id, 'pay')}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-[#0a0c10] hover:bg-accent-dim py-2.5 rounded-lg text-sm font-600 transition-colors disabled:opacity-50"
                >
                  <ArrowDownRight size={16} /> Pay Bill
                </button>
              </div>
            </div>
          );
        })}

        {cards.length === 0 && !loading && (
          <div className="col-span-full card p-10 flex flex-col items-center justify-center text-center">
            <CreditCard size={40} className="text-[#3d4455] mb-4" />
            <h3 className="text-lg font-display font-700 text-black dark:text-white mb-2">No Credit Cards</h3>
            <p className="text-[#8890a0]">You don't have any active credit cards with us right now.</p>
          </div>
        )}
      </div>
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={actionType === 'spend' ? 'Card Transaction' : 'Pay Credit Card Bill'}
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${actionType === 'spend' ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
              {actionType === 'spend' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
            </div>
            <div>
              <p className="text-[13px] text-[#8890a0]">
                {actionType === 'spend' ? 'Enter amount to spend using your card' : 'Enter amount to pay towards your card bill'}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0] ml-1">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8890a0]"><IndianRupee size={20} /></span>
              <input 
                autoFocus
                className="input w-full !pl-14 h-14 text-xl font-display font-700" 
                type="number" 
                placeholder="0.00" 
                value={actionAmount}
                onChange={(e) => setActionAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0] ml-1">OTP Verification</label>
            <div className="relative">
              <input 
                className="input w-full h-14 text-xl font-display font-700" 
                type="text" 
                placeholder="Enter 6-digit OTP (mock)" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              className={`flex-1 h-12 rounded-xl font-display font-700 text-[14px] transition-all flex items-center justify-center disabled:opacity-50 ${actionType === 'spend' ? 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20' : 'bg-accent text-[#0a0c10] hover:scale-[1.02] active:scale-[0.98]'}`}
              onClick={handleSubmit}
              disabled={actionLoading || !actionAmount}
            >
              {actionLoading ? 'Processing Verification...' : actionType === 'spend' ? 'Confirm Spend' : 'Pay Bill Now'}
            </button>
            <button 
              className="px-6 h-12 rounded-xl bg-[#1a1d24] text-[#8890a0] font-display font-700 text-[14px] hover:text-white transition-colors"
              onClick={() => setModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
