import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Fixed top-left back button, used consistently across every non-landing,
// non-dashboard page (auth pages, legal pages, plans). Home and the
// dashboards are excluded on purpose — they're destinations in their own
// right, not steps in a flow, and the dashboards get their own dedicated
// navigation instead.
//
// Goes to real browser history when the visitor navigated here from
// somewhere inside the app; falls back to `fallback` when they landed
// directly (shared link, bookmark, fresh tab) since there's no in-app
// history to go back to. react-router sets location.key to 'default' for
// the first entry in a tab's history — that's the signal we use.
//
// Copy this file as-is into any new subdomain app, same as the other
// shared components.
export default function BackButton({ fallback = '/' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.key !== 'default';

  return (
    <button
      onClick={() => (canGoBack ? navigate(-1) : navigate(fallback))}
      aria-label="Go back"
      className="fixed left-4 top-4 z-50 flex items-center gap-1.5 rounded-full border border-line bg-panel/90 px-3 py-2 text-xs text-white/70 backdrop-blur-md transition hover:border-violet/50 hover:text-white"
    >
      <ArrowLeft size={14} /> Back
    </button>
  );
}
