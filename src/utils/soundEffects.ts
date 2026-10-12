// Web Audio API synthesizers for authentic messaging tactile feedback

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playMessageSentSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // ignore audio failures
  }
}

export function playMessageReceivedSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // First high ping
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(1046.5, now); // C6
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Second chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(1318.5, now + 0.08); // E6
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.22);
  } catch {
    // ignore
  }
}

export function playTapSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // ignore
  }
}

export function playReactionSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.16); // D6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // ignore
  }
}

export function playLongPressHaptic(): void {
  // Mobile vibration if supported
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(35);
    } catch {
      // ignore
    }
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // ignore
  }
}

export function playRecordStartSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch {
    // ignore
  }
}

export function playRecordCancelSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  } catch {
    // ignore
  }
}

/**
 * Plays a pleasant synthetic voice-note audio simulation using Web Audio API
 * Returns a cancel/stop callback function.
 */
export function playSyntheticVoiceNote(
  durationSec: number = 3,
  onEnd?: () => void
): () => void {
  const ctx = getAudioContext();
  if (!ctx) {
    if (onEnd) setTimeout(onEnd, durationSec * 1000);
    return () => {};
  }

  let isStopped = false;
  const nodesToClean: { stop?: () => void; disconnect?: () => void }[] = [];

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.09, now);
    masterGain.connect(ctx.destination);

    // Create a series of warm human-like vocal formants (carrier + modulation)
    const notes = [261.63, 329.63, 392.0, 440.0, 523.25]; // C4, E4, G4, A4, C5
    const stepDuration = 0.35;
    const steps = Math.min(Math.ceil(durationSec / stepDuration), 24);

    for (let i = 0; i < steps; i++) {
      const stepStart = now + i * stepDuration;
      const freq = notes[i % notes.length] * (1 + 0.15 * Math.sin(i * 1.3));

      const osc = ctx.createOscillator();
      const stepGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, stepStart);
      osc.frequency.linearRampToValueAtTime(freq * 1.05, stepStart + stepDuration * 0.8);

      stepGain.gain.setValueAtTime(0.001, stepStart);
      stepGain.gain.linearRampToValueAtTime(0.12, stepStart + 0.05);
      stepGain.gain.exponentialRampToValueAtTime(0.001, stepStart + stepDuration - 0.02);

      osc.connect(stepGain);
      stepGain.connect(masterGain);

      osc.start(stepStart);
      osc.stop(stepStart + stepDuration);

      nodesToClean.push(osc, stepGain);
    }

    const timer = setTimeout(() => {
      if (!isStopped && onEnd) onEnd();
    }, durationSec * 1000);

    return () => {
      isStopped = true;
      clearTimeout(timer);
      try {
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        setTimeout(() => masterGain.disconnect(), 60);
      } catch {
        // ignore
      }
    };
  } catch {
    if (onEnd) setTimeout(onEnd, durationSec * 1000);
    return () => {};
  }
}

let activeAudioStopCallbacks: (() => void)[] = [];

export function registerAudioStopCallback(stopFn: () => void): () => void {
  activeAudioStopCallbacks.push(stopFn);
  return () => {
    activeAudioStopCallbacks = activeAudioStopCallbacks.filter((fn) => fn !== stopFn);
  };
}

export function stopAllAudioPlayback(): void {
  activeAudioStopCallbacks.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
  activeAudioStopCallbacks = [];
}

/**
 * Authentic VHF Walkie-Talkie Push-to-Talk and Roger Beep sounds
 */
export function playWalkieTalkieBeep(isOpening: boolean): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isOpening) {
      // PTT Press: Quick chirp up (transmission opened)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1800, now + 0.035);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else {
      // PTT Release: Classic Roger Beep (Câmbio!)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.setValueAtTime(1350, now + 0.06);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  } catch {
    // ignore
  }
}

export function playRadioFrequencyTune(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.03);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // ignore
  }
}
