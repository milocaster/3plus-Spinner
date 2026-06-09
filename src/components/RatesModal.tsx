import React from 'react';
import { type Prize } from '../utils/probabilities';

interface RatesModalProps {
  isOpen: boolean;
  prizes: Prize[];
  onClose: () => void;
}

const RatesModal: React.FC<RatesModalProps> = ({ isOpen, prizes, onClose }) => {
  if (!isOpen) return null;

  // Need to filter active ones and calculate dynamic percentages
  const activePrizes = prizes.filter(p => p.quantity !== 0);
  const totalDropRate = activePrizes.reduce((sum, p) => sum + p.dropRate, 0);

  const sortedPrizes = [...activePrizes].sort((a, b) => a.dropRate - b.dropRate);

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel list-modal">
        <div className="modal-header">
          <h2>Drop Rates</h2>
          <button className="close-icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-scroll-body">
          <ul className="rate-list">
            {sortedPrizes.map(prize => {
              const percentage = totalDropRate > 0 ? ((prize.dropRate / totalDropRate) * 100).toFixed(2) : '0.00';
              return (
                <li key={prize.id} className="rate-item" style={{ borderLeftColor: prize.color }}>
                  <span className="rate-name" style={{ color: prize.color }}>{prize.name}</span>
                  <span className="rate-percent">{percentage}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RatesModal;
