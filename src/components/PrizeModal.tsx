import React from 'react';
import './PrizeModal.css';
import { type Prize } from '../utils/probabilities';

interface PrizeModalProps {
  prize: Prize | null;
  isOpen: boolean;
  onClose: () => void;
}

const PrizeModal: React.FC<PrizeModalProps> = ({ prize, isOpen, onClose }) => {
  if (!isOpen || !prize) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ '--prize-color': prize.color } as React.CSSProperties}>
        <div className="modal-header">
          <h2>Congratulations!</h2>
        </div>
        <div className="modal-body">
          <p className="prize-label">You won</p>
          <h1 className="prize-name" style={{ color: prize.color }}>
            {prize.name}
          </h1>
          <p className="prize-tier">Tier: {prize.tier}</p>
        </div>
        <div className="modal-footer">
          <button className="claim-btn" onClick={onClose} style={{ backgroundColor: prize.color }}>
            Claim Prize
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrizeModal;
