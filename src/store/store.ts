import { configureStore, combineReducers, type Reducer, type AnyAction } from '@reduxjs/toolkit';
import type { RootState } from './types';

// Create a function to create the root reducer with async reducers
const createRootReducer = (asyncReducers: Record<string, Reducer<any, AnyAction>> = {}) => {
  // Ensure we always have at least one reducer to avoid the warning
  if (Object.keys(asyncReducers).length === 0) {
    return (state: any = {}, _action: AnyAction) => state;
  }
  return combineReducers({
    ...asyncReducers,
  });
};

// Create the store with support for dynamic reducer injection
export const store = configureStore({
  reducer: createRootReducer(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Extend store type to support async reducers
export type StoreType = typeof store & {
  asyncReducers?: Record<string, Reducer<any, AnyAction>>;
  rootReducer?: (asyncReducers: Record<string, Reducer<any, AnyAction>>) => Reducer<RootState, AnyAction>;
};

// Add asyncReducers and rootReducer to store instance
(store as StoreType).asyncReducers = {};
(store as StoreType).rootReducer = createRootReducer;

// Function to inject async reducer
export const injectReducer = (key: string, reducer: Reducer<any, AnyAction>) => {
  const storeInstance = store as StoreType;
  
  if (storeInstance.asyncReducers && !storeInstance.asyncReducers[key]) {
    storeInstance.asyncReducers[key] = reducer;
    if (storeInstance.rootReducer) {
      storeInstance.replaceReducer(storeInstance.rootReducer(storeInstance.asyncReducers));
    }
  }
};

export default store;

