import React, { useEffect, useState } from 'react';
import { getSpinHistory, type SpinHistoryRecord } from '../utils/storage';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<SpinHistoryRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getSpinHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel list-modal">
        <div className="modal-header">
          <h2>Last 50 Spins</h2>
          <button className="close-icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-scroll-body">
          {history.length === 0 ? (
            <p className="empty-state">No spins yet. Try your luck!</p>
          ) : (
            <ul className="history-list">
              {history.map((record, index) => {
                const date = new Date(record.timestamp);
                return (
                  <li key={record.id} className="history-item">
                    <span className="history-number">#{history.length - index}</span>
                    <div className="history-details">
                      <span className="history-name" style={{ color: record.prizeColor }}>
                        {record.prizeName}
                      </span>
                      <span className="history-time">
                        {date.toLocaleTimeString()} - {date.toLocaleDateString()}
                      </span>
                    </div>
                    <span className="history-tier" style={{ backgroundColor: record.prizeColor }}>
                      {record.prizeTier}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
