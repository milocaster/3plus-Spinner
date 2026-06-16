// Audio utility using Web Audio API and HTML5 Audio for BGM

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;
let seGainNode: GainNode | null = null;

let bgmAudio: HTMLAudioElement | null = null;

let isMuted = true;
let bgmVolume = 0.5; // 0.0 to 1.0
let seVolume = 0.5; // 0.0 to 1.0

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    seGainNode = audioCtx.createGain();
    seGainNode.connect(audioCtx.destination);
    updateVolumes();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Initialize BGM
  if (!bgmAudio) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    bgmAudio = new Audio(`${baseUrl}audio/Monster Reel Rush x Spin Vault Loop (Mashup).wav`);
    bgmAudio.loop = true;
    bgmAudio.crossOrigin = "anonymous";
    updateVolumes();
  }

  // Autoplay BGM
  if (bgmAudio.paused && !isMuted) {
    bgmAudio.play().catch(e => console.log('Autoplay prevented by browser', e));
  }
};

export const setMute = (mute: boolean) => {
  isMuted = mute;
  updateVolumes();
  
  if (bgmAudio) {
    if (mute) {
      bgmAudio.pause();
    } else {
      bgmAudio.play().catch(e => console.log('Playback prevented', e));
    }
  }
};

export const setBgmVolume = (vol: number) => {
  bgmVolume = Math.max(0, Math.min(1, vol));
  updateVolumes();
};

export const setSeVolume = (vol: number) => {
  seVolume = Math.max(0, Math.min(1, vol));
  updateVolumes();
};

const updateVolumes = () => {
  const effectiveBgmVolume = isMuted ? 0 : bgmVolume;
  const effectiveSeVolume = isMuted ? 0 : seVolume;

  if (bgmAudio) {
    bgmAudio.volume = effectiveBgmVolume;
  }

  if (seGainNode && audioCtx) {
    seGainNode.gain.setTargetAtTime(effectiveSeVolume, audioCtx.currentTime, 0.1);
  }
};

export const playTickSound = () => {
  if (!audioCtx || !seGainNode || isMuted) return;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
  
  // Tick is quite sharp, lower its relative volume
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  
  osc.connect(gainNode);
  gainNode.connect(seGainNode);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
};

export const playWinSound = (tier: string) => {
  if (!audioCtx || !seGainNode || isMuted) return;
  
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
  gainNode.connect(seGainNode);
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
