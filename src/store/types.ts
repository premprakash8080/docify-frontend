import type { AnyAction } from 'redux';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { ReturnType } from '@reduxjs/toolkit';
import { store } from './store';

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

