import { Howl } from 'howler';

// Minimal synthetic UI sounds generated as base64 data URIs
// These are tiny blips/clicks that give tactile feedback

const createTone = (frequency, duration, type = 'sine', volume = 0.15) => {
  // Use Web Audio API for lightweight UI sounds
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = type;
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

// Sound effects using Web Audio API
const sounds = {
  click: () => {
    try { createTone(800, 0.05, 'sine', 0.08); } catch (e) {}
  },
  hover: () => {
    try { createTone(600, 0.03, 'sine', 0.04); } catch (e) {}
  },
  success: () => {
    try {
      createTone(523, 0.1, 'sine', 0.1);
      setTimeout(() => createTone(659, 0.1, 'sine', 0.1), 80);
      setTimeout(() => createTone(784, 0.15, 'sine', 0.1), 160);
    } catch (e) {}
  },
  error: () => {
    try {
      createTone(330, 0.15, 'square', 0.08);
      setTimeout(() => createTone(262, 0.2, 'square', 0.08), 120);
    } catch (e) {}
  },
  notification: () => {
    try {
      createTone(880, 0.08, 'sine', 0.1);
      setTimeout(() => createTone(1100, 0.12, 'sine', 0.08), 100);
    } catch (e) {}
  },
  toggle: () => {
    try { createTone(700, 0.04, 'sine', 0.06); } catch (e) {}
  },
  swoosh: () => {
    try { createTone(400, 0.08, 'sine', 0.05); } catch (e) {}
  },
  pop: () => {
    try { createTone(1000, 0.04, 'sine', 0.1); } catch (e) {}
  },
};

// Global sound enabled state
let soundEnabled = localStorage.getItem('skillswap_sounds') !== 'false';

export const isSoundEnabled = () => soundEnabled;

export const setSoundEnabled = (enabled) => {
  soundEnabled = enabled;
  localStorage.setItem('skillswap_sounds', enabled ? 'true' : 'false');
};

export const playSound = (name) => {
  if (!soundEnabled) return;
  const fn = sounds[name];
  if (fn) fn();
};

export default sounds;
