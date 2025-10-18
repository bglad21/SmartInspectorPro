/**
 * Typed Redux Hooks for Smart Inspector Pro
 * 
 * Pre-typed versions of useDispatch and useSelector hooks
 * for use throughout the application.
 * 
 * Usage:
 * ```typescript
 * import { useAppDispatch, useAppSelector } from '@/redux/hooks';
 * 
 * const dispatch = useAppDispatch();
 * const user = useAppSelector(selectUser);
 * ```
 * 
 * @module redux/hooks
 */

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Typed useDispatch hook
 * Use throughout app instead of plain `useDispatch`
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed useSelector hook
 * Use throughout app instead of plain `useSelector`
 */
export const useAppSelector = useSelector.withTypes<RootState>();
