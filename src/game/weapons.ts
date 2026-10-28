/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeaponDef, WeaponId, WeaponSkin } from '../types/game';

export const WEAPON_REGISTRY: Record<WeaponId, WeaponDef> = {
  vk47: {
    id: 'vk47',
    name: 'VK-47 Phantom',
    category: 'Rifle',
    damageHead: 85,
    damageBody: 34,
    damageLimb: 26,
    fireRateRPM: 620,
    magSize: 30,
    reserveAmmo: 120,
    reloadTimeSec: 2.1,
    bulletSpeed: 750, // m/s
    recoilVertical: 0.042,
    recoilHorizontal: 0.018,
    recoilRecoveryRate: 4.5,
    adsFov: 52,
    adsMoveSpeedMultiplier: 0.75,
    hipfireSpread: 0.038,
    cost: 2900,
    description: 'Rifle taktis standar militer. Memiliki akurasi tembakan pertama tinggi, pola recoil vertikal dengan sedikit goyangan horizontal di peluru ke-6 ke atas.',
    recoilPattern: [
      { x: 0.0, y: 0.035 },
      { x: 0.005, y: 0.042 },
      { x: -0.008, y: 0.048 },
      { x: 0.012, y: 0.052 },
      { x: -0.015, y: 0.055 },
      { x: -0.022, y: 0.056 },
      { x: 0.018, y: 0.058 },
      { x: 0.025, y: 0.059 },
      { x: -0.012, y: 0.060 },
      { x: -0.020, y: 0.062 },
    ],
  },
  spectre9: {
    id: 'spectre9',
    name: 'Spectre-9 Tactical SMG',
    category: 'SMG',
    damageHead: 48,
    damageBody: 24,
    damageLimb: 18,
    fireRateRPM: 920,
    magSize: 32,
    reserveAmmo: 160,
    reloadTimeSec: 1.7,
    bulletSpeed: 580,
    recoilVertical: 0.028,
    recoilHorizontal: 0.024,
    recoilRecoveryRate: 6.0,
    adsFov: 58,
    adsMoveSpeedMultiplier: 0.88,
    hipfireSpread: 0.022,
    cost: 1600,
    description: 'Submachine gun berkecepatan tembak tinggi dengan mobilitas ultra-fluid. Sangat mematikan di pertempuran jarak dekat (CQB) saat run-and-slide.',
    recoilPattern: [
      { x: 0.0, y: 0.020 },
      { x: 0.008, y: 0.025 },
      { x: -0.012, y: 0.030 },
      { x: 0.016, y: 0.035 },
      { x: 0.022, y: 0.038 },
      { x: -0.018, y: 0.040 },
      { x: -0.025, y: 0.042 },
      { x: 0.015, y: 0.043 },
      { x: 0.020, y: 0.044 },
      { x: -0.015, y: 0.045 },
    ],
  },
  aegis_shotgun: {
    id: 'aegis_shotgun',
    name: 'Aegis Breacher',
    category: 'Shotgun',
    damageHead: 160, // sum of tight pellets
    damageBody: 105,
    damageLimb: 72,
    fireRateRPM: 130,
    magSize: 8,
    reserveAmmo: 32,
    reloadTimeSec: 2.6,
    bulletSpeed: 420,
    recoilVertical: 0.11,
    recoilHorizontal: 0.03,
    recoilRecoveryRate: 3.2,
    adsFov: 60,
    adsMoveSpeedMultiplier: 0.78,
    hipfireSpread: 0.065,
    cost: 1900,
    description: 'Shotgun semi-otomatis untuk mendobrak ruangan dan membersihkan sudut sempit dalam satu hentakan masif.',
    recoilPattern: [
      { x: 0.0, y: 0.09 },
      { x: 0.01, y: 0.10 },
      { x: -0.015, y: 0.11 },
      { x: 0.02, y: 0.12 },
      { x: -0.02, y: 0.12 },
      { x: 0.01, y: 0.12 },
      { x: -0.01, y: 0.13 },
      { x: 0.0, y: 0.13 },
      { x: 0.015, y: 0.13 },
      { x: -0.015, y: 0.14 },
    ],
  },
  apex_longbow: {
    id: 'apex_longbow',
    name: 'Apex Longbow .50',
    category: 'Sniper',
    damageHead: 255, // Instakill headshot
    damageBody: 125,
    damageLimb: 85,
    fireRateRPM: 55,
    magSize: 5,
    reserveAmmo: 20,
    reloadTimeSec: 3.2,
    bulletSpeed: 1100,
    recoilVertical: 0.18,
    recoilHorizontal: 0.02,
    recoilRecoveryRate: 2.0,
    adsFov: 24, // High zoom scope
    adsMoveSpeedMultiplier: 0.45,
    hipfireSpread: 0.16,
    cost: 4700,
    description: 'Sniper bolt-action presisi jarak jauh dengan penglihatan optik thermal. Memberikan eliminasi 1-peluru pada headshot di semua jarak pandang.',
    recoilPattern: [
      { x: 0.0, y: 0.16 },
      { x: 0.01, y: 0.18 },
      { x: -0.01, y: 0.19 },
      { x: 0.015, y: 0.20 },
      { x: -0.015, y: 0.21 },
      { x: 0.02, y: 0.22 },
      { x: -0.02, y: 0.22 },
      { x: 0.01, y: 0.23 },
      { x: -0.01, y: 0.23 },
      { x: 0.0, y: 0.24 },
    ],
  },
  viper5: {
    id: 'viper5',
    name: 'Viper-5 Tactical Pistol',
    category: 'Pistol',
    damageHead: 65,
    damageBody: 28,
    damageLimb: 20,
    fireRateRPM: 420,
    magSize: 15,
    reserveAmmo: 60,
    reloadTimeSec: 1.4,
    bulletSpeed: 620,
    recoilVertical: 0.025,
    recoilHorizontal: 0.012,
    recoilRecoveryRate: 7.0,
    adsFov: 62,
    adsMoveSpeedMultiplier: 0.95,
    hipfireSpread: 0.018,
    cost: 0, // Default free sidearm
    description: 'Pistol cadangan dengan respon picu kilat. Sangat akurat untuk tembakan cepat saat senjata utama habis amunisi.',
    recoilPattern: [
      { x: 0.0, y: 0.02 },
      { x: 0.005, y: 0.025 },
      { x: -0.006, y: 0.028 },
      { x: 0.008, y: 0.03 },
      { x: -0.008, y: 0.032 },
      { x: 0.01, y: 0.034 },
      { x: -0.01, y: 0.035 },
      { x: 0.005, y: 0.036 },
      { x: -0.005, y: 0.037 },
      { x: 0.0, y: 0.038 },
    ],
  },
};

// Calculate Time-to-Kill (TTK) in seconds against 100 HP + 50 Armor (150 Total EHP)
export function calculateTTK(weapon: WeaponDef, hitType: 'head' | 'body' | 'mixed'): { shotsToKill: number; ttkSeconds: number } {
  const targetEHP = 150;
  let dmgPerShot = weapon.damageBody;
  if (hitType === 'head') {
    dmgPerShot = weapon.damageHead;
  } else if (hitType === 'mixed') {
    // 1 headshot + rest bodyshots
    const headDmg = weapon.damageHead;
    const remainingHp = targetEHP - headDmg;
    if (remainingHp <= 0) {
      return { shotsToKill: 1, ttkSeconds: 0 };
    }
    const additionalShots = Math.ceil(remainingHp / weapon.damageBody);
    const totalShots = 1 + additionalShots;
    const shotInterval = 60 / weapon.fireRateRPM;
    return { shotsToKill: totalShots, ttkSeconds: Math.round((totalShots - 1) * shotInterval * 100) / 100 };
  }

  const shotsToKill = Math.ceil(targetEHP / dmgPerShot);
  const shotInterval = 60 / weapon.fireRateRPM;
  const ttkSeconds = Math.round((shotsToKill - 1) * shotInterval * 100) / 100;
  return { shotsToKill, ttkSeconds };
}

// 100% Free / Skill-Earned Mastery Weapon Skins (Anti Pay-to-Win)
export const WEAPON_MASTERY_SKINS: WeaponSkin[] = [
  {
    id: 'vk_standard',
    weaponId: 'vk47',
    name: 'Tactical Matte Black',
    rarity: 'Common',
    colorHex: '#1e242b',
    accentHex: '#4a5568',
    metalness: 0.5,
    roughness: 0.4,
    unlockRequirement: 'Senjata Bawaan (Terbuka)',
    isUnlocked: true,
  },
  {
    id: 'vk_obsidian',
    weaponId: 'vk47',
    name: 'Carbon Obsidian',
    rarity: 'Rare',
    colorHex: '#111317',
    accentHex: '#00f0ff',
    metalness: 0.9,
    roughness: 0.2,
    glowHex: '#00f0ff',
    unlockRequirement: 'Raih 15 Headshot Kill dengan VK-47',
    isUnlocked: true,
  },
  {
    id: 'vk_damascus',
    weaponId: 'vk47',
    name: 'Damascus Gold Matrix',
    rarity: 'Legendary',
    colorHex: '#d4af37',
    accentHex: '#ffffff',
    metalness: 0.95,
    roughness: 0.15,
    glowHex: '#ffd700',
    unlockRequirement: 'Raih Rank Gold atau 50 Kill Kompetitif',
    isUnlocked: false,
  },
  {
    id: 'smg_cyber',
    weaponId: 'spectre9',
    name: 'Cyberpunk Neon',
    rarity: 'Epic',
    colorHex: '#2b0938',
    accentHex: '#ff007f',
    metalness: 0.7,
    roughness: 0.3,
    glowHex: '#ff007f',
    unlockRequirement: 'Lakukan 5 Kali Slide-Kill di TDM',
    isUnlocked: true,
  },
  {
    id: 'sniper_void',
    weaponId: 'apex_longbow',
    name: 'Prismatic Void',
    rarity: 'Legendary',
    colorHex: '#0d1b2a',
    accentHex: '#7b2cbf',
    metalness: 0.85,
    roughness: 0.2,
    glowHex: '#9d4edd',
    unlockRequirement: 'Eliminasi musuh dari jarak > 40 meter',
    isUnlocked: false,
  },
];
