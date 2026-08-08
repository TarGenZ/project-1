import { Calendar, Clock, MessageCircle, CheckCircle } from 'lucide-react';
import { DAYS, SLOT_LABELS } from '../../lib/plans';

const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || '';
const WHATSAPP_DIGITS = CONTACT_PHONE.replace(/\D/g, '');

export default function PurchaseCard({ purchase: p, plan, onCompleteBooking }) {
  const isWeekly = p.weekly_day !== null && p.weekly_day !== undefined;
  const isDate = !!p.scheduled_date;
  const isAdminScheduled = plan?.schedule_type === 'admin_sets';
  const needsBooking = !isAdminScheduled && !isWeekly && !isDate;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <div className="font-display font-semibold text-white">{p.plan_name}</div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
          <CheckCircle size={11} /> active
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-sm text-white/55">
        {isDate && (
          <>
            <Calendar size={13} />
            {new Date(p.scheduled_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
            {SLOT_LABELS[p.scheduled_slot] || p.scheduled_slot}
          </>
        )}
        {isWeekly && (
          <>
            <Calendar size={13} />
            Every {DAYS[p.weekly_day]} · {SLOT_LABELS[p.weekly_slot] || p.weekly_slot}
          </>
        )}
        {isAdminScheduled && (
          <>
            <Clock size={13} /> Arpan schedules — check WhatsApp
          </>
        )}
        {needsBooking && <span className="text-amber">Pick your slot below</span>}
      </div>

      <div className="mt-3 text-sm text-white/40">
        ₹{(p.amount_paise / 100).toLocaleString('en-IN')} <span className="text-white/25">· {p.billing_period}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {needsBooking && (
          <button
            onClick={() => onCompleteBooking(p)}
            className="rounded-lg bg-violet px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-violet-soft"
          >
            Choose date &amp; slot
          </button>
        )}
        {p.zoom_join_url && (
          <a
            href={p.zoom_join_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line px-3.5 py-2 text-xs text-white/70 transition hover:border-violet/50 hover:text-white"
          >
            Join Zoom
          </a>
        )}
        {WHATSAPP_DIGITS && (
          <a
            href={`https://wa.me/${WHATSAPP_DIGITS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-xs text-white/70 transition hover:border-violet/50 hover:text-white"
          >
            <MessageCircle size={13} /> Contact Arpan
          </a>
        )}
      </div>
    </div>
  );
}
