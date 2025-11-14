import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', children, className = '', fullWidth = false, ...props }: ButtonProps) {
  const baseClasses = 'font-semibold py-2 px-4 rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses =
    variant === 'primary'
      ? 'bg-gold hover:bg-gold-dark text-ink'
      : variant === 'secondary'
      ? 'bg-leather hover:bg-leather-dark text-parchment'
      : 'bg-red-600 hover:bg-red-700 text-white';

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button className={`${baseClasses} ${variantClasses} ${widthClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Default export for backward compatibility
export default Button;
