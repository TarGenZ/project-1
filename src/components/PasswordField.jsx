import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({ value, onChange, placeholder = 'Password', autoComplete, className = '' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        type={visible ? 'text' : 'password'}
        required
        minLength={8}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-line/40 bg-white/5 px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet/60 focus:bg-violet/5"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70"
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
