// src/constants/index.ts

export type EnhancementLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const ENHANCEMENT_RATES: Record<EnhancementLevel, { success: number; destroy: number; degrade: number }> = {
  0: { success: 95, destroy: 0, degrade: 2.5 },
  1: { success: 85, destroy: 0, degrade: 7.5 },
  2: { success: 75, destroy: 0, degrade: 12.5 },
  3: { success: 65, destroy: 0, degrade: 17.5 },
  4: { success: 55, destroy: 0, degrade: 22.5 },
  5: { success: 45, destroy: 27.5, degrade: 27.5 },
  6: { success: 35, destroy: 32.5, degrade: 32.5 },
  7: { success: 25, destroy: 37.5, degrade: 37.5 },
  8: { success: 15, destroy: 42.5, degrade: 42.5 },
  9: { success: 10, destroy: 45, degrade: 45 },
  10: { success: 5, destroy: 47.5, degrade: 47.5 },
  11: { success: 5, destroy: 47.5, degrade: 47.5 },
  12: { success: 0, destroy: 0, degrade: 0 }
} as const;

export const STONE_TYPES = {
  normal: {
    name: '강화석',
    cost: 5000,
    successBonus: 0,
    materials: { iron: 3, blackIron: 1, specialIron: 1, lapis: 5 }
  },
  advanced: {
    name: '상급 강화석',
    cost: 10000,
    successBonus: 5,
    materials: { iron: 3, blackIron: 1, specialIron: 1, lapis: 5 }
  },
  supreme: {
    name: '고급 강화석',
    cost: 20000,
    successBonus: 10,
    materials: { iron: 3, blackIron: 1, specialIron: 1, lapis: 5 }
  }
} as const;

export const WEAPON_NAMES: Record<string, string> = {
  bow: '활',
  sword: '검',
  spear: '창',
  dagger: '단검',
  fan: '부채'
};

export const WEAPON_STATS = {
  base: 5,
  enhancement: {
    1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1,
    8: 2, 9: 2, 10: 2, 11: 3, 12: 3
  }
} as const;