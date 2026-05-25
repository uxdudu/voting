import { useRef, useCallback } from 'react';

export function useAudio() {
  const ctxRef = useRef(null);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }

  const playTone = useCallback((frequency, duration, type = 'sine', gain = 0.3) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playSequence = useCallback((notes) => {
    const ctx = getCtx();
    let time = ctx.currentTime;
    notes.forEach(({ freq, dur, gap = 0 }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.start(time);
      osc.stop(time + dur);
      time += dur + gap;
    });
  }, []);

  return {
    beepKey: () => playTone(880, 0.08),
    beepCorrige: () => playTone(440, 0.1),
    beepEncontrado: () => playSequence([
      { freq: 660, dur: 0.1, gap: 0.02 },
      { freq: 880, dur: 0.15 },
    ]),
    beepInvalido: () => playSequence([
      { freq: 500, dur: 0.12, gap: 0.02 },
      { freq: 300, dur: 0.18 },
    ]),
    beepConfirmar: () => playSequence([
      { freq: 880, dur: 0.1, gap: 0.02 },
      { freq: 1100, dur: 0.1, gap: 0.02 },
      { freq: 1320, dur: 0.2 },
    ]),
    beepFim: () => playSequence([
      { freq: 660, dur: 0.12, gap: 0.04 },
      { freq: 880, dur: 0.12, gap: 0.04 },
      { freq: 1100, dur: 0.12, gap: 0.04 },
      { freq: 1320, dur: 0.25 },
    ]),
    beepBranco: () => playSequence([
      { freq: 700, dur: 0.1, gap: 0.03 },
      { freq: 700, dur: 0.1 },
    ]),
  };
}
