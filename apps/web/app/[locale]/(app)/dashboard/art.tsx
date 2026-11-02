// Small illustrated figures used across the dashboard (inline SVG, no assets).
import type { CSSProperties } from 'react';

const G = '#1F4D3A'; // brand green
const L = '#C7F000'; // lime
const T = '#2A9D8F'; // teal
const A = '#F4B63F'; // amber
const C = '#E76F51'; // coral

type P = { size?: number; className?: string; style?: CSSProperties };

/** A mini spreadsheet card with a selected cell. */
export function SheetFigure({ size = 96, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" className={className} style={style} aria-hidden>
      <rect x="6" y="10" width="84" height="76" rx="12" fill="#fff" stroke={G} strokeWidth="3" />
      <path d="M6 22a12 12 0 0 1 12-12h60a12 12 0 0 1 12 12v8H6z" fill={G} />
      <path d="M34 30v56M62 30v56M6 46h84M6 62h84" stroke={G} strokeOpacity=".18" strokeWidth="2" />
      <rect x="35" y="47" width="26" height="14" fill={L} fillOpacity=".7" />
      <rect x="35" y="47" width="26" height="14" stroke={G} strokeWidth="3" />
      <rect x="58" y="58" width="6" height="6" rx="1" fill={G} />
      <circle cx="16" cy="20" r="2.5" fill={L} />
      <circle cx="25" cy="20" r="2.5" fill="#fff" fillOpacity=".5" />
    </svg>
  );
}

/** Bar chart with a rising trend line. */
export function ChartFigure({ size = 96, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" className={className} style={style} aria-hidden>
      <rect x="6" y="10" width="84" height="76" rx="12" fill="#fff" stroke={G} strokeWidth="3" />
      <rect x="18" y="52" width="13" height="26" rx="3" fill={T} />
      <rect x="37" y="40" width="13" height="38" rx="3" fill={L} stroke={G} strokeWidth="2" />
      <rect x="56" y="30" width="13" height="48" rx="3" fill={A} />
      <rect x="75" y="22" width="9" height="56" rx="3" fill={G} />
      <path d="M16 44 36 32l18-8 22-6" stroke={C} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="76" cy="18" r="4" fill={C} />
    </svg>
  );
}

/** The "fx" function badge. */
export function FxFigure({ size = 80, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} style={style} aria-hidden>
      <rect x="6" y="10" width="68" height="62" rx="16" fill={G} />
      <rect x="6" y="64" width="68" height="8" rx="4" fill="#0F2A1F" />
      <text x="40" y="52" textAnchor="middle" fontSize="30" fontWeight="800" fontStyle="italic" fontFamily="Georgia, serif" fill={L}>
        fx
      </text>
    </svg>
  );
}

/** A sigma coin, for SUM. */
export function SigmaFigure({ size = 72, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" className={className} style={style} aria-hidden>
      <circle cx="36" cy="38" r="30" fill={A} />
      <circle cx="36" cy="34" r="30" fill="#FFD266" stroke={G} strokeWidth="3" />
      <circle cx="36" cy="34" r="21" stroke={G} strokeOpacity=".25" strokeWidth="2" />
      <path d="M46 20H27l11 14-11 14h20" stroke={G} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarFigure({ size = 40, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} style={style} aria-hidden>
      <path d="m20 4 4.8 10.2 11.2 1.3-8.3 7.6 2.3 11L20 28.4 10 34.1l2.3-11L4 15.5l11.2-1.3z" fill={L} stroke={G} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export function TrophyFigure({ size = 72, className, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" className={className} style={style} aria-hidden>
      <path d="M22 12h28v20a14 14 0 0 1-28 0z" fill={A} stroke={G} strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 18h-8a6 6 0 0 0 0 12h8M50 18h8a6 6 0 0 1 0 12h-8" stroke={G} strokeWidth="3" strokeLinecap="round" />
      <path d="M36 46v10M26 60h20" stroke={G} strokeWidth="4" strokeLinecap="round" />
      <path d="M30 20v10" stroke="#fff" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PandaFigure({ size = 64, className, style }: P) {
  return (
    <img
      src="/animateos-logo (4).png"
      alt=""
      width={size}
      height={size}
      className={`rounded-2xl object-cover ${className ?? ''}`}
      style={{ width: size, height: size, ...style }}
    />
  );
}

/** Loose sparkles / dots that sit behind illustrations. */
export function Dots({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden>
      <circle cx="18" cy="24" r="4" fill={G} fillOpacity=".25" />
      <circle cx="170" cy="20" r="5" fill={G} fillOpacity=".2" />
      <circle cx="184" cy="92" r="3.5" fill={C} fillOpacity=".5" />
      <circle cx="30" cy="100" r="3" fill={T} fillOpacity=".5" />
      <path d="m100 10 2.5 5.5L108 18l-5.5 2.5L100 26l-2.5-5.5L92 18l5.5-2.5z" fill={G} fillOpacity=".3" />
      <path d="m150 100 2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" fill={A} />
    </svg>
  );
}

export const FIGURES = [SheetFigure, FxFigure, ChartFigure, SigmaFigure, StarFigure, TrophyFigure];
