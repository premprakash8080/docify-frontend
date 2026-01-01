import { createContext, useContext, useEffect, useState } from 'react';
import { loaderManager } from '@/core/http';
import type { ChildrenType } from '@/types';
import Loader from '@/components/Loader';

interface LoaderContextType {
  isLoading: boolean;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const useLoaderContext = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoaderContext must be used within LoaderProvider');
  }
  return context;
};

export const LoaderProvider = ({ children }: ChildrenType) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = loaderManager.subscribe((loading) => {
      setIsLoading(loading);
    });

    return unsubscribe;
  }, []);

  return (
    <LoaderContext.Provider value={{ isLoading }}>
      {children}
      {isLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <Loader height="auto" width="auto" overlay={false} />
        </div>
      )}
    </LoaderContext.Provider>
  );
};

