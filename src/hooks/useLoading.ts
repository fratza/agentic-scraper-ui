import { useState, useCallback } from 'react';

interface UseLoadingReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R>;
}

/**
 * Custom hook for managing loading states
 *
 * @param initialState - Initial loading state (default: false)
 * @returns Object with loading state and control functions
 */
export const useLoading = (initialState: boolean = false): UseLoadingReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(
    <T extends any[], R>(asyncFn: (...args: T) => Promise<R>) =>
      async (...args: T): Promise<R> => {
        try {
          startLoading();
          const result = await asyncFn(...args);
          return result;
        } finally {
          stopLoading();
        }
      },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
};

/**
 * Hook for managing multiple loading states by key
 */
interface UseMultipleLoadingReturn {
  loadingStates: Record<string, boolean>;
  isLoading: (key: string) => boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  withLoading: <T extends any[], R>(
    key: string,
    asyncFn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R>;
}

export const useMultipleLoading = (): UseMultipleLoadingReturn => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const isLoading = useCallback((key: string): boolean => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const startLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const withLoading = useCallback(
    <T extends any[], R>(
      key: string,
      asyncFn: (...args: T) => Promise<R>
    ) => async (...args: T): Promise<R> => {
      try {
        startLoading(key);
        const result = await asyncFn(...args);
        return result;
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading]
  );

  return {
    loadingStates,
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
};

export default useLoading;
