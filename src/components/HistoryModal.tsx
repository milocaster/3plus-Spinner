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

  const exportToCSV = () => {
    if (history.length === 0) return;
    
    const headers = ['No.', 'Date', 'Time', 'Prize Name', 'Tier'];
    const rows = history.map((record, index) => {
      const date = new Date(record.timestamp);
      return [
        history.length - index,
        date.toLocaleDateString('th-TH'),
        date.toLocaleTimeString('th-TH'),
        `"${record.prizeName}"`,
        record.prizeTier
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Add BOM for UTF-8 so Excel opens Thai/special characters correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `3plus_spinner_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel list-modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2>History (Top 50)</h2>
            {history.length > 0 && (
              <button 
                onClick={exportToCSV}
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                📥 Export CSV (All {history.length})
              </button>
            )}
          </div>
          <button className="close-icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-scroll-body">
          {history.length === 0 ? (
            <p className="empty-state">No spins yet. Try your luck!</p>
          ) : (
            <ul className="history-list">
              {history.slice(0, 50).map((record, index) => {
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
