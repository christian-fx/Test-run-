import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

/**
 * Hook to show toast notifications.
 * Usage: const toast = useToast();
 *        toast('Product saved!');               // success (default)
 *        toast('Something failed', 'error');     // error
 *        toast('Heads up!', 'warning');           // warning
 */
export const useToast = () => {
  const addToast = useContext(ToastContext);
  if (!addToast) throw new Error('useToast must be used within a ToastProvider');
  return addToast;
};
