import { useState } from 'react';
import { Calendar, Copy, Check } from 'lucide-react';

export default function SessionInstanceRow({ instance, showLink = false }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(instance.zoomJoinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail on non-secure contexts or older browsers —
      // fall back to a manual select so the user can still copy by hand.
      window.prompt('Copy this link:', instance.zoomJoinUrl);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet/15 text-lavender">
          <Calendar size={14} />
        </div>
        <div>
          <div className="text-sm text-white">{instance.label}</div>
          <div className="text-xs text-white/40">
            {instance.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
            {instance.slotLabel}
          </div>
        </div>
      </div>
      {/* Meeting link only ever surfaces for today's sessions — upcoming and
          past rows intentionally never show Join/Copy, even if a link
          exists on the record, to keep it from being clicked early/late. */}
      {showLink &&
        (instance.zoomJoinUrl ? (
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              title="Copy meeting link"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-white/50 transition hover:border-violet/50 hover:text-white"
            >
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
            <a
              href={instance.zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line px-3 py-1.5 text-xs text-white/70 transition hover:border-violet/50 hover:text-white"
            >
              Join Zoom
            </a>
          </div>
        ) : (
          instance.isGroup && (
            <span className="rounded-lg border border-dashed border-line px-3 py-1.5 text-xs text-white/30">
              Link coming soon
            </span>
          )
        ))}
    </div>
  );
}
