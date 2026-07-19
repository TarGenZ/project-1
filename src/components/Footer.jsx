import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-line/70 px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-start">
        <div>
          <p className="flex items-center gap-1.5 font-display text-lg font-bold text-white">
            <Zap size={16} className="text-amber" fill="currentColor" />
            Arpan<span className="text-amber">Mentors</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-white/45">
            Part of the arpansarkar.org network — NEET UG mentorship from someone who was in your
            seat one year ago.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-6 text-sm">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-white/35">Network</p>
            <ul className="space-y-1.5 text-white/60">
              <li>
                <a href="https://www.arpansarkar.org" className="hover:text-lavender">
                  arpansarkar.org
                </a>
              </li>
              <li>Resources — coming soon</li>
              <li>Cutoffs — coming soon</li>
              <li>Counselling — coming soon</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-white/35">Get in touch</p>
            <ul className="space-y-1.5 text-white/60">
              <li>
                <a href="mailto:contact@arpansarkar.org" className="hover:text-lavender">
                  contact@arpansarkar.org
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-white/35">Legal</p>
            <ul className="space-y-1.5 text-white/60">
              <li>
                <a href="https://www.arpansarkar.org/privacy" className="hover:text-lavender">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://www.arpansarkar.org/terms" className="hover:text-lavender">
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a href="https://www.arpansarkar.org/refund-policy" className="hover:text-lavender">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-white/30">
        © {new Date().getFullYear()} Arpan Sarkar. All rights reserved.
      </p>
    </footer>
  );
}
