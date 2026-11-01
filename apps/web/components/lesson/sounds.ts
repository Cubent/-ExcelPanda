// Tiny synthesized sound effects (Web Audio). No asset files needed.
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, vol = 0.14, type: OscillatorType = 'triangle') {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Short rising two-note chime when a step is solved. */
export function playSuccess() {
  tone(659.25, 0, 0.18); // E5
  tone(880, 0.09, 0.3); // A5
  tone(1318.5, 0.09, 0.3, 0.05, 'sine');
}

/** Soft tick when moving to the next step. */
export function playNext() {
  tone(520, 0, 0.08, 0.07, 'sine');
}

/** Little fanfare when the lesson is finished. */
export function playComplete() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.35));
  tone(1318.5, 0.5, 0.7, 0.12);
  tone(1046.5, 0.5, 0.7, 0.08, 'sine');
}
