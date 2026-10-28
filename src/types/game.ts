/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeaponId = 'vk47' | 'spectre9' | 'aegis_shotgun' | 'apex_longbow' | 'viper5';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  category: 'Rifle' | 'SMG' | 'Shotgun' | 'Sniper' | 'Pistol';
  damageHead: number;
  damageBody: number;
  damageLimb: number;
  fireRateRPM: number; // rounds per minute
  magSize: number;
  reserveAmmo: number;
  reloadTimeSec: number;
  bulletSpeed: number; // m/s
  recoilVertical: number; // upward kick per shot
  recoilHorizontal: number; // sway deviation
  recoilRecoveryRate: number; // recovery speed
  adsFov: number; // zoomed FOV (degrees)
  adsMoveSpeedMultiplier: number;
  hipfireSpread: number;
  cost: number; // for tactical buy round (in-game credits)
  description: string;
  recoilPattern: { x: number; y: number }[]; // 10-shot recoil track
}

export type HeroRoleId = 'assault' | 'sentinel' | 'recon' | 'support';

export interface HeroDef {
  id: HeroRoleId;
  name: string;
  roleName: string;
  tagline: string;
  color: string;
  accentColor: string;
  description: string;
  passiveDesc: string;
  skillQ: {
    name: string;
    description: string;
    cooldownSec: number;
    icon: string;
  };
  skillE: {
    name: string;
    description: string;
    cooldownSec: number;
    icon: string;
  };
}

export type GameModeId = 'bomb_defusal' | 'tdm' | 'battle_royale' | 'firing_range';

export interface GameModeDef {
  id: GameModeId;
  name: string;
  tagline: string;
  roundTimeSec: number;
  scoreLimit: number;
  description: string;
  icon: string;
}

export type PingType = 'danger' | 'defend' | 'push' | 'help' | 'loot';

export interface TacticalPing {
  id: string;
  type: PingType;
  position: [number, number, number]; // x, y, z
  label: string;
  senderName: string;
  color: string;
  createdAt: number; // ms
  durationMs: number;
}

export interface PlayerStats {
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  damageDealt: number;
  plants: number;
  defuses: number;
  combatScore: number;
}

export interface KillFeedEntry {
  id: string;
  killerName: string;
  killerRole: HeroRoleId;
  victimName: string;
  victimRole: HeroRoleId;
  weaponName: string;
  isHeadshot: boolean;
  time: number;
}

export interface RankedTier {
  name: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Immortal' | 'Radiant';
  division: 1 | 2 | 3;
  minMMR: number;
  maxMMR: number;
  badgeColor: string;
  glowColor: string;
}

export interface AntiCheatMetrics {
  recoilConsistencyScore: number; // 0-100 (too close to 100 without jitter is flagged)
  mouseInputEntropy: number; // human jitter measurement
  hitboxAngleValidationRate: number; // 100% valid
  pingLatencyMs: number;
  tickRateHz: number;
  isVerifiedFair: boolean;
  activeViolations: string[];
}

export interface WeaponSkin {
  id: string;
  weaponId: WeaponId;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  colorHex: string;
  accentHex: string;
  metalness: number;
  roughness: number;
  glowHex?: string;
  unlockRequirement: string;
  isUnlocked: boolean;
}
