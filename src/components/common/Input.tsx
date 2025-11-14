import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-ink-800 font-semibold mb-2 font-body">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border-2 border-ink-300 rounded bg-parchment-50 text-ink-800 focus:border-gold-500 focus:outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
