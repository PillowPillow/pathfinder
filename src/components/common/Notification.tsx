import React from 'react';

interface NotificationProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
}

export default function Notification({ type, message, onClose }: NotificationProps) {
  const colors = {
    info: 'bg-blue-100 border-blue-400 text-blue-800',
    success: 'bg-green-100 border-green-400 text-green-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    error: 'bg-red-100 border-red-400 text-red-800',
  };

  return (
    <div className={`border-l-4 p-4 rounded shadow-md ${colors[type]} mb-4`} role="alert">
      <div className="flex justify-between items-center">
        <p className="font-body">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-xl font-bold hover:opacity-75 transition-opacity"
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
