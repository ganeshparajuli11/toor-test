import { useState, useEffect } from 'react';
import Toast from './Toast';

let showToastFunction = null;

export const showToast = (message, type = 'success') => {
  if (showToastFunction) {
    showToastFunction(message, type);
  }
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastFunction = (message, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
    };

    return () => {
      showToastFunction = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
