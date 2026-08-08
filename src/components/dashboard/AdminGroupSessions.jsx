import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { SLOT_LABELS } from '../../lib/plans';

export default function AdminGroupSessions() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ plan_key: 'group_session', session_date: '', session_slot: '19:00', zoom_link: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('group_sessions')
      .select('*')
      .order('session_date', { ascending: true })
      .then(({ data }) => setSessions(data || []));
  }, []);

  const add = async () => {
    if (!form.session_date || !form.session_slot) return;
    setSaving(true);
    const { data } = await supabase.from('group_sessions').insert(form).select().single();
    if (data) setSessions((s) => [...s, data]);
    setForm((f) => ({ ...f, session_date: '', zoom_link: '', notes: '' }));
    setSaving(false);
  };

  const remove = async (id) => {
    await supabase.from('group_sessions').delete().eq('id', id);
    setSessions((s) => s.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div className="rounded-2xl border border-line bg-panel p-5">
        <div className="mb-3 text-sm font-semibold text-white">Add new group session</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-white/45">Plan</label>
            <select
              value={form.plan_key}
              onChange={(e) => setForm((f) => ({ ...f, plan_key: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            >
              <option value="group_session">Group Session (single)</option>
              <option value="group_monthly">Group Monthly (recurring)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/45">Date</label>
            <input
              type="date"
              value={form.session_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm((f) => ({ ...f, session_date: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/45">Time slot</label>
            <select
              value={form.session_slot}
              onChange={(e) => setForm((f) => ({ ...f, session_slot: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white"
            >
              {Object.entries(SLOT_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/45">Zoom link</label>
            <input
              type="url"
              placeholder="https://zoom.us/j/..."
              value={form.zoom_link}
              onChange={(e) => setForm((f) => ({ ...f, zoom_link: e.target.value }))}
              className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-white placeholder:text-white/25"
            />
          </div>
        </div>
        <button
          onClick={add}
          disabled={saving}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-violet px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-soft disabled:opacity-50"
        >
          <Plus size={14} /> {saving ? 'Saving…' : 'Add session'}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {sessions.length === 0 && <p className="text-sm text-white/35">No sessions scheduled yet.</p>}
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3">
            <span className="rounded-full bg-violet/15 px-2.5 py-1 text-[11px] font-medium text-lavender">
              {s.plan_key === 'group_monthly' ? 'Monthly' : 'Single'}
            </span>
            <div className="flex-1">
              <div className="text-sm text-white">
                {new Date(s.session_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="text-xs text-white/40">
                {SLOT_LABELS[s.session_slot] || s.session_slot} {s.zoom_link && `· ${s.zoom_link}`}
              </div>
            </div>
            <button onClick={() => remove(s.id)} className="text-white/30 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
