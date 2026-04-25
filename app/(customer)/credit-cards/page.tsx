'use client';
import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/mockData';
import { CreditCard, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function CreditCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

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

  const handleAction = async (cardId: number, action: 'spend' | 'pay') => {
    const amountStr = prompt(`Enter amount to ${action}:`);
    if (!amountStr) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast('error', 'Invalid amount');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, action, amount })
      });
      const data = await res.json();
      
      if (data.success) {
        toast('success', data.message);
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
                      **** **** **** {card.card_number.slice(-4)}
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
                  onClick={() => handleAction(card.id, 'spend')}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1d24] dark:hover:bg-[#22262f] text-black dark:text-white py-2.5 rounded-lg text-sm font-600 transition-colors disabled:opacity-50"
                >
                  <ArrowUpRight size={16} className="text-danger" /> Spend
                </button>
                <button 
                  disabled={actionLoading || used <= 0}
                  onClick={() => handleAction(card.id, 'pay')}
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
    </div>
  );
}
