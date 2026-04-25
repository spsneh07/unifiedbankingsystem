'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type ScoreData = {
  score: number;
  loan_repayment_factor: number;
  credit_usage_factor: number;
  missed_payments_factor: number;
};

type ScoreTier = {
  label: string;
  color: string;
  ring: string;
  bg: string;
  barColor: string;
};

function getTier(score: number): ScoreTier {
  if (score >= 750) return {
    label: 'Excellent',
    color: 'text-[#00d4aa]',
    ring: 'ring-[#00d4aa]',
    bg: 'bg-[#00d4aa]/10',
    barColor: '#00d4aa',
  };
  if (score >= 600) return {
    label: 'Good',
    color: 'text-[#f5c542]',
    ring: 'ring-[#f5c542]',
    bg: 'bg-[#f5c542]/10',
    barColor: '#f5c542',
  };
  return {
    label: 'Risky',
    color: 'text-[#f05050]',
    ring: 'ring-[#f05050]',
    bg: 'bg-[#f05050]/10',
    barColor: '#f05050',
  };
}

function FactorRow({ label, value }: { label: string; value: number }) {
  const isPos = value > 0;
  const isNeg = value < 0;
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#8890a0]">{label}</span>
      <span className={`flex items-center gap-1 font-600 ${isPos ? 'text-[#00d4aa]' : isNeg ? 'text-[#f05050]' : 'text-[#8890a0]'}`}>
        {isPos ? <TrendingUp size={12} /> : isNeg ? <TrendingDown size={12} /> : <Minus size={12} />}
        {isPos ? '+' : ''}{value}
      </span>
    </div>
  );
}

export default function CreditScoreWidget() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/credit-score')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="card p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-[#1a1d24] rounded w-1/2 mb-4" />
      <div className="h-20 bg-gray-200 dark:bg-[#1a1d24] rounded-full w-20 mx-auto" />
    </div>
  );

  if (!data || !data.score) return null;

  const tier = getTier(data.score);
  const pct = ((data.score - 300) / 600) * 100;
  const r = 40, cx = 56, cy = 56;
  const circ = Math.PI * r; // half-circle arc
  const strokeDash = (pct / 100) * circ;

  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-700 text-[15px] text-black dark:text-white">Credit Score</h3>
        <ShieldCheck size={18} className={tier.color} />
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-28 h-16 overflow-hidden">
          <svg width="112" height="64" viewBox="0 0 112 64" className="overflow-visible">
            {/* Background track (half circle) */}
            <path
              d="M 16 56 A 40 40 0 0 1 96 56"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              className="text-gray-200 dark:text-[#1a1d24]"
            />
            {/* Score arc */}
            <path
              d="M 16 56 A 40 40 0 0 1 96 56"
              fill="none"
              stroke={tier.barColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circ}`}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          {/* Score number centered */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <span className={`text-[22px] font-display font-800 leading-none ${tier.color}`}>{data.score}</span>
          </div>
        </div>

        <span className={`text-[11px] font-700 uppercase tracking-widest px-3 py-1 rounded-full ${tier.bg} ${tier.color}`}>
          {tier.label}
        </span>
        <p className="text-[11px] text-[#8890a0] text-center">Score range: 300 – 900</p>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-2 border-t border-gray-200 dark:border-[#1a1d24] pt-4">
        <p className="text-[11px] font-600 uppercase tracking-wider text-[#8890a0] mb-3">Factor Breakdown</p>
        <FactorRow label="Loan Repayment" value={data.loan_repayment_factor} />
        <FactorRow label="Credit Utilization" value={data.credit_usage_factor} />
        <FactorRow label="Missed Payments" value={data.missed_payments_factor} />
        <div className="flex items-center justify-between text-[13px] pt-2 border-t border-gray-200 dark:border-[#1a1d24] mt-2">
          <span className="text-[#8890a0]">Base Score</span>
          <span className="font-600 text-black dark:text-white">700</span>
        </div>
      </div>
    </div>
  );
}
