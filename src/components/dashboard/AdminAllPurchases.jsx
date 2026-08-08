import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { DAYS, SLOT_LABELS } from '../../lib/plans';

export default function AdminAllPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('purchases')
      .select('*, profiles(full_name, email)')
      .eq('product', 'mentorship')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setPurchases(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />;
  }

  if (purchases.length === 0) {
    return <p className="text-sm text-white/35">No purchases yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-white/40">
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Plan</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Schedule</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id} className="border-b border-line/60 last:border-0">
              <td className="px-4 py-3 text-white/80">
                {p.profiles?.full_name || p.profiles?.email || '—'}
              </td>
              <td className="px-4 py-3 text-white">{p.plan_name}</td>
              <td className="px-4 py-3 text-white/70">₹{(p.amount_paise / 100).toLocaleString('en-IN')}</td>
              <td className="px-4 py-3 text-white/60">
                {p.scheduled_date
                  ? `${new Date(p.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${SLOT_LABELS[p.scheduled_slot] || ''}`
                  : p.weekly_day !== null && p.weekly_day !== undefined
                    ? `Every ${DAYS[p.weekly_day]} · ${SLOT_LABELS[p.weekly_slot] || ''}`
                    : <span className="text-white/30">Admin set</span>}
              </td>
              <td className="px-4 py-3">
                <span className="flex w-fit items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  <CheckCircle size={10} /> {p.status}
                </span>
              </td>
              <td className="px-4 py-3 text-white/40">
                {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
