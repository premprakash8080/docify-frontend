import { useEffect, ComponentType } from 'react';
import type { Reducer } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';
import { injectReducer } from './store';

/**
 * Higher-order component that dynamically injects a reducer into the Redux store
 * @param key - The key under which the reducer will be stored in the Redux state
 * @param reducer - The reducer function to inject
 * @returns A HOC that wraps the component
 */
function withReducer<P extends object>(
  key: string,
  reducer: Reducer<any, AnyAction>
) {
  return (WrappedComponent: ComponentType<P>) => {
    const WithReducerComponent = (props: P) => {
      useEffect(() => {
        injectReducer(key, reducer);
      }, [key]);

      return <WrappedComponent {...props} />;
    };

    WithReducerComponent.displayName = `withReducer(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithReducerComponent;
  };
}

export default withReducer;

