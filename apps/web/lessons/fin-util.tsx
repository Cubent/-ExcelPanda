// Shared helpers for the Excel for Finance course.
import type { Scalar } from '@/components/sheet/engine';
import { grid } from './dsl';
import type { StepCtx } from './types';

export const FIN_SHEET = { cols: 12, rows: 30 };
/** Matches a number to the nearest cent. */
export const cents = (x: number) => (v: Scalar) => typeof v === 'number' && Math.abs(v - x) < 0.006;
/** Matches a number to a given tolerance (for rates). */
export const within = (x: number, eps = 1e-4) => (v: Scalar) => typeof v === 'number' && Math.abs(v - x) < eps;
/** Labels down column A with values down column B, starting at row 1. */
export const pairs = (rows: (string | number)[][]) => grid(rows);
/** Every given cell holds a formula. */
export const allFormulas = (c: StepCtx, keys: string[]) => keys.every((k) => c.raw(k).trim().startsWith('='));
export const col = (letter: string, from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `${letter}${from + i}`);
