import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'font-semibold py-2 px-4 rounded shadow transition-colors';
  const variantClasses =
    variant === 'primary'
      ? 'bg-gold-600 hover:bg-gold-700 text-parchment-50'
      : 'bg-leather-600 hover:bg-leather-700 text-parchment-50';

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
