// Audio utility using Web Audio API and HTML5 Audio for BGM

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

let bgmAudio: HTMLAudioElement | null = null;
let bgmSourceNode: MediaElementAudioSourceNode | null = null;

let isMuted = false;
let currentVolume = 0.5; // 0.0 to 1.0

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    updateVolume();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Initialize BGM
  if (!bgmAudio) {
    bgmAudio = new Audio('/audio/Monster Reel Rush x Spin Vault Loop (Mashup).wav');
    bgmAudio.loop = true;
    bgmAudio.crossOrigin = "anonymous"; // Needed if served from different origin, good practice
    
    // Connect to Web Audio API
    if (audioCtx && masterGain) {
      bgmSourceNode = audioCtx.createMediaElementSource(bgmAudio);
      bgmSourceNode.connect(masterGain);
    }
  }

  // Autoplay BGM
  if (bgmAudio.paused && !isMuted) {
    bgmAudio.play().catch(e => console.log('Autoplay prevented by browser', e));
  }
};

export const setMute = (mute: boolean) => {
  isMuted = mute;
  updateVolume();
  
  if (bgmAudio) {
    if (mute) {
      bgmAudio.pause();
    } else {
      bgmAudio.play().catch(e => console.log('Playback prevented', e));
    }
  }
};

export const setVolume = (vol: number) => {
  currentVolume = Math.max(0, Math.min(1, vol));
  updateVolume();
};

const updateVolume = () => {
  if (masterGain && audioCtx) {
    const effectiveVolume = isMuted ? 0 : currentVolume;
    // Use exponential ramp for smoother volume changes, or set value directly
    masterGain.gain.setTargetAtTime(effectiveVolume, audioCtx.currentTime, 0.1);
  }
};

export const playTickSound = () => {
  if (!audioCtx || !masterGain || isMuted) return;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
  
  // Tick is quite sharp, lower its relative volume
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  
  osc.connect(gainNode);
  gainNode.connect(masterGain);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
};

export const playWinSound = (tier: string) => {
  if (!audioCtx || !masterGain || isMuted) return;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'square';
  
  if (['SR', 'SSR', 'UR'].includes(tier)) {
    // Epic win sound
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(1600, audioCtx.currentTime + 0.6);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.0);
  } else {
    // Normal win sound
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  }
  
  osc.connect(gainNode);
  gainNode.connect(masterGain);
};

// We can simulate ticking by setting an interval that gradually slows down
export const playSpinningTicks = (durationMs: number) => {
  if (!audioCtx || isMuted) return;
  
  let currentDelay = 50; // start fast
  const maxDelay = 400; // slow down to this
  let elapsed = 0;
  
  const tick = () => {
    if (elapsed >= durationMs) return;
    
    playTickSound();
    
    // Increase delay based on how much time has passed
    const progress = elapsed / durationMs;
    // Cubic easing out for delay
    currentDelay = 50 + (maxDelay - 50) * Math.pow(progress, 3);
    
    elapsed += currentDelay;
    
    if (elapsed < durationMs) {
      setTimeout(tick, currentDelay);
    }
  };
  
  tick();
};
