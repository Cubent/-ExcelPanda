'use client';

import { type ReactNode, useSyncExternalStore } from 'react';

const noop = () => () => {};

/** True on macOS/iOS. Starts false on the server, then corrects after hydration. */
export function useIsMac(): boolean {
  return useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}

export function OnlyWindows({ children }: { children: ReactNode }) {
  return useIsMac() ? null : <>{children}</>;
}

export function OnlyMac({ children }: { children: ReactNode }) {
  return useIsMac() ? <>{children}</> : null;
}

/** Swap Windows key names for their Mac equivalents in plain text. */
export const macify = (text: string) => text.replace(/\bCtrl\b/g, 'Cmd').replace(/\bAlt\b/g, 'Option');

const MAC_KEYS: Record<string, string> = { Ctrl: '⌘ Cmd', Alt: '⌥ Option', Backspace: '⌫ Delete' };
export const macKey = (label: string) => MAC_KEYS[label] ?? label;
