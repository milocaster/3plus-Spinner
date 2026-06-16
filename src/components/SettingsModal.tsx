import React, { useState, useEffect } from 'react';
import { type Prize, type PrizeTier } from '../utils/probabilities';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  currentPrizes: Prize[];
  onSave: (newPrizes: Prize[]) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, currentPrizes, onSave, onClose }) => {
  const [localPrizes, setLocalPrizes] = useState<Prize[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Deep copy to avoid mutating original state until saved
      setLocalPrizes(JSON.parse(JSON.stringify(currentPrizes)));
    }
  }, [isOpen, currentPrizes]);

  if (!isOpen) return null;

  const handleUpdatePrize = (index: number, field: keyof Prize, value: string | number) => {
    const updated = [...localPrizes];
    updated[index] = { ...updated[index], [field]: value };
    setLocalPrizes(updated);
  };

  const handleAddPrize = () => {
    const newPrize: Prize = {
      id: `New_${Date.now()}`,
      name: 'New Prize',
      tier: 'C',
      color: '#ffffff',
      dropRate: 5,
      segmentIndex: localPrizes.length,
      quantity: -1,
    };
    setLocalPrizes([...localPrizes, newPrize]);
  };

  const handleRemovePrize = (index: number) => {
    const updated = localPrizes.filter((_, i) => i !== index);
    setLocalPrizes(updated);
  };

  const handleSave = () => {
    // Basic validation: ensure total drop rate > 0
    const totalDropRate = localPrizes.reduce((sum, p) => sum + p.dropRate, 0);
    if (totalDropRate <= 0) {
      alert("Total drop rate must be greater than 0.");
      return;
    }
    
    // Normalize segment indices just in case
    const normalized = localPrizes.map((p, index) => ({ ...p, segmentIndex: index }));
    onSave(normalized);
  };

  const handleResetData = () => {
    const confirm1 = window.confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? (Are you sure you want to delete all data?)");
    if (confirm1) {
      const confirm2 = window.confirm("🚨 คำเตือนสุดท้าย: ข้อมูลประวัติและจำนวนคงเหลือทั้งหมดจะหายไป กู้คืนไม่ได้ ยืนยันที่จะลบข้อมูลอีกครั้งหรือไม่?");
      if (confirm2) {
        // We will call a global reset function or dispatch an event, 
        // or just pass it via props. We can import resetAllData directly.
        import('../utils/storage').then(({ resetAllData }) => {
          resetAllData();
          window.location.reload();
        });
      }
    }
  };

  // Convert custom hex colors to CSS vars if they match, or just use the color directly.
  // We'll let users pick any hex color.

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Spinner Settings</h2>
          <button className="close-icon-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-scroll-body">
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Configure your prizes here. Set quantity to <strong>-1</strong> for unlimited items. 
            If a limited item reaches 0, it will automatically be removed from the wheel.
          </p>

          <div className="settings-table-container">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Prize Name</th>
                  <th>Tier</th>
                  <th>Color</th>
                  <th>Drop Rate (%)</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {localPrizes.map((prize, index) => (
                  <tr key={prize.id}>
                    <td>
                      <input 
                        type="text" 
                        className="settings-input" 
                        value={prize.name} 
                        onChange={(e) => handleUpdatePrize(index, 'name', e.target.value)} 
                      />
                    </td>
                    <td>
                      <select 
                        className="settings-input" 
                        value={prize.tier} 
                        onChange={(e) => handleUpdatePrize(index, 'tier', e.target.value as PrizeTier)}
                      >
                        <option value="C">C (Common)</option>
                        <option value="R">R (Rare)</option>
                        <option value="SR">SR (Super Rare)</option>
                        <option value="SSR">SSR</option>
                        <option value="UR">UR</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="color" 
                        className="color-input" 
                        value={prize.color.startsWith('var') ? '#ffffff' : prize.color} 
                        onChange={(e) => handleUpdatePrize(index, 'color', e.target.value)} 
                        title="If using custom theme var, picking a color overrides it."
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="0.1"
                        min="0"
                        className="settings-input" 
                        value={prize.dropRate} 
                        onChange={(e) => handleUpdatePrize(index, 'dropRate', parseFloat(e.target.value) || 0)} 
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="-1"
                        step="1"
                        className="settings-input" 
                        value={prize.quantity} 
                        onChange={(e) => handleUpdatePrize(index, 'quantity', parseInt(e.target.value) || 0)} 
                      />
                    </td>
                    <td>
                      <button className="remove-btn" onClick={() => handleRemovePrize(index)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="add-prize-btn" onClick={handleAddPrize}>
            + Add New Prize Segment
          </button>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <button 
              className="cancel-btn" 
              style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
              onClick={handleResetData}
            >
              🗑️ Reset All Data
            </button>
          </div>
          <div>
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
            <button className="save-btn" onClick={handleSave}>Save & Update Wheel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
