import { type Prize } from './probabilities';
import { saveHistoryToDB, savePrizesToDB, isDatabaseConnected } from './fileDatabase';

export interface SpinHistoryRecord {
  id: string; // unique timestamp + random string
  prizeName: string;
  prizeTier: string;
  prizeColor: string;
  timestamp: string;
}

const HISTORY_STORAGE_KEY = '3plus_spinner_history';
const PRIZES_STORAGE_KEY = '3plus_spinner_prizes';

export const getSpinHistory = (): SpinHistoryRecord[] => {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load history', error);
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
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));

    if (isDatabaseConnected()) {
      saveHistoryToDB(history);
    }
  } catch (error) {
    console.error('Failed to save history', error);
  }
};

export const getPrizes = (defaultFallback: Prize[]): Prize[] => {
  try {
    const data = localStorage.getItem(PRIZES_STORAGE_KEY);
    if (data) {
      // Validate data structure lightly
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return defaultFallback;
  } catch (error) {
    console.error('Failed to load prizes', error);
    return defaultFallback;
  }
};

export const savePrizes = (prizes: Prize[]) => {
  try {
    localStorage.setItem(PRIZES_STORAGE_KEY, JSON.stringify(prizes));
  } catch (error) {
    console.error('Failed to save prizes', error);
  }
  
  if (isDatabaseConnected()) {
    savePrizesToDB(prizes);
  }
};
