export type PrizeTier = 'C' | 'R' | 'SR' | 'SSR' | 'UR';

export interface Prize {
  id: string;
  tier: PrizeTier;
  name: string;
  color: string;
  dropRate: number; // probability percentage (0-100)
  segmentIndex: number; // 0 to N
}

// 4 C, 3 R, 2 SR, 2 SSR, 1 UR = 12 items total
// To make it visually balanced, we will distribute them around the wheel.
export const prizes: Prize[] = [
  { id: 'C1', tier: 'C', name: 'Common 1', color: 'var(--tier-c)', dropRate: 15, segmentIndex: 0 },
  { id: 'R1', tier: 'R', name: 'Rare 1', color: 'var(--tier-r)', dropRate: 8, segmentIndex: 1 },
  { id: 'C2', tier: 'C', name: 'Common 2', color: 'var(--tier-c)', dropRate: 15, segmentIndex: 2 },
  { id: 'SR1', tier: 'SR', name: 'Super Rare 1', color: 'var(--tier-sr)', dropRate: 4, segmentIndex: 3 },
  { id: 'C3', tier: 'C', name: 'Common 3', color: 'var(--tier-c)', dropRate: 15, segmentIndex: 4 },
  { id: 'SSR1', tier: 'SSR', name: 'SSR 1', color: 'var(--tier-ssr)', dropRate: 1.5, segmentIndex: 5 },
  { id: 'R2', tier: 'R', name: 'Rare 2', color: 'var(--tier-r)', dropRate: 8, segmentIndex: 6 },
  { id: 'UR1', tier: 'UR', name: 'UR Prize', color: 'var(--tier-ur)', dropRate: 1, segmentIndex: 7 },
  { id: 'C4', tier: 'C', name: 'Common 4', color: 'var(--tier-c)', dropRate: 15, segmentIndex: 8 },
  { id: 'SR2', tier: 'SR', name: 'Super Rare 2', color: 'var(--tier-sr)', dropRate: 4, segmentIndex: 9 },
  { id: 'R3', tier: 'R', name: 'Rare 3', color: 'var(--tier-r)', dropRate: 8, segmentIndex: 10 },
  { id: 'SSR2', tier: 'SSR', name: 'SSR 2', color: 'var(--tier-ssr)', dropRate: 1.5, segmentIndex: 11 },
];

export const getRandomPrize = (): Prize => {
  // Calculate total drop rate to normalize, though it should be ~96% here, let's normalize it to whatever the total is.
  const totalDropRate = prizes.reduce((sum, p) => sum + p.dropRate, 0);
  const random = Math.random() * totalDropRate;
  let cumulative = 0;
  
  for (const prize of prizes) {
    cumulative += prize.dropRate;
    if (random <= cumulative) {
      return prize;
    }
  }
  
  return prizes[0]; // Fallback
};
