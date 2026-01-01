import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch as AppDispatchType, RootState } from './types';

export const useAppDispatch = () => useDispatch<AppDispatchType>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type AppDispatch = AppDispatchType;

