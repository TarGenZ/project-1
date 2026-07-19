import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { SLOT_LABELS } from '../../lib/plans';

export default function AdminBlockedSlots() {
  const [blocked, setBlocked] = useState([]);
  const [form, setForm] = useState({ blocked_date: '', slot: '', reason: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('blocked_slots')
      .select('*')
      .order('blocked_date', { ascending: true })
      .then(({ data }) => setBlocked(data || []));
  }, []);

  const add = async () => {
    if (!form.blocked_date) return;
    setSaving(true);
    const { data } = await supabase
      .from('blocked_slots')
      .insert({ blocked_date: form.blocked_date, slot: form.slot || null, reason: form.reason || null })
      .select()
      .single();
    if (data) setBlocked((b) => [...b, data]);
    setForm({ blocked_date: '', slot: '', reason: '' });
    setSaving(false);
  };

  const remove = async (id) => {
    await supabase.from('blocked_slots').delete().eq('id', id);
    setBlocked((b) => b.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div className="rounded-2xl border border-line bg-panel p-5">
        <div className="mb-3 text-sm font-semibold text-white">Block a date / slot</div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-white/45">Date</label>
            <input
              type="date"
              value={form.blocked_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm((f) => ({ ...f, blocked_date: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/45">Slot (empty = whole day)</label>
            <select
              value={form.slot}
              onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            >
              <option value="">— Entire day —</option>
              {Object.entries(SLOT_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/45">Reason (optional)</label>
            <input
              type="text"
              placeholder="e.g. Personal leave"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white placeholder:text-white/25"
            />
          </div>
        </div>
        <button
          onClick={add}
          disabled={saving}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-violet px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
        >
          <Plus size={14} /> {saving ? 'Saving…' : 'Block slot'}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {blocked.length === 0 && <p className="text-sm text-white/35">No slots blocked.</p>}
        {blocked.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3">
            <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-medium text-red-400">
              {b.slot ? 'Slot' : 'Full day'}
            </span>
            <div className="flex-1">
              <div className="text-sm text-white">
                {new Date(b.blocked_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="text-xs text-white/40">
                {b.slot ? SLOT_LABELS[b.slot] : 'Entire day blocked'}
                {b.reason ? ` · ${b.reason}` : ''}
              </div>
            </div>
            <button onClick={() => remove(b.id)} className="text-white/30 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
