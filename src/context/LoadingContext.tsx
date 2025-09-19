import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loadingStates: LoadingState;
  isLoading: (key: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  withLoading: <T extends any[], R>(
    key: string,
    asyncFn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R>;
  clearAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const isLoading = useCallback((key: string): boolean => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

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

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const value: LoadingContextType = {
    loadingStates,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
    clearAllLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Convenience hooks for common loading patterns
export const useApiLoading = () => {
  const { isLoading, withLoading } = useLoading();

  return {
    isSubmitting: (operation: string) => isLoading(`submit-${operation}`),
    isFetching: (resource: string) => isLoading(`fetch-${resource}`),
    withSubmit: <T extends any[], R>(
      operation: string,
      asyncFn: (...args: T) => Promise<R>
    ) => withLoading(`submit-${operation}`, asyncFn),
    withFetch: <T extends any[], R>(
      resource: string,
      asyncFn: (...args: T) => Promise<R>
    ) => withLoading(`fetch-${resource}`, asyncFn),
  };
};

export const useFormLoading = (formName: string) => {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading();

  return {
    isSubmitting: isLoading(`form-${formName}`),
    startSubmitting: () => startLoading(`form-${formName}`),
    stopSubmitting: () => stopLoading(`form-${formName}`),
    withSubmit: <T extends any[], R>(
      asyncFn: (...args: T) => Promise<R>
    ) => withLoading(`form-${formName}`, asyncFn),
  };
};

export default LoadingContext;
