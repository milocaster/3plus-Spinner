import React from 'react';
import { prizes } from '../utils/probabilities';

interface RatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RatesModal: React.FC<RatesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Group prizes by tier to show combined rates, or just list all items
  // Since we have multiple C's, let's list all 12 items for full transparency
  const sortedPrizes = [...prizes].sort((a, b) => a.dropRate - b.dropRate);

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel list-modal">
        <div className="modal-header">
          <h2>Drop Rates</h2>
          <button className="close-icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-scroll-body">
          <ul className="rate-list">
            {sortedPrizes.map(prize => (
              <li key={prize.id} className="rate-item" style={{ borderLeftColor: prize.color }}>
                <span className="rate-name" style={{ color: prize.color }}>{prize.name}</span>
                <span className="rate-percent">{prize.dropRate.toFixed(2)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RatesModal;
