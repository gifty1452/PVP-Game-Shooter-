/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HeroDef, KillFeedEntry, TacticalPing, WeaponDef } from '../types/game';
import { Shield, Zap, AlertTriangle, Crosshair, Bomb, Radio } from 'lucide-react';

interface HUDProps {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  weapon: WeaponDef;
  ammoInMag: number;
  reserveAmmo: number;
  isReloading: boolean;
  reloadProgress: number;
  crosshairBloom: number;
  isADS: boolean;
  isSliding: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  hitmarkerActive: boolean;
  hitmarkerIsHeadshot: boolean;
  hero: HeroDef;
  cooldownQMs: number;
  cooldownEMs: number;
  killFeed: KillFeedEntry[];
  activePings: TacticalPing[];
  bombPlanted: boolean;
  bombPlantTimer: number;
  bombSite: 'A' | 'B' | null;
  distToSiteA: number;
  distToSiteB: number;
  isPlantingBomb: boolean;
  plantProgress: number;
  isDefusingBomb: boolean;
  defuseProgress: number;
  scoreAllies: number;
  scoreEnemies: number;
  roundTimeSeconds: number;
  isPointerLocked: boolean;
  onRequestPointerLock: () => void;
  onOpenPingWheel: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  health,
  maxHealth,
  armor,
  maxArmor,
  weapon,
  ammoInMag,
  reserveAmmo,
  isReloading,
  reloadProgress,
  crosshairBloom,
  isADS,
  isSliding,
  isSprinting,
  isCrouching,
  hitmarkerActive,
  hitmarkerIsHeadshot,
  hero,
  cooldownQMs,
  cooldownEMs,
  killFeed,
  activePings,
  bombPlanted,
  bombPlantTimer,
  bombSite,
  distToSiteA,
  distToSiteB,
  isPlantingBomb,
  plantProgress,
  isDefusingBomb,
  defuseProgress,
  scoreAllies,
  scoreEnemies,
  roundTimeSeconds,
  isPointerLocked,
  onRequestPointerLock,
  onOpenPingWheel,
}) => {
  // Crosshair gap calculation
  const gapPx = Math.max(4, Math.round(7 * crosshairBloom));

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans">
      {/* 1. Pointer Lock Click Prompt if not active */}
      {!isPointerLocked && (
        <div className="absolute inset-0 pointer-events-auto bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-40">
          <div className="max-w-md w-full bg-slate-900/95 border-2 border-cyan-500/80 rounded-2xl p-6 text-center shadow-2xl shadow-cyan-500/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
              <Crosshair className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">
              Vanguard Protocol: Tactical Strike
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Simulasi tactical shooter kompetitif dengan kontrol presisi, recoil realistis, sliding fluid, dan sistem komunikasi ping.
            </p>

            <button
              onClick={onRequestPointerLock}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-cyan-500/40 cursor-pointer active:scale-98"
            >
              KLIK UNTUK MASUK MODE TEMBAK (POINTER LOCK)
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono text-left bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div><strong className="text-cyan-400">WASD:</strong> Bergerak</div>
              <div><strong className="text-cyan-400">SHIFT:</strong> Sprint Lari</div>
              <div><strong className="text-cyan-400">C / CTRL:</strong> Slide Luncur</div>
              <div><strong className="text-cyan-400">SPASI:</strong> Lompat</div>
              <div><strong className="text-cyan-400">KLIK KIRI:</strong> Tembak</div>
              <div><strong className="text-cyan-400">KLIK KANAN:</strong> ADS Bidik</div>
              <div><strong className="text-cyan-400">Q / E:</strong> Skill Hero</div>
              <div><strong className="text-cyan-400">Z:</strong> Roda Ping Taktis</div>
              <div><strong className="text-cyan-400">R:</strong> Isi Peluru</div>
              <div><strong className="text-cyan-400">F:</strong> Pasang/Defuse Bom</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Banner: Match Score, Round Timer & Bomb Status */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-950/80 border border-slate-700/80 px-6 py-2 rounded-xl backdrop-blur-md shadow-lg">
        {/* Allies Score */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-blue-400 uppercase">TIM KITA</span>
          <span className="text-2xl font-black text-white font-mono">{scoreAllies}</span>
        </div>

        {/* Center Timer & Bomb Alert */}
        <div className="px-4 border-x border-slate-800 flex flex-col items-center">
          {bombPlanted ? (
            <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
              <Bomb className="w-4 h-4 text-red-400" />
              <span className="text-base font-black font-mono">
                BOM {bombSite} DETONASI: {Math.max(0, Math.ceil(bombPlantTimer))}s
              </span>
            </div>
          ) : (
            <span className="text-xl font-black font-mono text-cyan-300">
              {Math.floor(roundTimeSeconds / 60)}:{(roundTimeSeconds % 60).toString().padStart(2, '0')}
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-mono tracking-wider">BABAK KOMPETITIF</span>
        </div>

        {/* Enemies Score */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white font-mono">{scoreEnemies}</span>
          <span className="text-xs font-mono font-bold text-red-400 uppercase">MUSUH</span>
        </div>
      </div>

      {/* 3. Top-Right: Killfeed */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 w-72">
        {killFeed.map((kf) => (
          <div
            key={kf.id}
            className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 px-3 py-1 rounded-lg text-xs font-mono backdrop-blur-xs animate-in fade-in slide-in-from-right"
          >
            <span className="text-blue-400 font-bold truncate max-w-[80px]">{kf.killerName}</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-300 px-1 bg-slate-950/60 rounded">
              <span>{kf.weaponName.split(' ')[0]}</span>
              {kf.isHeadshot && <span className="text-red-400 font-black">🎯 HEAD</span>}
            </div>
            <span className="text-red-400 font-bold truncate max-w-[80px]">{kf.victimName}</span>
          </div>
        ))}
      </div>

      {/* 4. Top-Left: Mini-Radar & Active Pings */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="w-32 h-32 rounded-2xl bg-slate-950/85 border border-cyan-500/40 p-2 relative shadow-lg">
          {/* Radar circle grid */}
          <div className="w-full h-full rounded-xl border border-cyan-500/20 relative flex items-center justify-center">
            {/* Center player indicator */}
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            <div className="absolute w-12 h-12 rounded-full border border-dashed border-cyan-500/20" />

            {/* Site A & B relative tags */}
            <div className="absolute top-2 left-2 text-[9px] font-bold font-mono text-red-400 bg-red-950/80 px-1 rounded">
              A {Math.round(distToSiteA)}m
            </div>
            <div className="absolute bottom-2 right-2 text-[9px] font-bold font-mono text-blue-400 bg-blue-950/80 px-1 rounded">
              B {Math.round(distToSiteB)}m
            </div>
          </div>
        </div>

        {/* Tactical Ping Quick Button for Touch / Mouse click */}
        <button
          onClick={onOpenPingWheel}
          className="pointer-events-auto py-1.5 px-3 rounded-lg bg-slate-900/90 border border-amber-500/50 hover:bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Ping Taktis [Z]</span>
        </button>
      </div>

      {/* 5. Center: Dynamic Crosshair & Hitmarkers */}
      {!isADS && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          {/* Center Point */}
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-xs shadow-cyan-400" />

          {/* Crosshair lines with dynamic bloom gap */}
          <div
            style={{ transform: `translateY(-${gapPx + 8}px)` }}
            className="absolute w-[2px] h-3 bg-cyan-400/90 rounded-full"
          />
          <div
            style={{ transform: `translateY(${gapPx + 8}px)` }}
            className="absolute w-[2px] h-3 bg-cyan-400/90 rounded-full"
          />
          <div
            style={{ transform: `translateX(-${gapPx + 8}px)` }}
            className="absolute h-[2px] w-3 bg-cyan-400/90 rounded-full"
          />
          <div
            style={{ transform: `translateX(${gapPx + 8}px)` }}
            className="absolute h-[2px] w-3 bg-cyan-400/90 rounded-full"
          />

          {/* Hitmarker (Diagonal Ticks) */}
          {hitmarkerActive && (
            <div className={`absolute w-8 h-8 pointer-events-none transition-all scale-110 ${hitmarkerIsHeadshot ? 'text-red-500' : 'text-white'}`}>
              <div className="absolute top-0 left-0 w-2.5 h-[2px] -rotate-45 bg-current" />
              <div className="absolute top-0 right-0 w-2.5 h-[2px] rotate-45 bg-current" />
              <div className="absolute bottom-0 left-0 w-2.5 h-[2px] rotate-45 bg-current" />
              <div className="absolute bottom-0 right-0 w-2.5 h-[2px] -rotate-45 bg-current" />
              {hitmarkerIsHeadshot && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black font-mono text-red-500">
                  HEADSHOT!
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ADS Scope Overlay (Sniper / High precision zoom) */}
      {isADS && weapon.category === 'Sniper' && (
        <div className="absolute inset-0 border-[40px] border-black/90 pointer-events-none flex items-center justify-center">
          <div className="w-full h-[1px] bg-red-500/70" />
          <div className="absolute h-full w-[1px] bg-red-500/70" />
          <div className="absolute w-36 h-36 rounded-full border border-red-500/60" />
          <div className="absolute w-72 h-72 rounded-full border border-red-500/30" />
        </div>
      )}

      {/* 6. Center Lower: Plant / Defuse Progress Bar */}
      {(isPlantingBomb || isDefusingBomb) && (
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-64 bg-slate-950/90 border border-slate-700 p-3 rounded-xl flex flex-col gap-1.5 shadow-2xl">
          <span className="text-xs font-mono font-bold text-center text-yellow-400">
            {isPlantingBomb ? 'MEMASANG BOM SPIKE...' : 'MENJINAKKAN BOM SPIKE...'}
          </span>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              style={{ width: `${(isPlantingBomb ? plantProgress : defuseProgress) * 100}%` }}
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-75"
            />
          </div>
        </div>
      )}

      {/* Bomb Action Hint */}
      {!bombPlanted && (distToSiteA < 6 || distToSiteB < 6) && !isPlantingBomb && (
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 bg-red-950/80 border border-red-500/60 px-4 py-2 rounded-xl text-red-300 font-mono text-xs flex items-center gap-2">
          <Bomb className="w-4 h-4 text-red-400" />
          <span>Tahan [F] untuk Pasang Bom di Site {distToSiteA < 6 ? 'A' : 'B'}</span>
        </div>
      )}

      {bombPlanted && !isDefusingBomb && (
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 bg-blue-950/80 border border-cyan-500/60 px-4 py-2 rounded-xl text-cyan-300 font-mono text-xs flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Tahan [F] untuk Menjinakkan Bom</span>
        </div>
      )}

      {/* 7. Bottom-Left: Vitality (Health & Armor) + Movement Badges */}
      <div className="absolute bottom-24 left-6 flex flex-col gap-2">
        {/* Dynamic Movement Badges */}
        <div className="flex items-center gap-2">
          {isSliding && (
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-black text-xs font-mono tracking-wider animate-pulse">
              SLIDING
            </span>
          )}
          {isSprinting && !isSliding && (
            <span className="px-2.5 py-0.5 rounded-md bg-blue-600/90 text-white font-bold text-xs font-mono">
              SPRINT
            </span>
          )}
          {isCrouching && !isSliding && (
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-xs font-mono border border-slate-700">
              CROUCH
            </span>
          )}
          {isADS && (
            <span className="px-2.5 py-0.5 rounded-md bg-purple-600/90 text-white font-bold text-xs font-mono">
              ADS
            </span>
          )}
        </div>

        {/* Health & Armor Bars */}
        <div className="w-64 bg-slate-950/90 border border-slate-800/90 p-3 rounded-2xl flex flex-col gap-2 shadow-xl backdrop-blur-md">
          {/* Armor */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[11px] font-mono text-blue-400 font-bold">
              <span>PERISAI (ARMOR)</span>
              <span>{armor} / {maxArmor}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${(armor / maxArmor) * 100}%` }}
                className="h-full bg-blue-500 transition-all duration-150"
              />
            </div>
          </div>

          {/* Health */}
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[11px] font-mono font-bold text-emerald-400">
              <span>KESEHATAN (HP)</span>
              <span>{health} / {maxHealth}</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${(health / maxHealth) * 100}%` }}
                className={`h-full transition-all duration-150 ${health > 35 ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 8. Bottom-Right: Weapon HUD & Ability Cooldowns */}
      <div className="absolute bottom-24 right-6 flex items-end gap-3">
        {/* Hero Role Abilities (Q & E) */}
        <div className="flex flex-col gap-2">
          {/* Skill Q */}
          <div className="w-14 h-14 rounded-xl bg-slate-950/90 border border-slate-700 p-1 flex flex-col items-center justify-between text-center shadow-lg relative overflow-hidden">
            {cooldownQMs > 0 && (
              <div
                style={{ height: `${(cooldownQMs / (hero.skillQ.cooldownSec * 1000)) * 100}%` }}
                className="absolute bottom-0 inset-x-0 bg-red-500/40"
              />
            )}
            <span className="text-[10px] font-black text-cyan-400 font-mono">[Q]</span>
            <span className="text-[10px] text-white font-bold truncate max-w-full px-0.5">
              {cooldownQMs > 0 ? `${(cooldownQMs / 1000).toFixed(1)}s` : 'SIAP'}
            </span>
          </div>

          {/* Skill E */}
          <div className="w-14 h-14 rounded-xl bg-slate-950/90 border border-slate-700 p-1 flex flex-col items-center justify-between text-center shadow-lg relative overflow-hidden">
            {cooldownEMs > 0 && (
              <div
                style={{ height: `${(cooldownEMs / (hero.skillE.cooldownSec * 1000)) * 100}%` }}
                className="absolute bottom-0 inset-x-0 bg-red-500/40"
              />
            )}
            <span className="text-[10px] font-black text-emerald-400 font-mono">[E]</span>
            <span className="text-[10px] text-white font-bold truncate max-w-full px-0.5">
              {cooldownEMs > 0 ? `${(cooldownEMs / 1000).toFixed(1)}s` : 'SIAP'}
            </span>
          </div>
        </div>

        {/* Weapon Ammo Card */}
        <div className="w-56 bg-slate-950/90 border border-slate-800/90 p-4 rounded-2xl flex flex-col justify-between shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              {weapon.category}
            </span>
            <span className="text-[10px] font-mono text-slate-400">RPM {weapon.fireRateRPM}</span>
          </div>

          <div className="text-sm font-bold text-white truncate my-1">
            {weapon.name}
          </div>

          {/* Ammo display */}
          <div className="flex items-baseline justify-between mt-1 pt-2 border-t border-slate-800">
            {isReloading ? (
              <span className="text-sm font-mono text-amber-400 animate-pulse font-bold">
                RELOADING ({Math.round(reloadProgress * 100)}%)
              </span>
            ) : (
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-3xl font-black text-white">{ammoInMag}</span>
                <span className="text-sm text-slate-500">/ {reserveAmmo}</span>
              </div>
            )}
            <span className="text-[10px] font-mono text-slate-400">[R] Reload</span>
          </div>
        </div>
      </div>
    </div>
  );
};
