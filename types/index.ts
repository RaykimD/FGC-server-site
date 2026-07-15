// src/types/index.ts
export type Weapon = {
  id: string; type: string; enhancement: number; createdAt: number;
};

export type EnhanceLog = {
  type: 'success' | 'degrade' | 'maintain' | 'destroy';
  weaponType?: string; armorType?: string;
  enhancement: number; timestamp: number;
};

export type UsedResources = {
  stones: { normal: number; advanced: number; supreme: number; };
  materials: { iron: number; blackIron: number; specialIron: number; lapis: number; };
  money: number;
};

// 💡 통계를 위한 타입 세분화 (유지, 하락 추가)
export type Stats = {
  totalAttempts: number;
  successes: number;
  maintains: number;
  degrades: number;
  destroys: number; 
  maxEnhance: number;
};

export type ArmorType = 'helmet' | 'armor' | 'belt' | 'shoes';

export type ArmorStats = {
  health: number; innerForce: number; luck: number;
  attackSpeed: number; evasion: number; attack: number;
};

export type PotentialOption = {
  type: 'recovery' | 'evasion' | 'criticalChance' | 'criticalDamage' | 'bossDamage' | 'attackSpeed' | 'health' | 'luck';
  value: number;
};

export type Armor = {
  type: ArmorType; enhancement: number;
  baseStats: ArmorStats; enhanceStats: ArmorStats; potentials: PotentialOption[];
};