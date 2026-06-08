import React, { useState, useEffect } from 'react';
import { setMute, setVolume, initAudio } from '../utils/audio';
import './AudioControls.css';

const AudioControls: React.FC = () => {
  const [muted, setMutedState] = useState(false);
  const [volume, setVolumeState] = useState(0.5);

  const handleMuteToggle = () => {
    initAudio(); // ensure audio ctx is started if they click mute first
    const newMuted = !muted;
    setMutedState(newMuted);
    setMute(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    initAudio(); // ensure audio ctx is started
    const newVol = parseFloat(e.target.value);
    setVolumeState(newVol);
    setVolume(newVol);
    if (muted && newVol > 0) {
      setMutedState(false);
      setMute(false);
    }
  };

  return (
    <div className="audio-controls glass-panel">
      <button className="mute-btn" onClick={handleMuteToggle}>
        {muted ? '🔇' : '🔊'}
      </button>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.05" 
        value={muted ? 0 : volume} 
        onChange={handleVolumeChange} 
        className="volume-slider"
      />
    </div>
  );
};

export default AudioControls;
