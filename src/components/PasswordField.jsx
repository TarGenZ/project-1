import { useState } from 'react';

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
        className="w-full rounded-lg border border-line bg-base px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/30 focus:border-violet/60 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 hover:text-white/70"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
