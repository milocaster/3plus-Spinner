import React, { useState, useEffect } from 'react';
import './SpinnerWheel.css';
import { type Prize } from '../utils/probabilities';
import { playSpinningTicks } from '../utils/audio';

interface SpinnerWheelProps {
  activePrizes: Prize[];
  spinTrigger: number;
  targetPrize: Prize | null;
  isSpinning: boolean;
  onSpinComplete: () => void;
}

const SpinnerWheel: React.FC<SpinnerWheelProps> = ({ activePrizes, spinTrigger, targetPrize, isSpinning, onSpinComplete }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (spinTrigger > 0 && targetPrize) {
      
      // Calculate destination angle
      // 6 segments, each is 60 degrees.
      // Segment 0: 0-60
      // Segment 1: 60-120
      // Segment 2: 120-180
      // etc.
      // The pointer is at the top (0 degrees or 270 depending on how gradient is drawn).
      // Let's assume top is 0 degrees.
      // To land on segment i, we need the pointer to point to (i * 60) + 30 degrees (center of segment).
      // Since the wheel rotates, to put segment i at the top, we rotate by 360 - ((i * 60) + 30).
      
      const targetIndex = activePrizes.findIndex(p => p.id === targetPrize.id);
      if (targetIndex === -1) return; // Should not happen

      const segmentAngle = 360 / activePrizes.length;
      const targetSegmentAngle = (targetIndex * segmentAngle) + (segmentAngle / 2);
      const rotateTo = 360 - targetSegmentAngle;
      
      // Add extra spins (e.g., 5 full rotations = 1800 degrees)
      const extraSpins = 360 * 5;
      
      // We also need to add the current rotation modulo 360 to keep it spinning forward continuously
      const currentMod = rotation % 360;
      const adjustToNextZero = rotation + (360 - currentMod);
      
      const finalRotation = adjustToNextZero + extraSpins + rotateTo;
      
      setRotation(finalRotation);
      
      // Play ticking sound for the duration of the spin (5 seconds)
      playSpinningTicks(5000);
      
      // Spin takes 5 seconds (matched in CSS transition)
      const timer = setTimeout(() => {
        onSpinComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [spinTrigger]); // Intentionally only depend on spinTrigger to prevent multiple triggers

  // Generate conic gradient dynamically based on number of prizes
  const generateConicGradient = () => {
    const numSegments = activePrizes.length;
    if (numSegments === 0) return 'none';

    const segmentAngle = 360 / numSegments;
    let gradientParts: string[] = [];
    
    for (let i = 0; i < numSegments; i++) {
      const color = i % 2 === 0 ? '#1f2937' : '#111827';
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      gradientParts.push(`${color} ${startAngle}deg ${endAngle}deg`);
    }
    
    return `conic-gradient(${gradientParts.join(', ')})`;
  };

  return (
    <div className="spinner-container">
      {/* LED Border */}
      <div className="spinner-leds">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="spinner-led-wrapper" style={{ transform: `rotate(${i * 15}deg)` }}>
            <div className="spinner-led"></div>
          </div>
        ))}
      </div>

      <div className="spinner-pointer"></div>
      <div 
        className="spinner-wheel" 
        style={{ 
          background: generateConicGradient(),
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none'
        }}
      >
        <div className="spinner-inner">
          {activePrizes.map((prize, index) => {
            const segmentAngle = 360 / activePrizes.length;
            const rotationAngle = index * segmentAngle + (segmentAngle / 2);
            return (
              <div 
                key={prize.id} 
                className="spinner-segment-text"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <span className="text-content" style={{ color: prize.color }}>
                  {prize.name}
                  {prize.quantity !== -1 && (
                    <span style={{ fontSize: '0.6em', display: 'block', color: '#a1a1aa' }}>
                      ({prize.quantity} left)
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="spinner-center">
        <img 
          src="https://media.ch3plus.com/logo3plus/3pluslogo_white.svg" 
          alt="3Plus Logo" 
          className="spinner-center-logo" 
        />
      </div>
    </div>
  );
};

export default SpinnerWheel;
