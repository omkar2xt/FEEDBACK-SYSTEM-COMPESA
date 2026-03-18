import { useMemo } from "react";

function createTone(frequency: number, duration = 0.04) {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  gainNode.gain.value = 0.06;

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.stop(context.currentTime + duration);
}

export function useSound() {
  return useMemo(
    () => ({
      click: () => createTone(220),
      success: () => {
        createTone(523, 0.06);
        setTimeout(() => createTone(784, 0.08), 50);
      }
    }),
    []
  );
}
