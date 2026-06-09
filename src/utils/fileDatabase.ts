import { type Prize } from './probabilities';
import { defaultPrizes } from './probabilities';

// Store the directory handle globally in memory
let dbDirectoryHandle: FileSystemDirectoryHandle | null = null;

const BOM = '\uFEFF';

export async function connectDatabaseFolder(): Promise<boolean> {
  try {
    // @ts-ignore
    dbDirectoryHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });
    return true;
  } catch (err) {
    console.error('User cancelled or failed to connect folder', err);
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return dbDirectoryHandle !== null;
}

// ---------------------------
// PRIZES (settings.csv)
// ---------------------------

export async function loadPrizesFromDB(): Promise<Prize[]> {
  if (!dbDirectoryHandle) return defaultPrizes;
  
  try {
    const fileHandle = await dbDirectoryHandle.getFileHandle('settings.csv', { create: true });
    const file = await fileHandle.getFile();
    const text = await file.text();
    
    if (!text.trim()) {
      // Initialize file with default prizes if empty
      await savePrizesToDB(defaultPrizes);
      return defaultPrizes;
    }
    
    return parsePrizesCsv(text);
  } catch (err) {
    console.error('Failed to load prizes from DB', err);
    return defaultPrizes;
  }
}

export async function savePrizesToDB(prizes: Prize[]): Promise<void> {
  if (!dbDirectoryHandle) return;
  
  try {
    const fileHandle = await dbDirectoryHandle.getFileHandle('settings.csv', { create: true });
    // @ts-ignore
    const writable = await fileHandle.createWritable();
    await writable.write(BOM + generatePrizesCsv(prizes));
    await writable.close();
  } catch (err) {
    console.error('Failed to save prizes to DB', err);
  }
}

function parsePrizesCsv(csv: string): Prize[] {
  const lines = csv.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length <= 1) return defaultPrizes; // Only header or empty
  
  const prizes: Prize[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, ''));
    if (cols.length >= 6) {
      prizes.push({
        id: cols[0],
        tier: cols[1] as any,
        name: cols[2],
        color: cols[3],
        dropRate: parseFloat(cols[4]),
        quantity: parseInt(cols[5], 10),
        segmentIndex: i - 1
      });
    }
  }
  return prizes.length > 0 ? prizes : defaultPrizes;
}

function generatePrizesCsv(prizes: Prize[]): string {
  const header = 'ID,Tier,Name,Color,DropRate,Quantity\n';
  const rows = prizes.map(p => 
    `"${p.id}","${p.tier}","${p.name}","${p.color}",${p.dropRate},${p.quantity}`
  ).join('\n');
  return header + rows;
}

// ---------------------------
// HISTORY (history.csv)
// ---------------------------

export async function saveHistoryToDB(history: any[]): Promise<void> {
  if (!dbDirectoryHandle) return;
  
  try {
    const fileHandle = await dbDirectoryHandle.getFileHandle('history.csv', { create: true });
    // @ts-ignore
    const writable = await fileHandle.createWritable();
    await writable.write(BOM + generateHistoryCsv(history));
    await writable.close();
  } catch (err) {
    console.error('Failed to save history to DB', err);
  }
}

function generateHistoryCsv(history: any[]): string {
  const header = 'Time,Prize Name,Tier\n';
  const rows = history.map(h => 
    `"${new Date(h.timestamp).toLocaleString('th-TH')}","${h.prize.name}","${h.prize.tier}"`
  ).join('\n');
  return header + rows;
}
