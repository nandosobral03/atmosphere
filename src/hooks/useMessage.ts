import { useState, useCallback } from 'react';

export const useMessage = () => {
  const [message, setMessage] = useState('');

  const setMessageWithAutoDismiss = useCallback((msg: string, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), isError ? 5000 : 3000);
  }, []);

  const clearMessage = useCallback(() => setMessage(''), []);

  return {
    message,
    setMessage,
    setMessageWithAutoDismiss,
    clearMessage,
  };
};