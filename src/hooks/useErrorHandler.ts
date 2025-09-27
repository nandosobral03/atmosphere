import { useState, useCallback } from "react";

interface ErrorState {
  error: Error | null;
  isLoading: boolean;
}

export const useErrorHandler = (initialLoading = false) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isLoading: initialLoading,
  });

  const clearError = useCallback(() => {
    setErrorState((prev) => ({ ...prev, error: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setErrorState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    setErrorState({ error: null, isLoading: true });

    try {
      const result = await asyncFn();
      setErrorState({ error: null, isLoading: false });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.error("Async operation failed:", errorObj);
      setErrorState({ error: errorObj, isLoading: false });
      onError?.(errorObj);
      return null;
    }
  }, []);

  return {
    error: errorState.error,
    isLoading: errorState.isLoading,
    clearError,
    setLoading,
    handleAsync,
  };
};