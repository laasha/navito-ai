
import React, { useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { ToastAction } from '../types';

const Toast: React.FC<{ message: string, type: 'info' | 'success' | 'error', onDismiss: () => void, action?: ToastAction }> = ({ message, type, onDismiss, action }) => {
    useEffect(() => {
        const duration = action ? 6000 : 3000;
        const timer = setTimeout(() => {
            onDismiss();
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [onDismiss, action]);

    const baseClasses = 'p-3 rounded-lg shadow-lg text-white text-sm flex items-center justify-between';
    const typeClasses = {
        info: 'bg-blue-700',
        success: 'bg-green-700',
        error: 'bg-red-700',
    };

    const handleActionClick = () => {
        if(action) {
            action.onClick();
            onDismiss();
        }
    }

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <span>{message}</span>
            {action && (
                <button onClick={handleActionClick} className="ml-4 px-2 py-1 text-xs font-semibold bg-white/20 hover:bg-white/40 rounded">
                    {action.label}
                </button>
            )}
        </div>
    );
};


const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[2000] space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
          action={toast.action}
        />
      ))}
    </div>
  );
};

export default ToastContainer;