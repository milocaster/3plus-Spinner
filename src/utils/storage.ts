import { type Prize } from './probabilities';

export interface SpinHistoryRecord {
  id: string; // unique timestamp + random string
  prizeName: string;
  prizeTier: string;
  prizeColor: string;
  timestamp: string;
}

const STORAGE_KEY = '3plus_spinner_history';

export const getSpinHistory = (): SpinHistoryRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to read spin history from localStorage', error);
    return [];
  }
};

export const addSpinToHistory = (prize: Prize) => {
  try {
    const history = getSpinHistory();
    
    const newRecord: SpinHistoryRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      prizeName: prize.name,
      prizeTier: prize.tier,
      prizeColor: prize.color,
      timestamp: new Date().toISOString(),
    };
    
    // Add to beginning of array
    history.unshift(newRecord);
    
    // Store up to 10000 records to prevent localStorage overflow
    if (history.length > 10000) {
      history.length = 10000;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save spin history to localStorage', error);
  }
};
