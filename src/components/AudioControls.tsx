import React, { useState } from 'react';
import { setMute, setBgmVolume, setSeVolume, initAudio } from '../utils/audio';
import './AudioControls.css';

const AudioControls: React.FC = () => {
  const [muted, setMutedState] = useState(true);
  const [bgmVol, setBgmVolState] = useState(0.5);
  const [seVol, setSeVolState] = useState(0.5);

  const handleMuteToggle = () => {
    initAudio();
    const newMuted = !muted;
    setMutedState(newMuted);
    setMute(newMuted);
  };

  const handleBgmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    initAudio();
    const newVol = parseFloat(e.target.value);
    setBgmVolState(newVol);
    setBgmVolume(newVol);
    if (muted && newVol > 0) {
      setMutedState(false);
      setMute(false);
    }
  };

  const handleSeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    initAudio();
    const newVol = parseFloat(e.target.value);
    setSeVolState(newVol);
    setSeVolume(newVol);
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
      <div className="sliders-container">
        <div className="slider-group">
          <span className="slider-label">🎵 BGM</span>
          <input 
            type="range" min="0" max="1" step="0.05" 
            value={muted ? 0 : bgmVol} 
            onChange={handleBgmChange} 
            className="volume-slider"
          />
        </div>
        <div className="slider-group">
          <span className="slider-label">🔊 SE</span>
          <input 
            type="range" min="0" max="1" step="0.05" 
            value={muted ? 0 : seVol} 
            onChange={handleSeChange} 
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
